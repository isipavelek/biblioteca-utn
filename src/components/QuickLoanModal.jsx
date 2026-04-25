import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Zap, X, Search, User, Book, Check, AlertTriangle, ChevronRight, Loader } from 'lucide-react';

const card = {
  background: 'rgba(30,41,59,0.97)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '0.75rem',
  padding: '0.75rem 1rem',
};

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '0.6rem', padding: '0.6rem 0.75rem 0.6rem 2.25rem',
  color: 'white', outline: 'none', fontSize: '0.875rem',
};

const rowStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '0.55rem 0.75rem', borderRadius: '0.6rem',
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
  marginBottom: '0.3rem', cursor: 'pointer', transition: 'background 0.15s',
};

const QuickLoanModal = ({ books, students, loans, onLoanCreated }) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [studentSearch, setStudentSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const studentRef = useRef(null);
  const bookRef = useRef(null);

  useEffect(() => {
    if (open && step === 1) setTimeout(() => studentRef.current?.focus(), 100);
    if (open && step === 2) setTimeout(() => bookRef.current?.focus(), 100);
  }, [open, step]);

  const handleOpen = () => {
    setStep(1); setStudentSearch(''); setBookSearch('');
    setSelectedStudent(null); setSelectedBook(null);
    setDone(false); setLoading(false); setOpen(true);
  };

  const filteredStudents = studentSearch
    ? students.filter(s => {
        const q = studentSearch.toLowerCase();
        return `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
               `${s.lastName} ${s.firstName}`.toLowerCase().includes(q) ||
               (s.grade || '').toLowerCase().includes(q);
      }).slice(0, 6)
    : [];

  const filteredBooks = bookSearch
    ? books.filter(b => {
        const q = bookSearch.toLowerCase();
        return (b.title || '').toLowerCase().includes(q) || (b.code || '').toLowerCase().includes(q);
      }).slice(0, 6)
    : [];

  const studentActiveLoans = loans.filter(l => l.studentId === selectedStudent?.id && l.status === 'active');
  const atLimit = studentActiveLoans.length >= 2;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);
  const dueDateISO = dueDate.toISOString().split('T')[0];
  const dueDateDisplay = dueDate.toLocaleDateString('es-AR');

  const handleConfirm = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const newLoan = {
      id: Date.now(), studentId: selectedStudent.id, bookId: selectedBook.id,
      fullCode: selectedBook.code || String(selectedBook.id),
      loanDate: today, dueDate: dueDateISO, status: 'active', observations: '',
    };
    await onLoanCreated(newLoan, selectedBook);
    setLoading(false); setDone(true);
    setTimeout(() => { setOpen(false); }, 1800);
  };

  // FAB button
  if (!open) return (
    <button onClick={handleOpen} title="Préstamo Rápido" style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 999,
      width: '52px', height: '52px', borderRadius: '50%',
      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      color: 'white', border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 8px 24px rgba(99,102,241,0.5)', transition: 'transform 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <Zap size={22} />
    </button>
  );

  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={() => setOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'relative', width: '100%', maxWidth: '460px', background: '#1e293b', borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>

        {/* Header */}
        <div style={{ padding: '0.9rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(99,102,241,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={17} color="#6366f1" />
            <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>Préstamo Rápido</span>
          </div>
          {/* Step dots */}
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            {[1,2,3].map(n => (
              <div key={n} style={{ width: n === step ? 20 : 7, height: 7, borderRadius: 4, background: n <= step ? '#6366f1' : 'rgba(255,255,255,0.15)', transition: 'all 0.3s' }} />
            ))}
          </div>
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.25rem' }}>

          {/* DONE */}
          {done && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(74,222,128,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                <Check size={26} color="#4ade80" />
              </div>
              <p style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.25rem' }}>¡Préstamo registrado!</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{selectedStudent?.lastName} — {selectedBook?.title?.slice(0, 38)}</p>
            </div>
          )}

          {/* STEP 1: Student */}
          {!done && step === 1 && (
            <div>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>1 — Seleccioná el alumno</p>
              <div style={{ position: 'relative', marginBottom: '0.6rem' }}>
                <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input ref={studentRef} value={studentSearch} onChange={e => setStudentSearch(e.target.value)} placeholder="Nombre, apellido o curso..." style={inputStyle} />
              </div>
              {filteredStudents.map(s => {
                const active = loans.filter(l => l.studentId === s.id && l.status === 'active').length;
                return (
                  <div key={s.id} onClick={() => { setSelectedStudent(s); setStep(2); setStudentSearch(''); }} style={rowStyle}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={15} color="var(--text-muted)" />
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{s.lastName}, {s.firstName}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{s.grade || 'Sin curso'}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {active >= 2 && <span style={{ fontSize: '0.58rem', background: 'rgba(248,113,113,0.15)', color: '#f87171', padding: '2px 5px', borderRadius: '4px', fontWeight: '700' }}>LÍMITE</span>}
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{active}/2</span>
                      <ChevronRight size={13} color="var(--text-muted)" />
                    </div>
                  </div>
                );
              })}
              {studentSearch && filteredStudents.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '0.75rem 0' }}>Sin resultados</p>}
            </div>
          )}

          {/* STEP 2: Book */}
          {!done && step === 2 && (
            <div>
              {/* Selected student chip */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '0.5rem', marginBottom: '0.75rem' }}>
                <User size={13} color="#6366f1" />
                <span style={{ fontSize: '0.8rem', fontWeight: '600', flex: 1 }}>{selectedStudent?.lastName}, {selectedStudent?.firstName} · {selectedStudent?.grade}</span>
                <button onClick={() => { setStep(1); setSelectedStudent(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}><X size={13} /></button>
              </div>
              {atLimit && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0.75rem', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: '0.5rem', marginBottom: '0.75rem' }}>
                  <AlertTriangle size={13} color="#f87171" />
                  <span style={{ fontSize: '0.75rem', color: '#f87171' }}>Límite de 2 libros alcanzado.</span>
                </div>
              )}
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>2 — Seleccioná el libro</p>
              <div style={{ position: 'relative', marginBottom: '0.6rem' }}>
                <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input ref={bookRef} value={bookSearch} onChange={e => setBookSearch(e.target.value)} placeholder="Título o código..." disabled={atLimit} style={{ ...inputStyle, opacity: atLimit ? 0.5 : 1 }} />
              </div>
              {filteredBooks.map(b => {
                const avail = b.available_count || 0;
                const alreadyHas = loans.some(l => l.bookId === b.id && l.studentId === selectedStudent?.id && l.status === 'active');
                const disabled = avail === 0 || alreadyHas || atLimit;
                return (
                  <div key={b.id}
                    onClick={() => { if (!disabled) { setSelectedBook(b); setStep(3); setBookSearch(''); } }}
                    style={{ ...rowStyle, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1 }}
                    onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; }}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, overflow: 'hidden' }}>
                      <Book size={15} color={avail > 0 ? '#4ade80' : '#f87171'} style={{ flexShrink: 0 }} />
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: '600', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{b.code || b.id}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                      {alreadyHas && <span style={{ fontSize: '0.58rem', background: 'rgba(248,113,113,0.15)', color: '#f87171', padding: '2px 5px', borderRadius: '4px' }}>YA TIENE</span>}
                      <span style={{ fontSize: '0.72rem', fontWeight: '700', color: avail > 0 ? '#4ade80' : '#f87171' }}>{avail} disp.</span>
                      {!disabled && <ChevronRight size={13} color="var(--text-muted)" />}
                    </div>
                  </div>
                );
              })}
              {bookSearch && filteredBooks.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '0.75rem 0' }}>Sin resultados</p>}
            </div>
          )}

          {/* STEP 3: Confirm */}
          {!done && step === 3 && (
            <div>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>3 — Confirmar</p>
              <div style={{ ...card, marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', paddingBottom: '0.65rem', marginBottom: '0.65rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ background: 'rgba(99,102,241,0.15)', padding: '0.45rem', borderRadius: '0.5rem', display: 'flex' }}><User size={17} color="#6366f1" /></div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{selectedStudent?.lastName}, {selectedStudent?.firstName}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{selectedStudent?.grade} · préstamo {studentActiveLoans.length + 1}/2</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ background: 'rgba(74,222,128,0.1)', padding: '0.45rem', borderRadius: '0.5rem', display: 'flex' }}><Book size={17} color="#4ade80" /></div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{selectedBook?.title?.slice(0, 40)}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Vence: {dueDateDisplay}</div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.6rem', padding: '0.6rem', color: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>← Atrás</button>
                <button onClick={handleConfirm} disabled={loading} style={{ flex: 2, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '0.6rem', padding: '0.6rem', color: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  {loading ? <Loader size={15} /> : <Check size={15} />}
                  {loading ? 'Registrando...' : 'Confirmar Préstamo'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
};

export default QuickLoanModal;
