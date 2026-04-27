import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, Edit, RefreshCcw, Database } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import { db } from '../firebase';

const AdminCategories = ({ categories = [], setCategories, updateCategory, deleteCategory, resourceTypes = [], setResourceTypes, updateResourceType, deleteResourceType }) => {
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' or 'types'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, item: null });
  const [cleaning, setCleaning] = useState(false);

  const resetToOfficialCategories = async () => {
    if (!window.confirm("⚠️ ATENCIÓN: Esto borrará todas las categorías actuales y las reemplazará por la lista oficial. ¿Continuar?")) return;
    
    setCleaning(true);
    try {
      const { initialCategories } = await import('../data');
      const { getDocs, collection, writeBatch, doc } = await import('firebase/firestore');
      
      const currentCats = await getDocs(collection(db, 'categories'));
      const deleteBatch = writeBatch(db);
      currentCats.docs.forEach(d => deleteBatch.delete(d.ref));
      await deleteBatch.commit();

      const addBatch = writeBatch(db);
      (initialCategories || []).forEach(cat => {
        if (cat && cat.id) addBatch.set(doc(db, 'categories', String(cat.id)), cat);
      });
      await addBatch.commit();

      alert("Categorías reseteadas. Sincronizando inventario...");
      await syncInventoryCodes(true); 
    } catch (e) {
      console.error(e);
      alert("Error al resetear.");
    } finally {
      setCleaning(false);
    }
  };

  const syncInventoryCodes = async (silent = false) => {
    if (!silent && !window.confirm("¿Sincronizar códigos de inventario ahora?")) return;
    
    setCleaning(true);
    try {
      const { getDocs, collection, writeBatch, doc } = await import('firebase/firestore');
      const booksSnap = await getDocs(collection(db, 'books'));
      const catsSnap = await getDocs(collection(db, 'categories'));
      
      const latestCats = catsSnap.docs.map(d => ({ ...d.data(), id: d.id }));
      const batch = writeBatch(db);
      let count = 0;

      booksSnap.docs.forEach(d => {
        const book = d.data();
        if (!book) return;

        const catObj = latestCats.find(c => c.name?.toUpperCase().trim() === book.category?.toUpperCase().trim());
        const typeObj = (resourceTypes || []).find(t => t.id === book.type || t.name === book.type);
        
        let changed = false;
        const updatedBook = { ...book };
        
        if (catObj && book.categoryCode !== catObj.code) {
          updatedBook.categoryCode = catObj.code;
          updatedBook.category = catObj.name;
          changed = true;
        }
        if (typeObj && book.typeCode !== typeObj.code) {
          updatedBook.typeCode = typeObj.code;
          changed = true;
        }

        if (changed) {
          batch.update(doc(db, 'books', d.id), updatedBook);
          count++;
        }
      });

      if (count > 0) await batch.commit();
      if (!silent) alert(`Sincronización completada: ${count} items.`);
      window.location.reload();
    } catch (e) {
      console.error(e);
      if (!silent) alert("Error de sincronización.");
    } finally {
      setCleaning(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ name: item.name || '', code: item.code || '' });
    } else {
      setEditingItem(null);
      const list = activeTab === 'categories' ? (categories || []) : (resourceTypes || []);
      const nextNum = list.length > 0 ? Math.max(...list.map(i => parseInt(i?.code) || 0)) + 1 : 1;
      setFormData({ name: '', code: String(nextNum).padStart(3, '0') });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    const newItem = { 
      id: editingItem ? editingItem.id : (activeTab === 'categories' ? 'cat_' : 'type_') + Date.now(),
      name: formData.name.trim(), 
      code: formData.code.trim().padStart(3, '0') 
    };

    if (activeTab === 'categories') {
      if (editingItem) setCategories(categories.map(c => c.id === editingItem.id ? newItem : c));
      else setCategories([...categories, newItem]);
      if (updateCategory) updateCategory(newItem);
    } else {
      if (editingItem) setResourceTypes(resourceTypes.map(t => t.id === editingItem.id ? newItem : t));
      else setResourceTypes([...resourceTypes, newItem]);
      if (updateResourceType) updateResourceType(newItem);
    }
    setIsModalOpen(false);
  };

  const currentList = activeTab === 'categories' ? (categories || []) : (resourceTypes || []);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={() => setActiveTab('categories')} style={{ background: 'none', color: activeTab === 'categories' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: '700', padding: '0.8rem 1rem', cursor: 'pointer' }}>Categorías</button>
        <button onClick={() => setActiveTab('types')} style={{ background: 'none', color: activeTab === 'types' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: '700', padding: '0.8rem 1rem', cursor: 'pointer' }}>Tipos</button>
      </div>

      <div className="flex justify-between items-center mb-6 mobile-stack">
        <div>
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>{activeTab === 'categories' ? 'Categorías' : 'Tipos'}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }} className="mobile-hide">{currentList.length} registrados en el sistema</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }} className="w-full">
          <button className="glass-card flex-1" onClick={resetToOfficialCategories} disabled={cleaning} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.6rem 0.8rem', fontSize: '0.75rem', color: '#f87171' }}>
            <Database size={14} /> <span className="mobile-hide">Reset Oficial</span><span className="sm:hidden">Reset</span>
          </button>
          <button className="glass-card flex-1" onClick={() => syncInventoryCodes()} disabled={cleaning} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.6rem 0.8rem', fontSize: '0.75rem', color: '#6366f1' }}>
            <RefreshCcw size={14} /> <span className="mobile-hide">Sincronizar</span><span className="sm:hidden">Sinc</span>
          </button>
          <button className="btn-primary flex-1" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.6rem 0.8rem', fontSize: '0.75rem' }}>
            <Plus size={14} /> Nuevo
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left' }}>
              <th style={{ padding: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>CÓDIGO</th>
              <th style={{ padding: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>NOMBRE</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.7rem', color: 'var(--text-muted)' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {currentList.map((item, idx) => item && (
              <tr key={item.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td data-label="Código" style={{ padding: '1rem' }} className="mobile-text-right"><code style={{ color: 'var(--primary)' }}>{item.code || '---'}</code></td>
                <td data-label="Nombre" style={{ padding: '1rem', fontWeight: '600' }} className="mobile-text-right">{item.name || '---'}</td>
                <td data-label="Acciones" style={{ padding: '1rem', textAlign: 'right' }}>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleOpenModal(item)} style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', padding: '0.4rem', borderRadius: '0.4rem' }}><Edit size={16} /></button>
                    <button onClick={() => setDeleteConfirm({ isOpen: true, item })} style={{ background: 'rgba(248,113,113,0.05)', color: '#f87171', padding: '0.4rem', borderRadius: '0.4rem' }}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }} />
          <div className="glass-card" style={{ position: 'relative', width: '350px', padding: '2rem', background: '#1e293b' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>{editingItem ? 'Editar' : 'Nuevo'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input className="input-field" placeholder="Código" maxLength="3" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.replace(/\D/g,'')})} />
              <input className="input-field" placeholder="Nombre" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '0.6rem', background: 'none', color: 'white' }}>Cerrar</button>
                <button onClick={handleSave} className="btn-primary" style={{ flex: 1 }}>Guardar</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, item: null })}
        onConfirm={() => {
          if (activeTab === 'categories') {
            setCategories(categories.filter(c => c.id !== deleteConfirm.item.id));
            if (deleteCategory) deleteCategory(deleteConfirm.item.id);
          } else {
            setResourceTypes(resourceTypes.filter(t => t.id !== deleteConfirm.item.id));
            if (deleteResourceType) deleteResourceType(deleteConfirm.item.id);
          }
          setDeleteConfirm({ isOpen: false, item: null });
        }}
        title="Eliminar"
        message="¿Estás seguro?"
      />
    </div>
  );
};

export default AdminCategories;
