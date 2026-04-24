import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, Edit, Upload, X, Search, Laptop, Book as BookIcon, FileSpreadsheet, Globe, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import ConfirmDialog from '../components/ConfirmDialog';

const AdminInventory = ({ books, setBooks, categories, deleteItem }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchingAPI, setIsSearchingAPI] = useState(false);
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

  const handleGoogleBooksSearch = async () => {
    if (!formData.title && !formData.author) {
      alert("Por favor ingrese un título o autor para buscar.");
      return;
    }

    setIsSearchingAPI(true);
    try {
      const query = `intitle:${encodeURIComponent(formData.title)}${formData.author ? `+inauthor:${encodeURIComponent(formData.author)}` : ''}`;
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const info = data.items[0].volumeInfo;
        setFormData(prev => ({
          ...prev,
          title: info.title || prev.title,
          author: info.authors ? info.authors.join(", ") : prev.author,
          editorial: info.publisher || prev.editorial,
          description: info.description ? info.description.substring(0, 300) + "..." : prev.description,
          image: info.imageLinks?.thumbnail ? info.imageLinks.thumbnail.replace('http:', 'https:') : prev.image,
          type: 'book'
        }));
      } else {
        alert("No se encontraron resultados en Google Books.");
      }
    } catch (error) {
      console.error("Error fetching from Google Books:", error);
      alert("Error al conectar con la API de Google Books.");
    } finally {
      setIsSearchingAPI(false);
    }
  };

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
    (b.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.editorial && b.editorial.toLowerCase().includes(searchTerm.toLowerCase())) ||
    getBaseCode(b).includes(searchTerm)
  );

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl">Inventario General</h1>
          <p className="text-muted text-sm mt-1">Gestión de libros, manuales y equipamiento tecnológico</p>
        </div>
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

      <div className="glass-card overflow-hidden" style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Código</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Elemento</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Detalles</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Stock</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredBooks.map(item => (
              <tr key={item.id} className="hover-card-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <code style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--primary)', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                    {getBaseCode(item)}
                  </code>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div className="flex items-center gap-4">
                    <div style={{ position: 'relative' }}>
                      <img src={item.image} alt="" style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                      <div style={{ position: 'absolute', bottom: '-6px', right: '-6px', background: '#1e293b', borderRadius: '50%', padding: '4px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)' }}>
                        {item.type === 'equipment' ? <Laptop size={12} color="#ec4899" /> : <BookIcon size={12} color="#6366f1" />}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{item.title || 'Sin Título'}</div>
                      <div className="text-xs text-muted" style={{ fontWeight: '500' }}>{item.author || 'Anónimo'}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div className="flex flex-col gap-2">
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'white' }}>{item.editorial || '---'}</div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <span style={{ 
                        fontSize: '9px', 
                        fontWeight: '800', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.05em',
                        background: item.type === 'equipment' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                        color: item.type === 'equipment' ? '#f472b6' : '#818cf8',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: `1px solid ${item.type === 'equipment' ? 'rgba(236, 72, 153, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`
                      }}>
                        {item.category || 'General'}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                        {item.institutionalType}
                      </span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div className="flex flex-col gap-1" style={{ minWidth: '100px' }}>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span style={{ fontSize: '1rem', fontWeight: '800', color: 'white' }}>{item.available_count}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>/ {item.total_count}</span>
                    </div>
                    <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.available_count / item.total_count) * 100}%` }}
                        style={{ height: '100%', background: item.available_count === 0 ? '#f87171' : 'linear-gradient(90deg, #6366f1, #a855f7)' }}
                      />
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => handleOpenModal(item)} className="text-muted p-2" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem', border: 'none' }}>
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2" style={{ background: 'rgba(239, 68, 68, 0.05)', color: '#f87171', borderRadius: '0.75rem', border: 'none' }}>
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
          <div className="glass-card" style={{ maxWidth: '750px', width: '100%', padding: '2.5rem', position: 'relative', zIndex: 2, background: '#1e293b', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">{editingBook ? 'Editar Elemento' : 'Nuevo Elemento'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted hover:text-white"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="text-xs text-muted font-bold uppercase tracking-wider block mb-2">Título / Nombre</label>
                  <div className="relative">
                    <input className="input-field" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Ej: Harry Potter" />
                    {formData.type === 'book' && (
                      <button 
                        type="button"
                        onClick={handleGoogleBooksSearch}
                        disabled={isSearchingAPI}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md"
                        style={{ background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        {isSearchingAPI ? <Loader2 size={12} className="animate-spin" /> : <Globe size={12} />}
                        Auto-completar
                      </button>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-muted font-bold uppercase tracking-wider block mb-2">Autor / Marca</label>
                  <input className="input-field" required value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} placeholder="Ej: J.K. Rowling" />
                </div>

                <div>
                  <label className="text-xs text-muted font-bold uppercase tracking-wider block mb-2">Tipo de Recurso</label>
                  <select className="input-field" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                    <option value="book">Libro / Manual</option>
                    <option value="equipment">Equipamiento / Tecnología</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs text-muted font-bold uppercase tracking-wider block mb-2">Categoría</label>
                  <select className="input-field" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                    {(categories || []).map(c => <option key={c} value={c}>{c}</option>)}
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
                    <label className="text-[10px] text-muted uppercase block mb-1">Cód. Tipo</label>
                    <input className="input-field" maxLength="3" required value={formData.typeCode} onChange={(e) => setFormData({...formData, typeCode: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted uppercase block mb-1">Cód. Cat</label>
                    <input className="input-field" maxLength="3" required value={formData.categoryCode} onChange={(e) => setFormData({...formData, categoryCode: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted uppercase block mb-1">Cód. Item</label>
                    <input className="input-field" maxLength="3" required value={formData.itemCode} onChange={(e) => setFormData({...formData, itemCode: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted font-bold uppercase tracking-wider block mb-2">Cantidad Total</label>
                  <input type="number" className="input-field" min="1" required value={formData.total_count} onChange={(e) => setFormData({...formData, total_count: parseInt(e.target.value)})} />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label className="text-xs text-muted font-bold uppercase tracking-wider block mb-2">URL Portada / Imagen</label>
                  <div className="relative">
                    <ImageIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input className="input-field" style={{ paddingLeft: '2.5rem' }} value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} />
                  </div>
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
        message="Esta acción no se puede deshacer. El libro o equipo será removido permanentemente del inventario."
      />
    </div>
  );
};

export default AdminInventory;
