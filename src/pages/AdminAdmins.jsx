import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, Edit, User, Shield, Key } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

const AdminAdmins = ({ admins, setAdmins, deleteAdmin }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleOpenModal = (admin = null) => {
    if (admin) {
      setEditingAdmin(admin);
      setFormData(admin);
    } else {
      setEditingAdmin(null);
      setFormData({ username: '', password: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingAdmin) {
      setAdmins(admins.map(a => a.id === editingAdmin.id ? { ...formData, id: a.id } : a));
    } else {
      setAdmins([...admins, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (admins.length <= 1) {
      alert('No puedes eliminar al último administrador.');
      return;
    }
    setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.id) {
      const adminId = String(deleteConfirm.id);
      if (deleteAdmin) await deleteAdmin(adminId);
      setAdmins(admins.filter(a => String(a.id) !== adminId));
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl">Usuarios Administradores</h1>
        <button className="btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={20} /> Nuevo Admin
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4" style={{ display: 'flex', flexDirection: 'column' }}>
          {admins.map((admin, index) => (
            <div key={admin.id} className="flex justify-between items-center p-4" style={{ borderBottom: index < admins.length - 1 ? '1px solid var(--border-glass)' : 'none' }}>
              <div className="flex items-center gap-6" style={{ gap: '1rem' }}>
                <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '0.5rem', borderRadius: '0.5rem', color: 'var(--secondary)' }}>
                  <Shield size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '1.125rem', fontWeight: '500' }}>{admin.username}</span>
                  <div className="text-sm text-muted">Contraseña: ****</div>
                </div>
              </div>
              <div className="flex gap-6" style={{ gap: '0.5rem' }}>
                <button 
                  onClick={() => handleOpenModal(admin)} 
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
                  onClick={() => handleDelete(admin.id)} 
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
            <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 'bold' }}>{editingAdmin ? 'Editar Administrador' : 'Nuevo Administrador'}</h2>
            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Usuario</label>
                  <div className="relative">
                    <User size={18} className="absolute" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="input-field" style={{ paddingLeft: '3rem' }} required value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Nueva Contraseña</label>
                  <div className="relative">
                    <Key size={18} className="absolute" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="text" className="input-field" style={{ paddingLeft: '3rem' }} required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  </div>
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
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="¿Eliminar administrador?"
        message="¿Estás seguro de que deseas revocar los permisos de administrador a este usuario?"
      />
    </div>
  );
};

export default AdminAdmins;
