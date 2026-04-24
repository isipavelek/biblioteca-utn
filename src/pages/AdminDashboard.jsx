import React, { useState } from 'react';
import { Book, Users, ClipboardList, TrendingUp, CheckCircle, XCircle, Award, Filter } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const AdminDashboard = ({ books, students, loans }) => {
  const [courseFilter, setCourseFilter] = useState('all');

  const totalBooks = books.reduce((acc, book) => acc + book.total_count, 0);
  const availableBooks = books.reduce((acc, book) => acc + book.available_count, 0);
  const loanedBooks = totalBooks - availableBooks;

  const courses = ["1°A", "1°B", "1°C", "2°A", "2°B", "2°C"];

  const pieData = [
    { name: 'Disponibles', value: availableBooks, color: '#4ade80' },
    { name: 'Prestados', value: loanedBooks, color: '#f87171' }
  ];

  const categoryData = books.reduce((acc, book) => {
    const existing = acc.find(item => item.name === book.category);
    if (existing) {
      existing.total += book.total_count;
      existing.available += book.available_count;
    } else {
      acc.push({ name: book.category, total: book.total_count, available: book.available_count });
    }
    return acc;
  }, []);

  // Calculate ranking
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
        id: parseInt(bookId),
        count,
        title: books.find(b => b.id === parseInt(bookId))?.title || 'Desconocido'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const rankingData = getMostBorrowed();

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl">Panel de Control</h1>
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
        <StatCard icon={<Book size={20} color="#6366f1" />} label="Total" value={totalBooks} color="var(--primary)" />
        <StatCard icon={<Users size={20} color="#ec4899" />} label="Usuarios" value={students.length} color="var(--secondary)" />
        <StatCard icon={<ClipboardList size={20} color="#8b5cf6" />} label="Activos" value={loans.filter(l => l.status === 'active').length} color="var(--accent)" />
        <StatCard icon={<TrendingUp size={20} color="#4ade80" />} label="Disponibilidad" value={`${totalBooks > 0 ? Math.round((availableBooks/totalBooks)*100) : 0}%`} color="#4ade80" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Inventory Status - Compact */}
        <div className="glass-card p-4 lg:col-span-4" style={{ height: '350px' }}>
          <h3 className="text-sm mb-4" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado Inventario</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="45%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '0.75rem' }}
                itemStyle={{ color: 'white' }}
              />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Categories Bar Chart - More Space */}
        <div className="glass-card p-4 lg:col-span-8" style={{ height: '350px' }}>
          <h3 className="text-sm mb-4" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Libros por Categoría</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '0.75rem' }}
                itemStyle={{ color: 'white' }}
              />
              <Bar dataKey="total" name="Total" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="available" name="Disponibles" fill="#4ade80" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-4 mb-4">
          <Award size={20} className="text-secondary" color="var(--secondary)" />
          <h3 className="text-sm" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ranking de Más Prestados {courseFilter !== 'all' ? `en ${courseFilter}` : 'General'}</h3>
        </div>
        
        {rankingData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {rankingData.map((item, index) => (
                <div key={item.id} className="flex items-center gap-4" style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem', borderRadius: '0.75rem' }}>
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    background: index === 0 ? 'gold' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'rgba(255,255,255,0.1)',
                    color: index < 3 ? 'black' : 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '0.75rem'
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{item.title}</div>
                    <div className="text-xs text-muted">{item.count} préstamos</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={rankingData} margin={{ left: 10, right: 30 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="title" hide />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '0.75rem' }}
                  />
                  <Bar dataKey="count" fill="var(--secondary)" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Sin datos de préstamos.
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="glass-card p-3" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <div style={{ background: `${color}15`, padding: '0.75rem', borderRadius: '0.75rem', display: 'flex' }}>
      {icon}
    </div>
    <div style={{ overflow: 'hidden' }}>
      <p className="text-xs text-muted" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</p>
      <h2 style={{ fontSize: '1.25rem', fontWeight: '700', lineHeight: '1.2' }}>{value}</h2>
    </div>
  </div>
);

export default AdminDashboard;
