import React, { useState, useRef } from 'react';
import { Plus, Search, Trash2, Edit, FileSpreadsheet, Image as ImageIcon } from 'lucide-react';
import { createPortal } from 'react-dom';
import * as XLSX from 'xlsx';
import ConfirmDialog from '../components/ConfirmDialog';

const AdminInventory = ({ books, setBooks, deleteItem, categories, resourceTypes }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    editorial: '',
    description: '',
    category: '',
    total_count: 1,
    type: '',
    institutionalType: 'MANUAL',
    typeCode: '001',
    categoryCode: '001',
    itemCode: '001',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400'
  });

  const getBaseCode = (item) => {
    const t = (item.typeCode || '001').padStart(3, '0');
    const c = (item.categoryCode || '001').padStart(3, '0');
    const i = (item.itemCode || '001').padStart(3, '0');
    return `${t}${c}${i}`;
  };

  const getFullCodeRange = (item) => {
    const base = getBaseCode(item);
    const start = parseInt(item.itemCode || '1');
    const total = parseInt(item.total_count) || 1;
    if (total > 1) {
      const end = start + total - 1;
      const endStr = String(end).padStart(3, '0');
      return `${base} - ${endStr}`;
    }
    return base;
  };

  const checkCodeOverlap = (newItem, items) => {
    const newStart = parseInt(newItem.itemCode);
    const newEnd = newStart + (parseInt(newItem.total_count) || 1) - 1;
    
    for (const item of items) {
      if (item.id === newItem.id) continue;
      
      // Only check overlap if Type and Category codes are the same
      if (item.typeCode === newItem.typeCode && item.categoryCode === newItem.categoryCode) {
        const itemStart = parseInt(item.itemCode);
        const itemEnd = itemStart + (parseInt(item.total_count) || 1) - 1;
        
        if (newStart <= itemEnd && newEnd >= itemStart) {
          return item; // Overlap found
        }
      }
    }
    return null;
  };

  const handleOpenModal = (book = null) => {
    if (book) {
      setEditingBook(book);
      setFormData({
        ...book,
        editorial: book.editorial || '',
        institutionalType: book.institutionalType || 'MANUAL'
      });
    } else {
      setEditingBook(null);
      // Default to first type and first category
      const defaultType = resourceTypes?.[0] || { id: 'book', name: 'Libro', code: '001' };
      const defaultCat = categories?.[0] || { id: 'default', name: 'General', code: '001' };
      
      // Find next itemCode for this specific Type+Category
      const sameGroupItems = books.filter(b => b.typeCode === defaultType.code && b.categoryCode === defaultCat.code);
      const lastCode = sameGroupItems.reduce((acc, b) => {
        const start = parseInt(b.itemCode) || 0;
        const count = parseInt(b.total_count) || 1;
        return Math.max(acc, start + count - 1);
      }, 0);

      setFormData({
        title: '',
        author: '',
        editorial: '',
        description: '',
        category: defaultCat.name,
        total_count: 1,
        type: defaultType.id,
        institutionalType: 'MANUAL',
        typeCode: defaultType.code,
        categoryCode: defaultCat.code,
        itemCode: String(lastCode + 1).padStart(3, '0'),
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    // Validation
    const overlapItem = checkCodeOverlap({...formData, id: editingBook?.id}, books);
    if (overlapItem) {
      alert(`⚠️ ERROR: Los códigos seleccionados se solapan con "${overlapItem.title}" (${getFullCodeRange(overlapItem)}).\n\nPor favor, ajusta el número de item o reduce la cantidad.`);
      return;
    }

    if (editingBook) {
      setBooks(books.map(b => b.id === editingBook.id ? { ...formData, available_count: b.available_count + (formData.total_count - b.total_count) } : b));
    } else {
      setBooks([...books, { ...formData, id: Date.now(), available_count: formData.total_count }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDelete = () => {
    deleteItem(deleteConfirm.id);
    setDeleteConfirm({ isOpen: false, id: null });
  };

  const handleDeleteAll = () => {
    setDeleteAllConfirm(true);
  };

  const confirmDeleteAll = () => {
    // Delete one by one through the prop or provide a bulk delete if available
    books.forEach(b => deleteItem(b.id));
    setBooks([]);
    setDeleteAllConfirm(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          alert("El archivo está vacío.");
          setIsImporting(false);
          return;
        }

        const newBooksList = [...books];
        let importedCount = 0;

        const normalizeStr = (s) => 
          String(s || '').toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Accents
            .replace(/[^a-z0-9]/g, '').trim(); // Only alphanumeric

        jsonData.forEach((row, index) => {
          // Normalize row keys - very flexible
          const allRowKeys = Object.keys(row);
          const getVal = (aliases) => {
            const targetAliases = aliases.map(a => normalizeStr(a));
            const foundKey = allRowKeys.find(rk => {
              const nrk = normalizeStr(rk);
              return targetAliases.some(alias => nrk === alias || nrk.includes(alias));
            });
            return foundKey ? row[foundKey] : null;
          };

          // Try to get title with many aliases
          let title = getVal(['Título', 'Titulo', 'Title', 'Nombre', 'Libro', 'Manual', 'Equipo', 'Producto', 'Item', 'Ejemplar', 'Descripcion']);
          
          // Fallback: if we found nothing but there is data, use the first column
          if (!title && Object.keys(row).length > 0) {
            title = row[Object.keys(row)[0]];
          }

          if (!title || String(title).trim() === '') return;

          const author = getVal(['Autor', 'Author', 'Escritor', 'Responsable']) || 'Desconocido';
          const catValue = getVal(['Categoría', 'Categoria', 'Category', 'Tema', 'Materia', 'Area']);
          const catName = String(catValue || 'GENERAL').trim();
          const editorial = getVal(['Editorial', 'Publisher', 'Edicion']) || '';
          const total = parseInt(getVal(['Cantidad', 'Stock', 'Total', 'Ejemplares', 'Unidades'])) || 1;
          const typeName = normalizeStr(getVal(['Tipo', 'Type', 'Recurso']) || 'Libro');

          // Match category - SUPER FUZZY
          const normCatExcel = normalizeStr(catName);
          
          let catObj = categories.find(c => normalizeStr(c.name) === normCatExcel);
          
          if (!catObj) {
            catObj = categories.find(c => {
              const nName = normalizeStr(c.name);
              return normCatExcel.includes(nName) || nName.includes(normCatExcel);
            });
          }
          
          // Special cases for common typos
          if (!catObj) {
            if (normCatExcel.includes('literar') || normCatExcel.includes('literat')) {
              catObj = categories.find(c => normalizeStr(c.name).includes('literatura'));
            } else if (normCatExcel.includes('matem')) {
              catObj = categories.find(c => normalizeStr(c.name).includes('matematica'));
            } else if (normCatExcel.includes('sociales')) {
              catObj = categories.find(c => normalizeStr(c.name).includes('sociales'));
            } else if (normCatExcel.includes('naturales')) {
              catObj = categories.find(c => normalizeStr(c.name).includes('naturales'));
            }
          }

          if (!catObj || normCatExcel === 'general') {
            catObj = categories.find(c => c.name === 'GENERAL') || categories[0];
          }

          // Match type
          const typeObj = resourceTypes.find(t => normalizeStr(t.name).includes(typeName)) || resourceTypes[0];

          // Calculate next itemCode
          const sameGroupItems = newBooksList.filter(b => b.typeCode === typeObj.code && b.categoryCode === catObj.code);
          const lastCode = sameGroupItems.reduce((acc, b) => {
            const start = parseInt(b.itemCode) || 0;
            const count = parseInt(b.total_count) || 1;
            return Math.max(acc, start + count - 1);
          }, 0);

          const nextItemCode = String(lastCode + 1).padStart(3, '0');

          const newBook = {
            id: Date.now() + index,
            title,
            author,
            category: catObj.name,
            categoryCode: catObj.code,
            type: typeObj.id,
            typeCode: typeObj.code,
            itemCode: nextItemCode,
            total_count: total,
            available_count: total,
            editorial,
            description: getVal(['Descripción', 'Descripcion', 'Description']) || '',
            institutionalType: getVal(['Tipo Inst', 'Institutional Type']) || 'MANUAL',
            image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400'
          };

          newBooksList.push(newBook);
          importedCount++;
        });

        setBooks(newBooksList);
        alert(`¡Éxito! Se importaron ${importedCount} elementos correctamente.`);
      } catch (err) {
        console.error(err);
        alert("Error al procesar el archivo Excel. Asegúrate de que el formato sea correcto.");
      } finally {
        setIsImporting(false);
        e.target.value = ''; // Reset input
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const filteredBooks = (books || []).filter(b => 
    b && (
      (b?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (b?.author || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b?.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      getFullCodeRange(b).includes(searchTerm)
    )
  );

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl">Inventario General</h1>
          <p className="text-muted text-sm mt-1">Gestión de recursos con validación de códigos TTT-CCC-EEE</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={20} /> Nuevo Elemento
          </button>
          <button className="glass-card" onClick={handleDeleteAll} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
            <Trash2 size={20} /> Borrar Todo
          </button>
          <button className="glass-card" onClick={() => fileInputRef.current.click()} disabled={isImporting} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', color: '#4ade80' }}>
            <FileSpreadsheet size={20} /> {isImporting ? 'Importando...' : 'Importar Biblioteca'}
          </button>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".xlsx, .xls" onChange={handleFileChange} />
        </div>
      </div>

      <div className="glass-card p-4 mb-8">
        <div className="relative">
          <Search className="absolute" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
          <input 
            className="input-field" 
            style={{ paddingLeft: '3rem' }} 
            placeholder="Buscar por título, autor o código (ej: 001001004)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden" style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Código</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Elemento</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Detalles</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Stock</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredBooks.map(item => item && (
              <tr key={item.id} className="hover-card-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <code style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    color: 'var(--primary)', 
                    padding: '0.3rem 0.6rem', 
                    borderRadius: '6px', 
                    fontSize: '0.75rem', 
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    whiteSpace: 'nowrap'
                  }}>
                    {getFullCodeRange(item)}
                  </code>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div className="flex items-center gap-4">
                    <img src={item.image} alt={item.title} style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                    <div>
                      <div style={{ fontWeight: '700', color: 'white' }}>{item.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.author}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <div className="flex flex-col gap-1">
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: '700' }}>{item.category}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.editorial || item.institutionalType}</span>
                  </div>
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <div className="flex items-center gap-2">
                    <div style={{ fontSize: '1rem', fontWeight: '700' }}>{item.available_count} / {item.total_count}</div>
                    <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${(item.available_count / item.total_count) * 100}%`, height: '100%', background: item.available_count === 0 ? '#f87171' : '#4ade80' }} />
                    </div>
                  </div>
                </td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleOpenModal(item)} className="text-muted hover:text-white" style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '0.5rem' }}><Edit size={18} /></button>
                    <button onClick={() => handleDelete(item.id)} className="text-muted hover:text-red-400" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', padding: '0.5rem', borderRadius: '0.5rem' }}><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }} />
          <div className="glass-card" style={{ maxWidth: '900px', width: '100%', padding: '2.5rem', position: 'relative', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 'bold' }}>{editingBook ? 'Editar Elemento' : 'Nuevo Elemento'}</h2>
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="text-xs text-muted font-bold uppercase tracking-wider block mb-2">Título del Libro / Nombre del Equipo</label>
                  <input className="input-field" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Ej: Biología I" />
                </div>
                
                <div>
                  <label className="text-xs text-muted font-bold uppercase tracking-wider block mb-2">Autor / Marca</label>
                  <input className="input-field" required value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} placeholder="Ej: Santillana" />
                </div>

                <div>
                  <label className="text-xs text-muted font-bold uppercase tracking-wider block mb-2">Tipo de Recurso</label>
                  <select 
                    className="input-field" 
                    value={formData.type} 
                    onChange={(e) => {
                      const typeId = e.target.value;
                      const typeObj = resourceTypes.find(t => t.id === typeId);
                      setFormData({...formData, type: typeId, typeCode: typeObj?.code || '001'});
                    }}
                  >
                    {(resourceTypes || []).map(t => (
                      <option key={t?.id || Math.random()} value={t?.id || ''}>
                        {t?.code || '000'} - {t?.name || 'Tipo'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-xs text-muted font-bold uppercase tracking-wider block mb-2">Categoría</label>
                  <select 
                    className="input-field" 
                    value={formData.category} 
                    onChange={(e) => {
                      const catName = e.target.value;
                      const catObj = (categories || []).find(c => (typeof c === 'object' ? c.name : c) === catName);
                      setFormData({...formData, category: catName, categoryCode: catObj?.code || '001'});
                    }}
                  >
                    {(categories || []).map(c => {
                      const id = typeof c === 'object' ? c.id : c;
                      const name = typeof c === 'object' ? c.name : c;
                      const code = typeof c === 'object' ? (c.code || '001') : '001';
                      return (
                        <option key={id || Math.random()} value={name}>
                          {code} - {name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-muted font-bold uppercase tracking-wider block mb-2">Editorial / Origen</label>
                  <input className="input-field" value={formData.editorial} onChange={(e) => setFormData({...formData, editorial: e.target.value})} />
                </div>

                <div style={{ gridColumn: 'span 3', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                  <p className="text-xs font-bold text-muted mb-4 uppercase tracking-widest">Identificación y Stock</p>
                </div>

                <div className="grid grid-cols-3 gap-2" style={{ gridColumn: 'span 2' }}>
                  <div>
                    <label className="text-[10px] text-muted uppercase block mb-1">Cód. Tipo (Auto)</label>
                    <input className="input-field" disabled value={formData.typeCode} />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted uppercase block mb-1">Cód. Cat (Auto)</label>
                    <input className="input-field" disabled value={formData.categoryCode} />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted uppercase block mb-1">Cód. Item (Secuencial)</label>
                    <input className="input-field" maxLength="3" required value={formData.itemCode} onChange={(e) => setFormData({...formData, itemCode: e.target.value.replace(/\D/g,'')})} />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted font-bold uppercase tracking-wider block mb-2">Cantidad Total</label>
                  <input type="number" className="input-field" min="1" required value={formData.total_count} onChange={(e) => setFormData({...formData, total_count: parseInt(e.target.value) || 1})} />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label className="text-xs text-muted font-bold uppercase tracking-wider block mb-2">URL Portada / Imagen</label>
                  <input className="input-field" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} />
                </div>

                <div>
                  <label className="text-xs text-muted font-bold uppercase tracking-wider block mb-2">Tipo Inst.</label>
                  <input className="input-field" value={formData.institutionalType} onChange={(e) => setFormData({...formData, institutionalType: e.target.value})} placeholder="Ej: MANUAL" />
                </div>

                <div style={{ gridColumn: 'span 3' }}>
                  <label className="text-xs text-muted font-bold uppercase tracking-wider block mb-2">Descripción / Sinopsis</label>
                  <textarea className="input-field" rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Breve descripción del elemento..." />
                </div>
              </div>
              
              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '1rem', borderRadius: '1rem', fontWeight: '700', color: 'white', background: 'rgba(255,255,255,0.05)' }}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '1rem', fontWeight: '700' }}>Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      <ConfirmDialog 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="¿Eliminar elemento?"
        message="¿Estás seguro de que deseas eliminar este elemento del inventario? Esta acción no se puede deshacer."
      />

      <ConfirmDialog 
        isOpen={deleteAllConfirm}
        onClose={() => setDeleteAllConfirm(false)}
        onConfirm={confirmDeleteAll}
        title="⚠️ ¿ELIMINAR TODO EL INVENTARIO?"
        message="Esta acción borrará ABSOLUTAMENTE TODOS los libros y equipos del sistema de forma permanente. ¿Estás COMPLETAMENTE seguro?"
        confirmText="SÍ, ELIMINAR TODO"
      />
    </div>
  );
};

export default AdminInventory;
