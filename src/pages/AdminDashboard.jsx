import React, { useState } from 'react';
import { Book, Users, ClipboardList, TrendingUp, CheckCircle, XCircle, Award, Filter, Monitor, AlertTriangle, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const AdminDashboard = ({ books, students, loans }) => {
  const [courseFilter, setCourseFilter] = useState('all');

  const totalItems = books.reduce((acc, book) => acc + (book.total_count || 0), 0);
  const availableItems = books.reduce((acc, book) => acc + (book.available_count || 0), 0);
  const loanedItems = totalItems - availableItems;
  
  // Equipment vs Books
  const equipmentCount = books.filter(b => b.category === 'Equipamiento' || b.category === 'Tecnología').reduce((acc, b) => acc + b.total_count, 0);
  const literatureCount = totalItems - equipmentCount;

  // Overdue Loans
  const today = new Date();
  const overdueLoans = loans.filter(l => {
    if (l.status !== 'active') return false;
    const dueDate = new Date(l.dueDate);
    return dueDate < today;
  });

  const courses = [...new Set(students.map(s => s.grade).filter(Boolean))].sort();

  const pieData = [
    { name: 'Disponibles', value: availableItems, color: '#4ade80' },
    { name: 'Prestados', value: loanedItems, color: '#f87171' }
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
  }, []);

  const getMostBorrowed = () => {
    let filteredLoans = loans;
    if (courseFilter !== 'all') {
      filteredLoans = loans.filter(l => {
        const student = students.find(s => s.id === l.studentId);
        return student && student.grade === courseFilter;
      });
    }

    const counts = filteredLoans.reduce((acc, loan) => {
      acc[loan.bookId] = (acc[loan.bookId] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([bookId, count]) => ({
        id: bookId,
        count,
        title: books.find(b => String(b.id) === String(bookId))?.title || 'Desconocido'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const rankingData = getMostBorrowed();

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl">Panel de Control</h1>
          <p className="text-muted text-sm mt-1">Resumen general de la biblioteca y equipamiento</p>
        </div>
        <div className="flex items-center gap-4 glass-card px-4 py-2" style={{ padding: '0.5rem 1rem' }}>
          <Filter size={18} className="text-muted" />
          <span className="text-sm text-muted">Filtrar Ranking:</span>
          <select 
            className="text-sm" 
            style={{ background: 'none', color: 'white', border: 'none', outline: 'none', cursor: 'pointer' }}
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
          >
            <option value="all" style={{ background: '#1e293b' }}>Todos los cursos</option>
            {courses.map(c => (
              <option key={c} value={c} style={{ background: '#1e293b' }}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<Book size={20} />} label="Libros" value={literatureCount} color="#6366f1" />
        <StatCard icon={<Monitor size={20} />} label="Equipos" value={equipmentCount} color="#ec4899" />
        <StatCard icon={<AlertTriangle size={20} />} label="Vencidos" value={overdueLoans.length} color="#f87171" highlight={overdueLoans.length > 0} />
        <StatCard icon={<TrendingUp size={20} />} label="Uso" value={`${totalItems > 0 ? Math.round((loanedItems/totalItems)*100) : 0}%`} color="#4ade80" />
      </div>

      {overdueLoans.length > 0 && (
        <div className="glass-card mb-6 p-4 border-l-4" style={{ borderColor: '#f87171', background: 'rgba(248, 113, 113, 0.05)' }}>
          <div className="flex items-center gap-3 mb-3">
            <Clock className="text-red-400" size={20} style={{ color: '#f87171' }} />
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#f87171' }}>Alertas Críticas: Préstamos Vencidos</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {overdueLoans.slice(0, 3).map(loan => {
              const student = students.find(s => s.id === loan.studentId);
              const book = books.find(b => b.id === loan.bookId);
              return (
                <div key={loan.id} className="glass-card px-3 py-2 text-xs flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <span style={{ fontWeight: '700' }}>{student?.lastName || 'Usuario'}:</span>
                  <span className="text-muted">{book?.title || 'Libro'}</span>
                  <span style={{ color: '#f87171', marginLeft: '4px' }}>{new Date(loan.dueDate).toLocaleDateString()}</span>
                </div>
              );
            })}
            {overdueLoans.length > 3 && <div className="text-xs text-muted self-center">y {overdueLoans.length - 3} más...</div>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <div className="glass-card p-5 lg:col-span-4" style={{ minHeight: '350px' }}>
          <h3 className="text-xs mb-6 font-bold uppercase text-muted tracking-widest">Disponibilidad</h3>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around mt-4">
            {pieData.map(d => (
              <div key={d.name} className="text-center">
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color, margin: '0 auto 4px' }}></div>
                <div className="text-xs font-bold">{d.value}</div>
                <div className="text-[10px] text-muted uppercase">{d.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5 lg:col-span-8" style={{ minHeight: '350px' }}>
          <h3 className="text-xs mb-6 font-bold uppercase text-muted tracking-widest">Distribución por Categoría</h3>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '0.75rem' }}
                />
                <Bar dataKey="total" name="Total" fill="rgba(99, 102, 241, 0.8)" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="available" name="Disponibles" fill="rgba(74, 222, 128, 0.8)" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Award size={22} className="text-secondary" style={{ color: 'var(--secondary)' }} />
          <h3 className="text-xs font-bold uppercase text-muted tracking-widest">Ranking de Más Solicitados {courseFilter !== 'all' ? `en ${courseFilter}` : 'General'}</h3>
        </div>
        
        {rankingData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="flex flex-col gap-3">
              {rankingData.map((item, index) => (
                <div key={item.id} className="flex items-center gap-4 group" style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1.25rem', borderRadius: '1rem', border: '1px solid transparent', transition: 'all 0.3s' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    background: index === 0 ? 'linear-gradient(135deg, #fbbf24, #d97706)' : index === 1 ? 'linear-gradient(135deg, #94a3b8, #475569)' : index === 2 ? 'linear-gradient(135deg, #a8a29e, #78716c)' : 'rgba(255,255,255,0.05)',
                    color: index < 3 ? 'white' : 'var(--text-muted)',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '0.875rem'
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{item.title}</div>
                    <div className="text-xs text-muted">{item.count} préstamos registrados</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={rankingData} margin={{ left: 10, right: 30 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="title" hide />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '0.75rem' }}
                  />
                  <Bar dataKey="count" fill="var(--secondary)" radius={[0, 6, 6, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-muted">
            <ClipboardList size={40} className="mx-auto mb-3 opacity-20" />
            <p>No hay datos suficientes para generar un ranking en este curso.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color, highlight }) => (
  <div className="glass-card p-4 transition-all hover:scale-[1.02]" style={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: '1.25rem',
    borderLeft: highlight ? `4px solid ${color}` : '1px solid rgba(255,255,255,0.1)'
  }}>
    <div style={{ background: `${color}15`, color: color, padding: '0.875rem', borderRadius: '1rem', display: 'flex' }}>
      {icon}
    </div>
    <div style={{ overflow: 'hidden' }}>
      <p className="text-xs font-bold uppercase tracking-widest text-muted mb-1">{label}</p>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: highlight ? color : 'white' }}>{value}</h2>
    </div>
  </div>
);

export default AdminDashboard;
