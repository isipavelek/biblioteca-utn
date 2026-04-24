import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Eliminar", type = "danger" }) => {
  if (!isOpen) return null;

  return createPortal(
    <div style={{ 
      position: 'fixed', 
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 100000, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '1rem' 
    }}>
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        style={{ 
          position: 'absolute', 
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', 
          backdropFilter: 'blur(8px)',
          zIndex: 1 
        }} 
      />
      
      {/* Modal Content */}
      <div 
        className="animate-fade-in"
        style={{ 
          maxWidth: '400px', 
          width: '100%', 
          padding: '2rem', 
          position: 'relative', 
          zIndex: 2,
          background: '#1e293b',
          borderRadius: '1.25rem',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          textAlign: 'center'
        }}
      >
        <button 
          onClick={onClose}
          style={{ 
            position: 'absolute', 
            top: '1rem', 
            right: '1rem', 
            background: 'none', 
            color: 'var(--text-muted)',
            padding: '0.5rem'
          }}
        >
          <X size={20} style={{ pointerEvents: 'none' }} />
        </button>

        <div style={{ 
          width: '64px', 
          height: '64px', 
          background: type === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          color: type === 'danger' ? '#ef4444' : '#f59e0b',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto'
        }}>
          <AlertTriangle size={32} />
        </div>

        <h2 style={{ marginBottom: '0.75rem', color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
          {title}
        </h2>
        <p style={{ marginBottom: '2rem', color: '#94a3b8', lineHeight: '1.6' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={onClose} 
            style={{ 
              flex: 1, 
              padding: '0.75rem', 
              borderRadius: '0.75rem', 
              color: 'white', 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)',
              fontWeight: '600'
            }}
          >
            Cancelar
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }} 
            style={{ 
              flex: 1, 
              padding: '0.75rem', 
              borderRadius: '0.75rem', 
              color: 'white', 
              background: type === 'danger' ? '#ef4444' : '#f59e0b',
              border: 'none',
              fontWeight: '600',
              boxShadow: type === 'danger' ? '0 10px 15px -3px rgba(239, 68, 68, 0.3)' : '0 10px 15px -3px rgba(245, 158, 11, 0.3)'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmDialog;
