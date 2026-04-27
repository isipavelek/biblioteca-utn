import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, Edit, Tag, Eraser, Layers } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';

const AdminCategories = ({ categories, setCategories, resourceTypes, setResourceTypes }) => {
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' or 'types'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, item: null });
  const [cleaning, setCleaning] = useState(false);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ name: item.name, code: item.code });
    } else {
      setEditingItem(null);
      const list = activeTab === 'categories' ? categories : resourceTypes;
      const nextNum = list.length > 0 ? Math.max(...list.map(i => parseInt(i.code) || 0)) + 1 : 1;
      setFormData({ name: '', code: String(nextNum).padStart(3, '0') });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();
    const trimmedCode = formData.code.trim().padStart(3, '0');
    
    if (!trimmedName || !trimmedCode) return;

    const newItem = { 
      id: editingItem ? editingItem.id : (activeTab === 'categories' ? 'cat_' : 'type_') + Date.now(),
      name: trimmedName, 
      code: trimmedCode 
    };

    if (activeTab === 'categories') {
      if (editingItem) {
        setCategories(categories.map(c => c.id === editingItem.id ? newItem : c));
      } else {
        setCategories([...categories, newItem]);
      }
    } else {
      if (editingItem) {
        setResourceTypes(resourceTypes.map(t => t.id === editingItem.id ? newItem : t));
      } else {
        setResourceTypes([...resourceTypes, newItem]);
      }
    }
    setIsModalOpen(false);
  };

  const handleDelete = (item) => setDeleteConfirm({ isOpen: true, item });

  const confirmDelete = () => {
    if (deleteConfirm.item) {
      if (activeTab === 'categories') {
        setCategories(categories.filter(c => c.id !== deleteConfirm.item.id));
      } else {
        setResourceTypes(resourceTypes.filter(t => t.id !== deleteConfirm.item.id));
      }
      setDeleteConfirm({ isOpen: false, item: null });
    }
  };

  const currentList = activeTab === 'categories' ? categories : resourceTypes;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setActiveTab('categories')}
          style={{ 
            background: 'none', color: activeTab === 'categories' ? 'var(--primary)' : 'var(--text-muted)', 
            fontWeight: '700', fontSize: '1rem', padding: '0.5rem 1rem', position: 'relative' 
          }}
        >
          Categorías
          {activeTab === 'categories' && <div style={{ position: 'absolute', bottom: '-0.6rem', left: 0, right: 0, height: '2px', background: 'var(--primary)' }} />}
        </button>
        <button 
          onClick={() => setActiveTab('types')}
          style={{ 
            background: 'none', color: activeTab === 'types' ? 'var(--primary)' : 'var(--text-muted)', 
            fontWeight: '700', fontSize: '1rem', padding: '0.5rem 1rem', position: 'relative' 
          }}
        >
          Tipos de Recurso
          {activeTab === 'types' && <div style={{ position: 'absolute', bottom: '-0.6rem', left: 0, right: 0, height: '2px', background: 'var(--primary)' }} />}
        </button>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>
            {activeTab === 'categories' ? 'Gestión de Categorías' : 'Gestión de Tipos'}
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {currentList.length} elementos registrados
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => handleOpenModal()}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          <Plus size={16} /> Nuevo {activeTab === 'categories' ? 'Categoría' : 'Tipo'}
        </button>
      </div>

      {/* List */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'left' }}>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Código</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Nombre</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentList.map((item, index) => (
              <tr key={item.id} style={{ borderBottom: index < currentList.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <code style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                    {item.code}
                  </code>
                </td>
                <td style={{ padding: '0.75rem 1rem', fontWeight: '500' }}>{item.name}</td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => handleOpenModal(item)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '0.4rem', borderRadius: '0.5rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDelete(item)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', padding: '0.4rem', borderRadius: '0.5rem', color: '#f87171', cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {currentList.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No hay elementos registrados.
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} />
          <div style={{ position: 'relative', background: '#1e293b', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', padding: '2rem', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ fontWeight: '700', marginBottom: '1.5rem' }}>
              {editingItem ? 'Editar' : 'Nuevo'} {activeTab === 'categories' ? 'Categoría' : 'Tipo'}
            </h2>
            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Código (3 dígitos)</label>
                  <input 
                    className="input-field" 
                    required maxLength="3"
                    value={formData.code} 
                    onChange={e => setFormData({ ...formData, code: e.target.value.replace(/\D/g,'') })} 
                    placeholder="Ej: 001" 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Nombre</label>
                  <input 
                    className="input-field" 
                    required autoFocus 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                    placeholder="Ej: Biología" 
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.07)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: '600' }}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', fontWeight: '600' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, item: null })}
        onConfirm={confirmDelete}
        title="¿Confirmar eliminación?"
        message={`¿Estás seguro de eliminar "${deleteConfirm.item?.name}"? Esto podría afectar la visualización de códigos en el inventario.`}
      />
    </div>
  );
};

export default AdminCategories;
