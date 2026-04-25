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
    <div className="animate-fade-in" style={{ paddingBottom: '5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ 
          fontSize: '3.5rem', 
          fontWeight: '800',
          background: 'linear-gradient(to right, #fff, var(--text-muted))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1rem'
        }}>
          Información Institucional
        </h1>
        <p className="text-xl text-muted" style={{ maxWidth: '700px', margin: '0 auto' }}>
          Todo lo que necesitas saber para utilizar los recursos de nuestra biblioteca y laboratorio tecnológico.
        </p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}
      >
        {/* Horarios */}
        <motion.div variants={item} className="glass-card" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: '1rem', color: 'var(--primary)' }}>
              <Clock size={28} />
            </div>
            <h2 className="text-2xl font-bold">Horarios de Atención</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
              <span style={{ fontWeight: '600' }}>Lunes a Viernes (Mañana)</span>
              <span className="text-muted">08:00 - 12:30</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
              <span style={{ fontWeight: '600' }}>Lunes a Viernes (Tarde)</span>
              <span className="text-muted">14:00 - 18:30</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
              <span style={{ fontWeight: '600' }}>Sábados y Feriados</span>
              <span style={{ color: '#f87171', fontSize: '0.875rem', fontWeight: '700' }}>CERRADO</span>
            </div>
          </div>
        </motion.div>

        {/* Reglas de Préstamo */}
        <motion.div variants={item} className="glass-card" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '0.75rem', borderRadius: '1rem', color: 'var(--secondary)' }}>
              <ShieldCheck size={28} />
            </div>
            <h2 className="text-2xl font-bold">Reglas de Uso</h2>
          </div>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#cbd5e1' }}>
            <li>Máximo de **2 libros** por alumno en simultáneo.</li>
            <li>Plazo de préstamo: **14 días** (renovables una vez).</li>
            <li>El equipamiento tecnológico es de uso **exclusivo en el aula**.</li>
            <li>La pérdida o daño grave requiere la reposición del ejemplar.</li>
            <li>Los manuales de estudio tienen prioridad para el año cursado.</li>
          </ul>
        </motion.div>

        {/* FAQ o Tips */}
        <motion.div variants={item} className="glass-card" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '0.75rem', borderRadius: '1rem', color: 'var(--accent)' }}>
              <HelpCircle size={28} />
            </div>
            <h2 className="text-2xl font-bold">Preguntas Frecuentes</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <p style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.25rem' }}>¿Cómo renuevo un libro?</p>
              <p className="text-sm text-muted">Debes traer el libro físicamente para que el preceptor actualice la fecha.</p>
            </div>
            <div>
              <p style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.25rem' }}>¿Puedo retirar una notebook?</p>
              <p className="text-sm text-muted">No, las notebooks solo se prestan bajo supervisión docente dentro del establecimiento.</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Contacto */}
      <motion.div 
        variants={item} 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card" 
        style={{ marginTop: '3rem', padding: '3rem', textAlign: 'center', background: 'linear-gradient(rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))' }}
      >
        <h3 className="text-2xl font-bold mb-8">¿Tienes dudas adicionales?</h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap' }}>
          <div className="flex items-center gap-2">
            <Phone size={20} className="text-primary" />
            <span className="font-semibold">0800-BIBLIO-UTN</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={20} className="text-primary" />
            <span className="font-semibold">biblioteca@utn.edu.ar</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={20} className="text-primary" />
            <span className="font-semibold">Planta Baja - Ala Norte</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Info;
