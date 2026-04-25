import React, { useState } from 'react';
import { Book, TrendingUp, Monitor, AlertTriangle, Clock, Award, Filter } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const AdminDashboard = ({ books, students, loans }) => {
  const [courseFilter, setCourseFilter] = useState('all');

  const totalItems = books.reduce((acc, book) => acc + (book.total_count || 0), 0);
  const availableItems = books.reduce((acc, book) => acc + (book.available_count || 0), 0);
  const loanedItems = totalItems - availableItems;

  const equipmentCount = books
    .filter(b => b.category === 'Equipamiento' || b.category === 'Tecnología')
    .reduce((acc, b) => acc + (b.total_count || 0), 0);
  const literatureCount = totalItems - equipmentCount;

  const today = new Date();
  const overdueLoans = loans.filter(l => {
    if (l.status !== 'active') return false;
    return new Date(l.dueDate) < today;
  });

  const courses = [...new Set(students.map(s => s.grade).filter(Boolean))].sort();

  const pieData = [
    { name: 'Disponibles', value: availableItems, color: '#4ade80' },
    { name: 'Prestados', value: loanedItems, color: '#f87171' },
  ];

  const categoryData = books.reduce((acc, book) => {
    const catName = book.category || 'Sin Categoría';
    const existing = acc.find(item => item.name === catName);
    if (existing) {
      existing.total += (book.total_count || 0);
      existing.available += (book.available_count || 0);
    } else {
      acc.push({ name: catName, total: (book.total_count || 0), available: (book.available_count || 0) });
    }
    return acc;
  }, []).slice(0, 15);

  const getMostBorrowed = () => {
    let filteredLoans = courseFilter !== 'all'
      ? loans.filter(l => {
          const student = students.find(s => s.id === l.studentId);
          return student && student.grade === courseFilter;
        })
      : loans;

    const counts = filteredLoans.reduce((acc, loan) => {
      acc[loan.bookId] = (acc[loan.bookId] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([bookId, count]) => ({
        id: bookId,
        count,
        title: books.find(b => String(b.id) === String(bookId))?.title || 'Desconocido',
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const rankingData = getMostBorrowed();

  // ─── styles ────────────────────────────────────────────────────────────────
  const s = {
    page: { animation: 'fadeIn 0.4s ease' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
    h1: { fontSize: '1.4rem', fontWeight: '800', margin: 0 },
    subtitle: { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' },
    filterBox: {
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
      borderRadius: '0.6rem', padding: '0.35rem 0.75rem', backdropFilter: 'blur(12px)',
    },
    filterSelect: { background: 'none', color: 'white', border: 'none', outline: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' },

    // 4-column stat row
    statGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' },

    // main 2-column layout: left=pie, right=bar+ranking
    mainGrid: { display: 'grid', gridTemplateColumns: '280px 1fr', gap: '0.75rem', alignItems: 'start' },
    leftCol: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
    rightCol: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },

    card: {
      background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
      borderRadius: '1rem', backdropFilter: 'blur(12px)',
      boxShadow: 'var(--shadow-premium)',
    },
    cardPad: { padding: '1rem' },
    cardLabel: { fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.6rem' },

    // ranking row inside card
    rankingGrid: { display: 'grid', gridTemplateColumns: '1fr 160px', gap: '1rem', alignItems: 'center' },
    rankRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.5rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.025)', marginBottom: '0.25rem' },

    // overdue card
    overdue: { background: 'rgba(248,113,113,0.06)', borderLeft: '3px solid #f87171' },
    overdueLabel: { fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#f87171', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' },
    overdueRow: { fontSize: '0.7rem', padding: '0.3rem 0.4rem', borderRadius: '0.4rem', background: 'rgba(0,0,0,0.25)', marginBottom: '0.25rem' },
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.h1}>Resumen Estadístico</h1>
          <p style={s.subtitle}>Indicadores clave de la biblioteca</p>
        </div>
        <div style={s.filterBox}>
          <Filter size={13} color="var(--text-muted)" />
          <select style={s.filterSelect} value={courseFilter} onChange={e => setCourseFilter(e.target.value)}>
            <option value="all" style={{ background: '#1e293b' }}>Todos los cursos</option>
            {courses.map(c => <option key={c} value={c} style={{ background: '#1e293b' }}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div style={s.statGrid}>
        <StatCard icon={<Book size={16} />} label="Libros" value={literatureCount} color="#6366f1" />
        <StatCard icon={<Monitor size={16} />} label="Equipos" value={equipmentCount} color="#ec4899" />
        <StatCard icon={<AlertTriangle size={16} />} label="Vencidos" value={overdueLoans.length} color="#f87171" highlight={overdueLoans.length > 0} />
        <StatCard icon={<TrendingUp size={16} />} label="Uso" value={`${totalItems > 0 ? Math.round((loanedItems / totalItems) * 100) : 0}%`} color="#4ade80" />
      </div>

      {/* Main 2-column layout */}
      <div style={s.mainGrid}>
        {/* LEFT: Pie + optional overdue */}
        <div style={s.leftCol}>
          <div style={{ ...s.card, ...s.cardPad }}>
            <div style={s.cardLabel}>Disponibilidad</div>
            <div style={{ height: '170px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '0.5rem', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '0.25rem' }}>
              {pieData.map(d => (
                <div key={d.name} style={{ textAlign: 'center' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: d.color, margin: '0 auto 3px' }} />
                  <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>{d.value}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{d.name}</div>
                </div>
              ))}
            </div>
          </div>

          {overdueLoans.length > 0 && (
            <div style={{ ...s.card, ...s.cardPad, ...s.overdue }}>
              <div style={s.overdueLabel}><Clock size={11} /> Vencimientos</div>
              {overdueLoans.slice(0, 4).map(loan => {
                const student = students.find(s => s.id === loan.studentId);
                const book = books.find(b => b.id === loan.bookId);
                return (
                  <div key={loan.id} style={s.overdueRow}>
                    <span style={{ fontWeight: '700', color: 'white' }}>{student?.lastName}: </span>
                    <span style={{ color: 'var(--text-muted)' }}>{book?.title?.slice(0, 30)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Bar chart + Ranking */}
        <div style={s.rightCol}>
          <div style={{ ...s.card, ...s.cardPad }}>
            <div style={s.cardLabel}>Distribución por Categoría</div>
            <div style={{ height: '190px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={8} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={8} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '0.5rem', fontSize: '11px' }} />
                  <Bar dataKey="total" name="Total" fill="var(--primary)" opacity={0.85} radius={[2, 2, 0, 0]} barSize={10} />
                  <Bar dataKey="available" name="Disponibles" fill="var(--secondary)" opacity={0.85} radius={[2, 2, 0, 0]} barSize={10} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ ...s.card, ...s.cardPad }}>
            <div style={{ ...s.cardLabel, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Award size={13} color="var(--secondary)" /> Ranking más solicitado
            </div>
            <div style={s.rankingGrid}>
              <div>
                {rankingData.length > 0 ? rankingData.map((item, i) => (
                  <div key={item.id} style={s.rankRow}>
                    <span style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-muted)', minWidth: '14px' }}>{i + 1}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: '500', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--secondary)' }}>{item.count}</span>
                  </div>
                )) : (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sin datos de préstamos aún.</p>
                )}
              </div>
              {rankingData.length > 0 && (
                <div style={{ height: '130px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={rankingData}>
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="title" hide />
                      <Bar dataKey="count" fill="var(--accent)" radius={[0, 4, 4, 0]} barSize={10} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color, highlight }) => (
  <div style={{
    background: 'var(--bg-card)',
    border: highlight ? `1px solid ${color}40` : '1px solid var(--border-glass)',
    borderLeft: highlight ? `3px solid ${color}` : `3px solid ${color}40`,
    borderRadius: '0.75rem',
    backdropFilter: 'blur(12px)',
    padding: '0.75rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    height: '64px',
  }}>
    <div style={{ background: `${color}15`, color, padding: '0.45rem', borderRadius: '0.5rem', display: 'flex' }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: '0.6rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', margin: 0 }}>{label}</p>
      <h2 style={{ fontSize: '1.3rem', fontWeight: '800', lineHeight: 1, color: highlight ? color : 'white', margin: 0 }}>{value}</h2>
    </div>
  </div>
);

export default AdminDashboard;
