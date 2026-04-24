import React, { useState } from 'react';
import { Search, Info, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Home = ({ books, categories }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBook, setSelectedBook] = useState(null);

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-fade-in">
      <div className="mb-8" style={{ textAlign: 'center' }}>
        <h1 className="text-3xl mb-8" style={{ fontSize: '3rem', background: 'linear-gradient(to right, #fff, var(--text-muted))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Biblioteca Escolar
        </h1>
        
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <div className="relative w-full">
            <Search className="absolute" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
            <input 
              className="input-field" 
              style={{ paddingLeft: '3rem' }} 
              placeholder="Buscar por título o autor..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <CategoryBtn active={selectedCategory === 'All'} onClick={() => setSelectedCategory('All')} label="Todos" />
          {categories.map(cat => (
            <CategoryBtn key={cat} active={selectedCategory === cat} onClick={() => setSelectedCategory(cat)} label={cat} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 grid-cols-2 grid-cols-3 grid-cols-4 gap-6">
        {filteredBooks.map(book => (
          <motion.div 
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={book.id} 
            className="glass-card hover-scale overflow-hidden" 
            style={{ cursor: 'pointer' }}
            onClick={() => setSelectedBook(book)}
          >
            <div style={{ height: '200px', width: '100%', overflow: 'hidden' }}>
              <img src={book.image} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="p-4">
              <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', marginBottom: '0.5rem', display: 'inline-block' }}>
                {book.category}
              </span>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{book.title}</h3>
              <p className="text-sm text-muted mb-8" style={{ marginBottom: '1rem' }}>{book.author}</p>
              
              <div className="flex items-center justify-between">
                <span className={`badge ${book.available_count > 0 ? 'badge-available' : 'badge-loaned'}`}>
                  {book.available_count > 0 ? `${book.available_count} disponibles` : 'No disponible'}
                </span>
                <Info size={18} className="text-muted" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedBook && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBook(null)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }} 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card" 
              style={{ maxWidth: '800px', width: '100%', overflow: 'hidden', position: 'relative' }}
            >
              <div className="flex" style={{ flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
                <div style={{ flex: 1, height: '400px' }}>
                  <img src={selectedBook.image} alt={selectedBook.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="p-4" style={{ flex: 1, padding: '2.5rem' }}>
                  <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', marginBottom: '1rem', display: 'inline-block' }}>
                    {selectedBook.category}
                  </span>
                  <h2 className="text-3xl mb-8" style={{ marginBottom: '0.5rem' }}>{selectedBook.title}</h2>
                  <p className="text-muted mb-8" style={{ fontSize: '1.125rem', marginBottom: '2rem' }}>por {selectedBook.author}</p>
                  
                  <div className="mb-8" style={{ marginBottom: '2rem' }}>
                    <h4 className="text-sm text-muted" style={{ marginBottom: '0.5rem', textTransform: 'uppercase' }}>Descripción</h4>
                    <p style={{ color: '#cbd5e1' }}>{selectedBook.description}</p>
                  </div>

                  <div className="flex items-center gap-6" style={{ gap: '2rem' }}>
                    <div>
                      <h4 className="text-sm text-muted" style={{ marginBottom: '0.25rem' }}>Disponibilidad</h4>
                      <div className="flex items-center gap-6" style={{ gap: '0.5rem' }}>
                        {selectedBook.available_count > 0 ? <CheckCircle color="#4ade80" size={20} /> : <XCircle color="#f87171" size={20} />}
                        <span style={{ fontWeight: '600' }}>{selectedBook.available_count} de {selectedBook.total_count}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedBook(null)}
                    className="btn-primary w-full mt-4" 
                    style={{ marginTop: '3rem' }}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CategoryBtn = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    className="glass-card" 
    style={{ 
      padding: '0.5rem 1.25rem', 
      borderRadius: '999px',
      fontSize: '0.875rem',
      background: active ? 'var(--primary)' : 'rgba(30, 41, 59, 0.4)',
      borderColor: active ? 'var(--primary)' : 'var(--border-glass)',
      color: active ? 'white' : 'var(--text-muted)'
    }}
  >
    {label}
  </button>
);

export default Home;
