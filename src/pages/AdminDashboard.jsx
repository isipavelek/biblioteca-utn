import React, { useState } from 'react';
import { Book, Users, ClipboardList, TrendingUp, CheckCircle, XCircle, Award, Filter, Monitor, AlertTriangle, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const AdminDashboard = ({ books, students, loans }) => {
  const [courseFilter, setCourseFilter] = useState('all');

  const totalItems = books.reduce((acc, book) => acc + (book.total_count || 0), 0);
  const availableItems = books.reduce((acc, book) => acc + (book.available_count || 0), 0);
  const loanedItems = totalItems - availableItems;
  
  const equipmentCount = books.filter(b => b.category === 'Equipamiento' || b.category === 'Tecnología').reduce((acc, b) => acc + b.total_count, 0);
  const literatureCount = totalItems - equipmentCount;

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
  }, []).slice(0, 15); // Limit categories for better density

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
    <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Resumen Estadístico</h1>
          <p className="text-muted text-xs mt-1">Indicadores clave de la biblioteca</p>
        </div>
        <div className="flex items-center gap-3 glass-card px-3 py-1.5" style={{ borderRadius: '0.75rem' }}>
          <Filter size={14} className="text-muted" />
          <select 
            className="text-xs" 
            style={{ background: 'none', color: 'white', border: 'none', outline: 'none', cursor: 'pointer', fontWeight: '600' }}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<Book size={18} />} label="Libros" value={literatureCount} color="#6366f1" />
        <StatCard icon={<Monitor size={18} />} label="Equipos" value={equipmentCount} color="#ec4899" />
        <StatCard icon={<AlertTriangle size={18} />} label="Vencidos" value={overdueLoans.length} color="#f87171" highlight={overdueLoans.length > 0} />
        <StatCard icon={<TrendingUp size={18} />} label="Uso" value={`${totalItems > 0 ? Math.round((loanedItems/totalItems)*100) : 0}%`} color="#4ade80" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Disponibilidad */}
          <div className="glass-card p-4">
            <h3 className="text-[10px] font-bold uppercase text-muted tracking-widest mb-4">Disponibilidad</h3>
            <div style={{ height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '0.5rem', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-around mt-2">
              {pieData.map(d => (
                <div key={d.name} className="text-center">
                  <div className="text-sm font-bold">{d.value}</div>
                  <div className="text-[9px] text-muted uppercase">{d.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Overdue Alerts */}
          {overdueLoans.length > 0 && (
            <div className="glass-card p-4" style={{ background: 'rgba(248, 113, 113, 0.05)', borderLeft: '3px solid #f87171' }}>
              <h3 className="text-[10px] font-bold uppercase text-red-400 tracking-widest mb-3 flex items-center gap-2">
                <Clock size={12} /> Alertas de Vencimiento
              </h3>
              <div className="flex flex-col gap-2">
                {overdueLoans.slice(0, 3).map(loan => {
                  const student = students.find(s => s.id === loan.studentId);
                  const book = books.find(b => b.id === loan.bookId);
                  return (
                    <div key={loan.id} className="text-[10px] p-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.2)' }}>
                      <span className="font-bold text-white">{student?.lastName}: </span>
                      <span className="text-muted truncate inline-block max-w-[120px] align-bottom">{book?.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Distribución */}
          <div className="glass-card p-4">
            <h3 className="text-[10px] font-bold uppercase text-muted tracking-widest mb-4">Distribución por Categoría</h3>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={9} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={9} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '0.5rem', fontSize: '11px' }}
                  />
                  <Bar dataKey="total" name="Total" fill="var(--primary)" opacity={0.8} radius={[2, 2, 0, 0]} barSize={12} />
                  <Bar dataKey="available" name="Disp." fill="var(--secondary)" opacity={0.8} radius={[2, 2, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ranking */}
          <div className="glass-card p-4">
            <h3 className="text-[10px] font-bold uppercase text-muted tracking-widest mb-4 flex items-center gap-2">
              <Award size={14} className="text-secondary" /> Ranking de lo más solicitado
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                {rankingData.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="text-xs font-black text-muted" style={{ width: '15px' }}>{index + 1}</div>
                    <div className="text-[11px] font-medium truncate flex-1">{item.title}</div>
                    <div className="text-[10px] font-bold text-secondary">{item.count}</div>
                  </div>
                ))}
              </div>
              <div style={{ height: '140px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={rankingData}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="title" hide />
                    <Bar dataKey="count" fill="var(--accent)" radius={[0, 4, 4, 0]} barSize={10} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color, highlight }) => (
  <div className="glass-card p-3 flex items-center gap-3" style={{ 
    borderLeft: highlight ? `3px solid ${color}` : '1px solid rgba(255,255,255,0.05)',
    height: '70px'
  }}>
    <div style={{ background: `${color}10`, color: color, padding: '0.6rem', borderRadius: '0.5rem' }}>
      {icon}
    </div>
    <div style={{ overflow: 'hidden' }}>
      <p className="text-[9px] font-bold uppercase tracking-widest text-muted mb-0.5">{label}</p>
      <h2 style={{ fontSize: '1.25rem', fontWeight: '800', lineHeight: 1 }}>{value}</h2>
    </div>
  </div>
);

export default AdminDashboard;
