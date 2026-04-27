import React from 'react';
import { Clock, ShieldCheck, HelpCircle, Mail, MapPin, Search, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import logo from '../assets/Logo.png';

const Info = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      {/* Hero Section with Logo */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem', marginTop: '1rem' }}>
        <motion.img 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          src={logo} 
          alt="UTN EST Logo" 
          style={{ width: '180px', height: 'auto', marginBottom: '2rem' }} 
        />
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '800',
          background: 'linear-gradient(to right, #fff, #94a3b8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1rem',
          lineHeight: '1.2'
        }}>
          Biblioteca Escolar
        </h1>
        <p className="text-xl" style={{ color: '#94a3b8', maxWidth: '700px', margin: '0 auto', fontWeight: '500' }}>
          Escuela Secundaria Técnica de la UTN <br/>
          <span style={{ color: 'var(--primary)' }}>Sede San Miguel</span>
        </p>
        
        <div style={{ marginTop: '2.5rem' }}>
          <Link to="/search" className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <Search size={22} /> Ir al Buscador de Libros
          </Link>
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}
      >
        {/* Horarios Oficiales */}
        <motion.div variants={item} className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.6rem', borderRadius: '0.75rem', color: 'var(--primary)' }}>
              <Clock size={24} />
            </div>
            <h2 className="text-xl font-bold">Horarios de Atención</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem' }}>
              <span style={{ fontWeight: '600' }}>Lunes a Viernes</span>
              <span style={{ color: 'var(--primary)', fontWeight: '700' }}>09:00 - 15:00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', opacity: 0.6 }}>
              <span style={{ fontWeight: '600' }}>Sábados y Domingos</span>
              <span style={{ color: '#f87171', fontWeight: '700' }}>CERRADO</span>
            </div>
          </div>
        </motion.div>

        {/* Normas de la Biblioteca */}
        <motion.div variants={item} className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '0.6rem', borderRadius: '0.75rem', color: 'var(--secondary)' }}>
              <ShieldCheck size={24} />
            </div>
            <h2 className="text-xl font-bold">Normas de Uso</h2>
          </div>
          <ul style={{ paddingLeft: '0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
            <li style={{ display: 'flex', gap: '0.5rem' }}>• Máximo de 2 libros simultáneos por alumno.</li>
            <li style={{ display: 'flex', gap: '0.5rem' }}>• Plazo de devolución: 14 días corridos.</li>
            <li style={{ display: 'flex', gap: '0.5rem' }}>• El equipamiento tecnológico es de uso exclusivo en aula.</li>
            <li style={{ display: 'flex', gap: '0.5rem' }}>• Cuidar el material; en caso de pérdida o daño se debe reponer.</li>
          </ul>
        </motion.div>

        {/* Ubicación y Contacto */}
        <motion.div variants={item} className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '0.6rem', borderRadius: '0.75rem', color: 'var(--accent)' }}>
              <MapPin size={24} />
            </div>
            <h2 className="text-xl font-bold">Ubicación y Contacto</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <MapPin size={18} className="text-primary" style={{ marginTop: '0.2rem' }} />
              <div>
                <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Sede San Miguel</p>
                <p className="text-sm text-muted">Rafael 50, Bella Vista, San Miguel</p>
                <a 
                  href="https://share.google/XFAW1HwkWplsaFF0I" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: 'var(--primary)', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.5rem' }}
                >
                  <ExternalLink size={12} /> Ver en Google Maps
                </a>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Mail size={18} className="text-primary" />
              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontWeight: '600', marginBottom: '0.1rem' }}>Correo Electrónico</p>
                <a href="mailto:est.sanmiguel@inspt.utn.edu.ar" style={{ color: 'var(--primary)', fontSize: '0.85rem', textDecoration: 'none' }}>
                  est.sanmiguel@inspt.utn.edu.ar
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer / FAQ Tip */}
      <motion.div 
        variants={item}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={{ marginTop: '3rem', textAlign: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <p className="text-sm text-muted">
          <HelpCircle size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
          Para renovaciones, es necesario presentar el ejemplar físicamente en la biblioteca.
        </p>
      </motion.div>
    </div>
  );
};

export default Info;
