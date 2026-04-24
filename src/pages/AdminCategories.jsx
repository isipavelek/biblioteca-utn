import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, Edit, Tag } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

const AdminCategories = ({ categories, setCategories }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [newCatName, setNewCatName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, cat: null });

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setEditingCat(cat);
      setNewCatName(cat);
    } else {
      setEditingCat(null);
      setNewCatName('');
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingCat) {
      setCategories(categories.map(c => c === editingCat ? newCatName : c));
    } else {
      if (!categories.includes(newCatName)) {
        setCategories([...categories, newCatName]);
      }
    }
    setIsModalOpen(false);
  };

  const handleDelete = (cat) => {
    setDeleteConfirm({ isOpen: true, cat });
  };

  const confirmDelete = () => {
    if (deleteConfirm.cat) {
      setCategories(categories.filter(c => c !== deleteConfirm.cat));
      setDeleteConfirm({ isOpen: false, cat: null });
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl">Categorías de Libros</h1>
        <button className="btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={20} /> Nueva Categoría
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4" style={{ display: 'flex', flexDirection: 'column' }}>
          {categories.map((cat, index) => (
            <div key={index} className="flex justify-between items-center p-4" style={{ borderBottom: index < categories.length - 1 ? '1px solid var(--border-glass)' : 'none' }}>
              <div className="flex items-center gap-6" style={{ gap: '1rem' }}>
                <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '0.5rem', borderRadius: '0.5rem', color: 'var(--accent)' }}>
                  <Tag size={18} />
                </div>
                <span style={{ fontSize: '1.125rem', fontWeight: '500' }}>{cat}</span>
              </div>
              <div className="flex gap-6" style={{ gap: '0.5rem' }}>
                <button 
                  onClick={() => handleOpenModal(cat)} 
                  className="text-muted" 
                  style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    padding: '0.5rem', 
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Edit size={18} style={{ pointerEvents: 'none' }} />
                </button>
                <button 
                  onClick={() => handleDelete(cat)} 
                  className="text-muted" 
                  style={{ 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    padding: '0.5rem', 
                    color: '#f87171',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Trash2 size={18} style={{ pointerEvents: 'none' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }} />
          <div className="glass-card" style={{ maxWidth: '400px', width: '100%', padding: '2.5rem', position: 'relative', background: '#1e293b' }}>
            <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 'bold' }}>{editingCat ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Nombre de la Categoría</label>
                  <input className="input-field" required value={newCatName} onChange={(e) => setNewCatName(e.target.value)} autoFocus />
                </div>
              </div>
              <div className="flex gap-4" style={{ gap: '1rem', marginTop: '2.5rem', display: 'flex' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', color: 'white', background: 'rgba(255,255,255,0.1)' }}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      <ConfirmDialog 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, cat: null })}
        onConfirm={confirmDelete}
        title="¿Eliminar categoría?"
        message={`¿Estás seguro de que deseas eliminar la categoría "${deleteConfirm.cat}"? Los libros que pertenezcan a esta categoría podrían quedar sin clasificación.`}
      />
    </div>
  );
};

export default AdminCategories;
