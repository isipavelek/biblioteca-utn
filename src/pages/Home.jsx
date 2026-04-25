import React, { useState } from 'react';
import { Search, Info, CheckCircle, XCircle, LayoutGrid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Home = ({ books, categories }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBook, setSelectedBook] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const filteredBooks = books.filter(book => {
    const matchesSearch = (book.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (book.author || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
  return (
    <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Search & Filter Toolbar */}
      <div className="glass-card p-3 mb-6 flex flex-wrap items-center justify-between gap-4" style={{ borderRadius: '1rem' }}>
        <div className="flex items-center gap-4 flex-1 min-w-[300px]">
          <div className="relative flex-1">
            <Search className="absolute" style={{ left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
            <input 
              className="input-field" 
              style={{ paddingLeft: '2.5rem', height: '36px', fontSize: '0.85rem', background: 'rgba(0,0,0,0.2)' }} 
              placeholder="Buscar título o autor..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex glass-card p-1" style={{ borderRadius: '0.6rem', gap: '0.15rem' }}>
            <button 
              onClick={() => setViewMode('grid')}
              style={{ padding: '0.4rem', borderRadius: '0.5rem', background: viewMode === 'grid' ? 'var(--primary)' : 'transparent', color: viewMode === 'grid' ? 'white' : 'var(--text-muted)' }}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              style={{ padding: '0.4rem', borderRadius: '0.5rem', background: viewMode === 'list' ? 'var(--primary)' : 'transparent', color: viewMode === 'list' ? 'white' : 'var(--text-muted)' }}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setSelectedCategory('All')}
            className="badge"
            style={{
              background: selectedCategory === 'All' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
              color: selectedCategory === 'All' ? 'white' : 'var(--text-muted)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              padding: '0.4rem 0.8rem',
              fontSize: '0.7rem',
              border: '1px solid transparent',
              borderColor: selectedCategory === 'All' ? 'transparent' : 'rgba(255,255,255,0.05)'
            }}
          >
            Todos
          </button>
          {[...new Set(categories)].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="badge"
              style={{
                background: selectedCategory === cat ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                color: selectedCategory === cat ? 'white' : 'var(--text-muted)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                padding: '0.4rem 0.8rem',
                fontSize: '0.7rem',
                border: '1px solid transparent',
                borderColor: selectedCategory === cat ? 'transparent' : 'rgba(255,255,255,0.05)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
          {filteredBooks.map(book => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={book.id} 
              className="glass-card hover-scale overflow-hidden" 
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%', background: 'rgba(30, 41, 59, 0.4)' }}
              onClick={() => setSelectedBook(book)}
            >
              <div style={{ height: '140px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                <img src={book.image} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '0.4rem', right: '0.4rem' }}>
                   <span className="badge" style={{ background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(4px)', fontSize: '0.6rem', padding: '2px 6px' }}>{book.category}</span>
                </div>
              </div>
              <div className="p-3 flex-1 flex flex-col" style={{ padding: '0.75rem' }}>
                <h3 style={{ 
                  fontSize: '0.85rem', 
                  fontWeight: '700', 
                  marginBottom: '0.25rem', 
                  lineHeight: '1.2',
                  display: '-webkit-box',
                  WebkitLineClamp: '2',
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  height: '2rem'
                }}>
                  {book.title}
                </h3>
                <p className="text-muted" style={{ fontSize: '0.7rem', marginBottom: '0.75rem' }}>{book.author}</p>
                
                <div className="flex items-center justify-between mt-auto pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: '800', color: book.available_count > 0 ? '#4ade80' : '#f87171' }}>
                    {book.available_count > 0 ? `${book.available_count} DISPONIBLES` : 'SIN STOCK'}
                  </span>
                  <Info size={14} className="text-muted" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          {filteredBooks.map((book, index) => (
            <div 
              key={book.id}
              onClick={() => setSelectedBook(book)}
              className="hover-card-row"
              style={{ 
                padding: '0.75rem 1rem', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                borderBottom: index === filteredBooks.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)'
              }}
            >
              <img src={book.image} alt="" style={{ width: '32px', height: '44px', borderRadius: '4px', objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{book.title}</div>
                <div className="text-[10px] text-muted">{book.author}</div>
              </div>
              <div className="hidden sm:block">
                <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', fontSize: '0.65rem' }}>{book.category}</span>
              </div>
              <div style={{ textAlign: 'right', minWidth: '100px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: book.available_count > 0 ? '#4ade80' : '#f87171' }}>
                  {book.available_count > 0 ? `${book.available_count} Disp.` : 'Agotado'}
                </div>
              </div>
              <Info size={14} className="text-muted" />
            </div>
          ))}
        </div>
      )}

      {filteredBooks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <p className="text-muted">No se encontraron libros con estos filtros.</p>
        </div>
      )}

      <AnimatePresence>
        {selectedBook && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBook(null)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }} 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card" 
              style={{ maxWidth: '800px', width: '100%', overflow: 'hidden', position: 'relative', background: '#1e293b' }}
            >
              <div style={{ display: 'flex', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
                <div style={{ flex: '0 0 350px', height: 'auto', maxHeight: '500px' }}>
                  <img src={selectedBook.image} alt={selectedBook.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="p-8 flex flex-col" style={{ flex: 1, padding: '3rem' }}>
                  <div className="flex justify-between items-start mb-4">
                    <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', marginBottom: '1rem' }}>
                      {selectedBook.category}
                    </span>
                    <button onClick={() => setSelectedBook(null)} className="text-muted hover:text-white"><XCircle size={24} /></button>
                  </div>
                  
                  <h2 style={{ fontSize: '2.25rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '0.5rem' }}>{selectedBook.title}</h2>
                  <p className="text-xl text-muted mb-8">por {selectedBook.author}</p>
                  
                  <div className="mb-8" style={{ flex: 1 }}>
                    <h4 className="text-xs font-bold text-muted uppercase tracking-widest mb-2">Descripción / Sinopsis</h4>
                    <p style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '0.95rem' }}>{selectedBook.description || 'Sin descripción disponible para este ejemplar.'}</p>
                  </div>

                  <div className="glass-card p-4 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div>
                      <h4 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Estado de Inventario</h4>
                      <div className="flex items-center gap-2">
                        {selectedBook.available_count > 0 ? <CheckCircle color="#4ade80" size={18} /> : <XCircle color="#f87171" size={18} />}
                        <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{selectedBook.available_count} de {selectedBook.total_count} unidades</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                       <span style={{ fontSize: '0.75rem', fontWeight: '700', color: selectedBook.available_count > 0 ? '#4ade80' : '#f87171', background: selectedBook.available_count > 0 ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)', padding: '4px 12px', borderRadius: '6px' }}>
                          {selectedBook.available_count > 0 ? 'DISPONIBLE' : 'AGOTADO'}
                       </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedBook(null)}
                    className="btn-primary w-full mt-8 py-4 text-lg" 
                  >
                    Volver al Catálogo
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
