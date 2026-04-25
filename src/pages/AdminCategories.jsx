import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, Edit, Tag, Eraser } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';

const AdminCategories = ({ categories, setCategories }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [newCatName, setNewCatName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, cat: null });
  const [cleaning, setCleaning] = useState(false);

  // Deduplicated list for display (case-insensitive, trimmed)
  const uniqueCategories = [...new Map(
    categories.map(c => [c.trim().toLowerCase(), c.trim()])
  ).values()].sort((a, b) => a.localeCompare(b));

  const handleCleanDuplicates = async () => {
    if (!window.confirm(`Se encontraron ${categories.length} entradas. Se conservará una única copia de cada categoría y se eliminarán ${categories.length - uniqueCategories.length} duplicados de Firebase. ¿Continuar?`)) return;
    setCleaning(true);
    try {
      // Delete ALL docs in 'categories' collection
      const snap = await getDocs(collection(db, 'categories'));
      await Promise.all(snap.docs.map(d => deleteDoc(doc(db, 'categories', d.id))));
      // Re-write unique ones
      await Promise.all(uniqueCategories.map(c =>
        setDoc(doc(db, 'categories', c), { name: c, id: c })
      ));
      setCategories(uniqueCategories);
      alert(`✅ Listo. Se conservaron ${uniqueCategories.length} categorías únicas.`);
    } catch (err) {
      console.error(err);
      alert('Error al limpiar Firebase: ' + err.message);
    } finally {
      setCleaning(false);
    }
  };

  const handleOpenModal = (cat = null) => {
    setEditingCat(cat);
    setNewCatName(cat || '');
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    if (editingCat) {
      setCategories(uniqueCategories.map(c => c === editingCat ? trimmed : c));
    } else {
      if (!uniqueCategories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
        setCategories([...uniqueCategories, trimmed]);
      } else {
        alert('Esa categoría ya existe.');
        return;
      }
    }
    setIsModalOpen(false);
  };

  const handleDelete = (cat) => setDeleteConfirm({ isOpen: true, cat });

  const confirmDelete = () => {
    if (deleteConfirm.cat) {
      setCategories(uniqueCategories.filter(c => c !== deleteConfirm.cat));
      setDeleteConfirm({ isOpen: false, cat: null });
    }
  };

  const hasDuplicates = categories.length > uniqueCategories.length;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Categorías</h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {uniqueCategories.length} categorías únicas
            {hasDuplicates && <span style={{ color: '#f87171', marginLeft: '0.5rem' }}>· {categories.length - uniqueCategories.length} duplicados detectados</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {hasDuplicates && (
            <button
              onClick={handleCleanDuplicates}
              disabled={cleaning}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.5rem 0.9rem', borderRadius: '0.6rem', border: '1px solid rgba(248,113,113,0.3)',
                background: 'rgba(248,113,113,0.1)', color: '#f87171',
                cursor: cleaning ? 'wait' : 'pointer', fontWeight: '600', fontSize: '0.8rem',
              }}
            >
              <Eraser size={15} />
              {cleaning ? 'Limpiando...' : 'Limpiar duplicados'}
            </button>
          )}
          <button
            className="btn-primary"
            onClick={() => handleOpenModal()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <Plus size={16} /> Nueva Categoría
          </button>
        </div>
      </div>

      {/* List */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {uniqueCategories.map((cat, index) => (
          <div
            key={cat}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.6rem 1rem',
              borderBottom: index < uniqueCategories.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ background: 'rgba(139,92,246,0.1)', padding: '0.35rem', borderRadius: '0.4rem', color: 'var(--accent)', display: 'flex' }}>
                <Tag size={14} />
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{cat}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                onClick={() => handleOpenModal(cat)}
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '0.35rem', borderRadius: '0.4rem', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
              >
                <Edit size={15} />
              </button>
              <button
                onClick={() => handleDelete(cat)}
                style={{ background: 'rgba(239,68,68,0.1)', border: 'none', padding: '0.35rem', borderRadius: '0.4rem', color: '#f87171', cursor: 'pointer', display: 'flex' }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        {uniqueCategories.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No hay categorías. Creá la primera.
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} />
          <div style={{ position: 'relative', background: '#1e293b', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', padding: '1.75rem', width: '100%', maxWidth: '380px' }}>
            <h2 style={{ fontWeight: '700', marginBottom: '1.25rem' }}>{editingCat ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
            <form onSubmit={handleSave}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Nombre</label>
              <input className="input-field" required autoFocus value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Ej: Matemáticas" />
              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '0.6rem', borderRadius: '0.6rem', background: 'rgba(255,255,255,0.07)', border: 'none', color: 'white', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.6rem' }}>Guardar</button>
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
        message={`¿Eliminar "${deleteConfirm.cat}"? Los elementos con esta categoría quedarán sin clasificación.`}
      />
    </div>
  );
};

export default AdminCategories;
