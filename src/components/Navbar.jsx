import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Library, LayoutDashboard, BookOpen, Users, Tags, ClipboardList, Shield, HelpCircle } from 'lucide-react';

const Navbar = ({ currentUser, onLogout }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <nav className="glass-card" style={{
      position: 'fixed',
      top: '0.5rem',
      left: '1rem',
      right: '1rem',
      zIndex: 100,
      padding: '0.5rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'between',
      borderRadius: '1rem'
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'white' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          padding: '0.4rem',
          borderRadius: '0.6rem',
          display: 'flex'
        }}>
          <Library size={20} />
        </div>
        <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>BiblioUTN</span>
        {currentUser && (
          <span style={{ fontSize: '0.7rem', color: '#4ade80', marginLeft: '0.5rem', background: 'rgba(74, 222, 128, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
            Live Sync
          </span>
        )}
      </Link>

      <div style={{ display: 'flex', gap: '1.5rem', marginLeft: 'auto' }}>
        {!currentUser ? (
          <>
            <Link to="/" style={{ color: location.pathname === '/' ? 'var(--primary)' : 'white', textDecoration: 'none', fontWeight: '600', alignSelf: 'center' }}>Libros</Link>
            <Link to="/info" style={{ color: location.pathname === '/info' ? 'var(--primary)' : 'white', textDecoration: 'none', fontWeight: '600', alignSelf: 'center' }}>Reglas/Horarios</Link>
            <Link to="/login" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Login Admin</Link>
          </>
        ) : (
          <>
            <NavLink to="/info" icon={<HelpCircle size={18} />} label="Info" active={location.pathname === '/info'} />
            <NavLink to="/admin" icon={<LayoutDashboard size={18} />} label="Dashboard" active={location.pathname === '/admin'} />
            <NavLink to="/admin/inventory" icon={<BookOpen size={18} />} label="Inventario" active={location.pathname === '/admin/inventory'} />
            <NavLink to="/admin/loans" icon={<ClipboardList size={18} />} label="Préstamos" active={location.pathname === '/admin/loans'} />
            <NavLink to="/admin/students" icon={<Users size={18} />} label="Usuarios" active={location.pathname === '/admin/students'} />
            <NavLink to="/admin/categories" icon={<Tags size={18} />} label="Categorías" active={location.pathname === '/admin/categories'} />
            <NavLink to="/admin/users" icon={<Shield size={18} />} label="Admins" active={location.pathname === '/admin/users'} />
            <button 
              onClick={onLogout} 
              style={{ 
                background: 'rgba(239, 68, 68, 0.1)', 
                color: '#f87171', 
                border: 'none', 
                padding: '0.4rem 0.8rem', 
                borderRadius: '0.6rem', 
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                marginLeft: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              Salir
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

const NavLink = ({ to, icon, label, active }) => (
  <Link to={to} style={{
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
    color: active ? 'var(--primary)' : 'var(--text-muted)',
    fontSize: '0.875rem',
    fontWeight: active ? '600' : '400',
    transition: 'all 0.3s'
  }}>
    {icon}
    <span>{label}</span>
  </Link>
);

export default Navbar;
