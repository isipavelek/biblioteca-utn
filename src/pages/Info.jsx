import React from 'react';
import { Clock, Calendar, ShieldCheck, HelpCircle, Phone, Mail, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const Info = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ 
          fontSize: '2.25rem', 
          fontWeight: '800',
          background: 'linear-gradient(to right, #fff, var(--text-muted))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem'
        }}>
          Información Institucional
        </h1>
        <p className="text-lg text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
          Recursos y normas para el uso de la biblioteca.
        </p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}
      >
        {/* Horarios */}
        <motion.div variants={item} className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.5rem', borderRadius: '0.75rem', color: 'var(--primary)' }}>
              <Clock size={20} />
            </div>
            <h2 className="text-xl font-bold">Horarios</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.4rem' }}>
              <span style={{ fontWeight: '600' }}>Turno Mañana</span>
              <span className="text-muted">08:00 - 12:30</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.4rem' }}>
              <span style={{ fontWeight: '600' }}>Turno Tarde</span>
              <span className="text-muted">14:00 - 18:30</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
              <span style={{ fontWeight: '600' }}>Sábados</span>
              <span style={{ color: '#f87171', fontWeight: '700' }}>CERRADO</span>
            </div>
          </div>
        </motion.div>

        {/* Reglas de Préstamo */}
        <motion.div variants={item} className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '0.5rem', borderRadius: '0.75rem', color: 'var(--secondary)' }}>
              <ShieldCheck size={20} />
            </div>
            <h2 className="text-xl font-bold">Normas</h2>
          </div>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
            <li>Máximo de 2 libros por alumno.</li>
            <li>Plazo de préstamo: 14 días.</li>
            <li>Equipamiento: Uso exclusivo en aula.</li>
            <li>Reposición obligatoria por daño grave.</li>
          </ul>
        </motion.div>

        {/* FAQ o Tips */}
        <motion.div variants={item} className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '0.5rem', borderRadius: '0.75rem', color: 'var(--accent)' }}>
              <HelpCircle size={20} />
            </div>
            <h2 className="text-xl font-bold">Ayuda</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div>
              <p style={{ fontWeight: '700', marginBottom: '0.1rem' }}>Renovaciones</p>
              <p className="text-muted">Traer el ejemplar físicamente para renovar.</p>
            </div>
            <div>
              <p style={{ fontWeight: '700', marginBottom: '0.1rem' }}>Notebooks</p>
              <p className="text-muted">Solo bajo supervisión docente.</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Contacto */}
      <motion.div 
        variants={item} 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card" 
        style={{ marginTop: '2rem', padding: '2rem', textAlign: 'center' }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-primary" />
            <span className="font-semibold">0800-BIBLIO-UTN</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-primary" />
            <span className="font-semibold">biblioteca@utn.edu.ar</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Info;
