import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, Edit, Upload, X, Search, Laptop, Book as BookIcon, FileSpreadsheet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import ConfirmDialog from '../components/ConfirmDialog';

const AdminInventory = ({ books, setBooks, categories, deleteItem }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    editorial: '',
    description: '',
    category: (categories && categories.length > 0) ? categories[0] : '',
    total_count: 1,
    type: 'book', // 'book' or 'equipment'
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
      const lastCode = books.length > 0 ? Math.max(...books.map(b => parseInt(b.itemCode) || 0)) : 0;
      setFormData({
        title: '',
        author: '',
        editorial: '',
        description: '',
        category: (categories && categories.length > 0) ? categories[0] : '',
        total_count: 1,
        type: 'book',
        institutionalType: 'MANUAL',
        typeCode: '001',
        categoryCode: '001',
        itemCode: (lastCode + 1).toString().padStart(3, '0'),
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
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
    if (deleteConfirm.id) {
      if (deleteItem) deleteItem(deleteConfirm.id);
      setBooks(books.filter(b => b.id !== deleteConfirm.id));
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const groupedMap = new Map();
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length < 2 || !row[1]) continue;
          
          const title = String(row[1] || '').trim();
          const author = String(row[2] || 'Desconocido').trim();
          const editorial = String(row[3] || 'Desconocida').trim();
          const instType = String(row[4] || 'LIBRO').trim();
          const category = String(row[5] || 'General').trim();
          
          const key = `${title}|${author}|${editorial}|${category}|${instType}`.toLowerCase();
          
          if (groupedMap.has(key)) {
            const existing = groupedMap.get(key);
            existing.total_count += 1;
            existing.available_count += 1;
          } else {
            groupedMap.set(key, {
              title,
              author,
              editorial,
              institutionalType: instType,
              category,
              total_count: 1,
              available_count: 1,
              type: 'book',
              typeCode: '001',
              categoryCode: '001',
              itemCode: '000',
              image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
              description: 'Importado de Biblioteca.xlsx'
            });
          }
        }

        const newItems = Array.from(groupedMap.values()).map((item, idx) => ({
          ...item,
          id: Date.now() + idx,
          itemCode: (books.length + idx + 1).toString().padStart(3, '0')
        }));

        if (newItems.length > 0) {
          setBooks([...books, ...newItems]);
          alert(`Se han importado ${newItems.length} títulos nuevos con éxito.`);
        }
      } catch (error) {
        alert('Error al procesar el archivo. Revisa el formato.');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.editorial && b.editorial.toLowerCase().includes(searchTerm.toLowerCase())) ||
    getBaseCode(b).includes(searchTerm)
  );

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl">Inventario General (Libros y Equipos)</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={20} /> Nuevo Elemento
          </button>
          <button className="glass-card" onClick={() => fileInputRef.current.click()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', color: '#4ade80' }}>
            <FileSpreadsheet size={20} /> Importar Biblioteca
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
            placeholder="Buscar por título, autor, editorial o categoría..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
              <th style={{ padding: '1.25rem' }}>Código</th>
              <th style={{ padding: '1.25rem' }}>Elemento</th>
              <th style={{ padding: '1.25rem' }}>Editorial / Tipo</th>
              <th style={{ padding: '1.25rem' }}>Categoría</th>
              <th style={{ padding: '1.25rem' }}>Stock</th>
              <th style={{ padding: '1.25rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredBooks.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <td style={{ padding: '1.25rem' }}>
                  <code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                    {getBaseCode(item)}
                  </code>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <div className="flex items-center gap-6" style={{ gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                      <img src={item.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: 'var(--bg-dark)', borderRadius: '50%', padding: '2px', border: '1px solid var(--border-glass)' }}>
                        {item.type === 'equipment' ? <Laptop size={12} color="var(--secondary)" /> : <BookIcon size={12} color="var(--primary)" />}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontWeight: '600' }}>{item.title || 'Sin Título'}</div>
                      <div className="text-xs text-muted">{item.author || 'Anónimo'}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <div className="flex flex-col">
                    <span style={{ fontSize: '0.875rem' }}>{item.editorial || '---'}</span>
                    <span className="text-xs text-muted" style={{ textTransform: 'uppercase' }}>{item.institutionalType || (item.type === 'equipment' ? 'EQUIPAMIENTO' : 'LIBRO')}</span>
                  </div>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', width: 'fit-content' }}>{item.category}</span>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ fontWeight: '600' }}>{item.available_count} / {item.total_count}</div>
                  <div style={{ width: '80px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '4px' }}>
                    <div style={{ width: `${(item.available_count/item.total_count)*100}%`, height: '100%', background: item.available_count > 0 ? 'var(--primary)' : '#f87171', borderRadius: '2px' }}></div>
                  </div>
                </td>
                <td style={{ padding: '1.25rem' }}>
                    <div className="flex gap-6" style={{ gap: '0.5rem' }}>
                    <button onClick={() => handleOpenModal(item)} className="text-muted" style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="text-muted" style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', color: '#f87171', borderRadius: '0.5rem' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1 }} />
          <div className="glass-card" style={{ maxWidth: '650px', width: '100%', padding: '2.5rem', position: 'relative', zIndex: 2, background: '#1e293b', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '2rem', color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>{editingBook ? 'Editar Elemento' : 'Nuevo Elemento'}</h2>
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ gridColumn: 'span 3' }}>
                  <label className="text-xs text-muted block mb-1">Título / Nombre</label>
                  <input className="input-field" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                </div>
                
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="text-xs text-muted block mb-1">Autor / Marca</label>
                  <input className="input-field" required value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Editorial</label>
                  <input className="input-field" value={formData.editorial} onChange={(e) => setFormData({...formData, editorial: e.target.value})} />
                </div>

                <div>
                  <label className="text-xs text-muted block mb-1">Tipo Sistema</label>
                  <select className="input-field" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                    <option value="book">Libro</option>
                    <option value="equipment">Equipamiento</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Tipo Institucional</label>
                  <input className="input-field" value={formData.institutionalType} onChange={(e) => setFormData({...formData, institutionalType: e.target.value})} placeholder="Ej: MANUAL" />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Categoría</label>
                  <select className="input-field" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                    {(categories || []).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div style={{ gridColumn: 'span 3', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                  <p className="text-xs font-bold text-muted mb-4 uppercase letter-spacing-wide">Codificación Interna</p>
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Cód. Tipo (3d)</label>
                  <input className="input-field" maxLength="3" required value={formData.typeCode} onChange={(e) => setFormData({...formData, typeCode: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Cód. Cat (3d)</label>
                  <input className="input-field" maxLength="3" required value={formData.categoryCode} onChange={(e) => setFormData({...formData, categoryCode: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Cód. Item (3d)</label>
                  <input className="input-field" maxLength="3" required value={formData.itemCode} onChange={(e) => setFormData({...formData, itemCode: e.target.value})} />
                </div>

                <div style={{ gridColumn: 'span 1' }}>
                  <label className="text-xs text-muted block mb-1">Cantidad Total</label>
                  <input type="number" className="input-field" min="1" required value={formData.total_count} onChange={(e) => setFormData({...formData, total_count: parseInt(e.target.value)})} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="text-xs text-muted block mb-1">URL Imagen</label>
                  <input className="input-field" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} />
                </div>
                <div style={{ gridColumn: 'span 3' }}>
                  <label className="text-xs text-muted block mb-1">Descripción / Notas</label>
                  <textarea className="input-field" rows="2" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-6" style={{ gap: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', color: 'white', background: 'rgba(255,255,255,0.05)' }}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Guardar</button>
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
        message="Esta acción no se puede deshacer. El libro o equipo será removido permanentemente del inventario."
      />
    </div>
  );
};

export default AdminInventory;
