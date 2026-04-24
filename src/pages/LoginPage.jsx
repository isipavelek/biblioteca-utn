import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const LoginPage = ({ admins, setCurrentUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Email o contraseña incorrectos');
      } else {
        setError('Error al iniciar sesión. Intente más tarde.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '80vh',
      width: '100%'
    }} className="animate-fade-in">
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
              <label className="text-sm text-muted mb-8" style={{ display: 'block', marginBottom: '0.5rem' }}>Correo Electrónico</label>
              <div className="relative">
                <Mail size={18} className="absolute" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="email"
                  className="input-field" 
                  style={{ paddingLeft: '3rem' }} 
                  required
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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

            <button 
              type="submit" 
              disabled={isLoading}
              className="btn-primary w-full" 
              style={{ marginTop: '1rem', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'wait' : 'pointer' }}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
