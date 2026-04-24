import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = ({ admins, setCurrentUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const admin = admins.find(a => a.username === username && a.password === password);
    if (admin) {
      setCurrentUser(admin);
      navigate('/admin');
    } else {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <div className="flex items-center justify-center animate-fade-in" style={{ minHeight: '60vh' }}>
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-card" 
        style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
            width: '60px', height: '60px', borderRadius: '1rem', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <Lock size={30} color="white" />
          </div>
          <h2 style={{ fontSize: '1.5rem' }}>Acceso Administrador</h2>
          <p className="text-muted text-sm">Ingrese sus credenciales para continuar</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="text-sm text-muted mb-8" style={{ display: 'block', marginBottom: '0.5rem' }}>Usuario</label>
              <div className="relative">
                <User size={18} className="absolute" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  className="input-field" 
                  style={{ paddingLeft: '3rem' }} 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted mb-8" style={{ display: 'block', marginBottom: '0.5rem' }}>Contraseña</label>
              <div className="relative">
                <Lock size={18} className="absolute" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="password"
                  className="input-field" 
                  style={{ paddingLeft: '3rem' }} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div style={{ color: '#f87171', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="btn-primary w-full" style={{ marginTop: '1rem' }}>
              Iniciar Sesión
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
