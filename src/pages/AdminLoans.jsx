import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Check, Clock, User, BookOpen, Search, MessageSquare, History, X, Trash2, ChevronDown } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

const SearchableSelect = ({ label, options, value, onChange, placeholder, icon: Icon, disabledOptions = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  const selectedOption = options.find(o => String(o.id) === String(value));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(o => 
    o.label.toLowerCase().includes(search.toLowerCase()) || 
    (o.sublabel && o.sublabel.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <label className="text-sm" style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="input-field"
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          cursor: 'pointer',
          borderColor: isOpen ? 'var(--primary)' : 'var(--border-glass)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
          {Icon && <Icon size={18} className="text-muted" />}
          <span style={{ 
            color: selectedOption ? 'white' : 'var(--text-muted)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown size={18} className="text-muted" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </div>

      {isOpen && (
        <div className="glass-card" style={{ 
          position: 'absolute', 
          top: '100%', 
          left: 0, 
          right: 0, 
          marginTop: '0.5rem', 
          zIndex: 100, 
          background: '#1e293b', 
          padding: '0.5rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
            <Search size={14} className="absolute" style={{ left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              autoFocus
              className="input-field"
              style={{ padding: '0.5rem 0.5rem 0.5rem 2.25rem', fontSize: '0.875rem', height: '36px' }}
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {filteredOptions.length > 0 ? filteredOptions.map(option => {
              const isDisabled = disabledOptions.includes(option.id);
              return (
                <div 
                  key={option.id}
                  onClick={() => {
                    if (!isDisabled) {
                      onChange(option.id);
                      setIsOpen(false);
                      setSearch('');
                    }
                  }}
                  style={{ 
                    padding: '0.75rem', 
                    borderRadius: '0.5rem', 
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    background: String(value) === String(option.id) ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    opacity: isDisabled ? 0.5 : 1,
                    transition: 'background 0.2s'
                  }}
                  className={isDisabled ? '' : 'hover:bg-white/5'}
                >
                  <div style={{ fontWeight: '500', fontSize: '0.875rem', color: String(value) === String(option.id) ? 'var(--primary)' : 'white' }}>{option.label}</div>
                  {option.sublabel && <div className="text-xs text-muted mt-1">{option.sublabel}</div>}
                </div>
              );
            }) : (
              <div className="text-center py-4 text-sm text-muted">No se encontraron resultados</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const AdminLoans = ({ loans, setLoans, books, setBooks, students, deleteLoan }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [observations, setObservations] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);
  
  const [formData, setFormData] = useState({
    bookId: '',
    studentId: '',
    unitCode: '001',
    loanDate: new Date().toISOString().split('T')[0]
  });

  const getBaseCode = (id) => {
    const book = books.find(b => b.id === id);
    if (!book) return '000000000';
    const t = (book.typeCode || '001').padStart(3, '0');
    const c = (book.categoryCode || '001').padStart(3, '0');
    const i = (book.itemCode || '001').padStart(3, '0');
    return `${t}${c}${i}`;
  };

  const handleCreateLoan = (e) => {
    e.preventDefault();
    const bookId = parseInt(formData.bookId);
    const book = books.find(b => b.id === bookId);

    if (!book || book.available_count <= 0) {
      alert('Este elemento no tiene unidades disponibles.');
      return;
    }

    const base = getBaseCode(bookId);
    const unit = formData.unitCode.padStart(3, '0');
    const fullCode = `${base}${unit}`;

    const newLoan = {
      id: Date.now(),
      bookId: bookId,
      studentId: parseInt(formData.studentId),
      loanDate: formData.loanDate,
      returnDate: null,
      status: 'active',
      observations: '',
      fullCode: fullCode
    };

    setLoans([newLoan, ...loans]);
    setBooks(books.map(b => b.id === bookId ? { ...b, available_count: b.available_count - 1 } : b));
    setIsModalOpen(false);
    setFormData({ ...formData, bookId: '', studentId: '' });
  };

  const handleOpenReturnModal = (loan) => {
    setSelectedLoan(loan);
    setObservations('');
    setIsReturnModalOpen(true);
  };

  const handleConfirmReturn = () => {
    setLoans(loans.map(l => l.id === selectedLoan.id ? { 
      ...l, 
      status: 'returned', 
      returnDate: new Date().toISOString().split('T')[0],
      observations: observations 
    } : l));
    setBooks(books.map(b => b.id === selectedLoan.bookId ? { ...b, available_count: b.available_count + 1 } : b));
    setIsReturnModalOpen(false);
    setSelectedLoan(null);
  };

  const handleDeleteLoan = (id) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDelete = () => {
    const loanToDelete = loans.find(l => l.id === deleteConfirm.id);
    if (loanToDelete) {
      if (loanToDelete.status === 'active') {
        setBooks(books.map(b => b.id === loanToDelete.bookId ? { ...b, available_count: b.available_count + 1 } : b));
      }
      if (deleteLoan) deleteLoan(deleteConfirm.id);
      setLoans(loans.filter(l => l.id !== deleteConfirm.id));
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  const confirmDeleteAll = () => {
    loans.forEach(l => {
      if (deleteLoan) deleteLoan(l.id);
    });
    setLoans([]);
    setDeleteAllConfirm(false);
  };

  const getBookTitle = (id) => books.find(b => b.id === id)?.title || 'Elemento eliminado';
  const getStudentName = (id) => students.find(s => s.id === id)?.name || 'Usuario eliminado';

  const filteredLoans = loans.filter(l => 
    getBookTitle(l.bookId).toLowerCase().includes(searchTerm.toLowerCase()) || 
    getStudentName(l.studentId).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.fullCode && l.fullCode.includes(searchTerm))
  );

  const bookOptions = books.map(b => ({
    id: b.id,
    label: b.title,
    sublabel: `${getBaseCode(b.id)} (${b.available_count} disponibles)`
  }));

  const userOptions = students.map(s => ({
    id: s.id,
    label: s.name,
    sublabel: `${s.grade} - ${s.type} (DNI: ${s.dni})`
  }));

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl">Préstamos de Libros y Equipos</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="glass-card" onClick={() => setDeleteAllConfirm(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
            <Trash2 size={20} /> Borrar Historial
          </button>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={20} /> Registrar Préstamo
          </button>
        </div>
      </div>

      <div className="glass-card p-4 mb-8">
        <div className="relative">
          <Search className="absolute" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
          <input 
            className="input-field" 
            style={{ paddingLeft: '3rem' }} 
            placeholder="Buscar por libro, equipo, usuario o código completo..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Código</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Elemento</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Usuario</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Fecha Préstamo</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Estado / Obs.</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredLoans.map(loan => (
              <tr key={loan.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                    {loan.fullCode || 'N/A'}
                  </code>
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <div className="flex items-center gap-2" style={{ gap: '0.5rem' }}>
                    <BookOpen size={16} className="text-muted" />
                    <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>{getBookTitle(loan.bookId)}</span>
                  </div>
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <div className="flex items-center gap-2" style={{ gap: '0.5rem' }}>
                    <User size={16} className="text-muted" />
                    <span style={{ fontSize: '0.9rem' }}>{getStudentName(loan.studentId)}</span>
                  </div>
                </td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>{loan.loanDate}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span className={`badge ${loan.status === 'active' ? 'badge-loaned' : 'badge-available'}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content', fontSize: '0.65rem', padding: '2px 6px' }}>
                      {loan.status === 'active' ? <Clock size={10} /> : <Check size={10} />}
                      {loan.status === 'active' ? 'Pendiente' : 'Devuelto'}
                    </span>
                    {loan.observations && (
                      <div className="text-[10px] text-muted flex items-center gap-1" style={{ marginTop: '2px' }}>
                        <MessageSquare size={10} />
                        <span style={{ fontStyle: 'italic' }}>{loan.observations}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                  <div className="flex items-center gap-2 justify-end">
                    {loan.status === 'active' ? (
                      <button 
                        onClick={() => handleOpenReturnModal(loan)}
                        className="btn-primary" 
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.3)' }}
                      >
                        Devolución
                      </button>
                    ) : (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{loan.returnDate}</div>
                    )}
                    <button 
                      onClick={() => handleDeleteLoan(loan.id)}
                      className="text-muted hover:text-red-400"
                      style={{ 
                        background: 'rgba(239, 68, 68, 0.1)', 
                        padding: '0.5rem', 
                        borderRadius: '0.5rem',
                        color: '#f87171',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && createPortal(
        <div style={{ 
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 99999, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '1rem' 
        }}>
          <div onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1 }} />
          <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '2.5rem', position: 'relative', zIndex: 2, background: '#1e293b' }}>
            <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 'bold' }}>Registrar Préstamo</h2>
            <form onSubmit={handleCreateLoan}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <SearchableSelect 
                  label="Seleccionar Libro o Equipo"
                  options={bookOptions}
                  value={formData.bookId}
                  onChange={(val) => setFormData({...formData, bookId: val})}
                  placeholder="Seleccione un elemento..."
                  icon={BookOpen}
                  disabledOptions={books.filter(b => b.available_count <= 0).map(b => b.id)}
                />
                
                <div>
                  <label className="text-sm" style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Número de Ejemplar (3 dígitos)</label>
                  <input className="input-field" maxLength="3" required value={formData.unitCode} onChange={(e) => setFormData({...formData, unitCode: e.target.value})} placeholder="001" />
                  <p className="text-xs text-muted mt-4" style={{ marginTop: '0.5rem' }}>
                    Código Final: {formData.bookId ? getBaseCode(parseInt(formData.bookId)) : '---------'}{formData.unitCode.padStart(3, '0')}
                  </p>
                </div>

                <SearchableSelect 
                  label="Seleccionar Usuario"
                  options={userOptions}
                  value={formData.studentId}
                  onChange={(val) => setFormData({...formData, studentId: val})}
                  placeholder="Seleccione un usuario..."
                  icon={User}
                />

                <div>
                  <label className="text-sm" style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Fecha</label>
                  <input type="date" className="input-field" required value={formData.loanDate} onChange={(e) => setFormData({...formData, loanDate: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-6" style={{ gap: '1rem', marginTop: '2.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', color: 'white', background: 'rgba(255,255,255,0.1)' }}>Cancelar</button>
                <button type="submit" disabled={!formData.bookId || !formData.studentId} className="btn-primary" style={{ flex: 1 }}>Confirmar</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {isReturnModalOpen && createPortal(
        <div style={{ 
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 99999, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '1rem' 
        }}>
          <div onClick={() => setIsReturnModalOpen(false)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1 }} />
          <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '2.5rem', position: 'relative', zIndex: 2, background: '#1e293b' }}>
            <div className="flex justify-between items-center mb-8" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Confirmar Devolución</h2>
              <button onClick={() => setIsReturnModalOpen(false)} style={{ background: 'none', color: 'var(--text-muted)' }}><X /></button>
            </div>
            <div className="mb-8" style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.75rem' }}>
              <p className="text-sm text-muted">Elemento: <span style={{ color: 'white', fontWeight: '500' }}>{getBookTitle(selectedLoan?.bookId)}</span></p>
              <p className="text-sm text-muted">Usuario: <span style={{ color: 'white', fontWeight: '500' }}>{getStudentName(selectedLoan?.studentId)}</span></p>
            </div>
            <div className="mb-8">
              <label className="text-sm" style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Observaciones (Opcional)</label>
              <textarea 
                className="input-field" 
                rows="3" 
                placeholder="Ej: Libro devuelto con desgaste..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
              />
            </div>
            <div className="flex gap-6" style={{ gap: '1rem', marginTop: '2rem' }}>
              <button onClick={() => setIsReturnModalOpen(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', color: 'white', background: 'rgba(255,255,255,0.1)' }}>Cancelar</button>
              <button className="btn-primary" style={{ flex: 1, background: '#4ade80' }} onClick={handleConfirmReturn}>Confirmar</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <ConfirmDialog 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="¿Eliminar préstamo?"
        message="¿Estás seguro de que deseas eliminar este registro? Si el préstamo está pendiente, el stock del libro se restaurará automáticamente."
      />

      <ConfirmDialog 
        isOpen={deleteAllConfirm}
        onClose={() => setDeleteAllConfirm(false)}
        onConfirm={confirmDeleteAll}
        title="⚠️ ¿ELIMINAR TODO EL HISTORIAL?"
        message="Esta acción borrará ABSOLUTAMENTE TODOS los registros de préstamos (pendientes y devueltos). ¿Estás seguro?"
        confirmText="SÍ, BORRAR TODO"
      />
    </div>
  );
};

export default AdminLoans;
