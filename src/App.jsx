import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { initialBooks, initialStudents, initialLoans, initialCategories, initialAdmins } from './data';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import AdminInventory from './pages/AdminInventory';
import AdminLoans from './pages/AdminLoans';
import AdminStudents from './pages/AdminStudents';
import AdminCategories from './pages/AdminCategories';
import AdminAdmins from './pages/AdminAdmins';
import LoginPage from './pages/LoginPage';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('library_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [books, setBooks] = useState(() => {
    const saved = localStorage.getItem('library_books');
    return saved ? JSON.parse(saved) : initialBooks;
  });

  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('library_students');
    return saved ? JSON.parse(saved) : initialStudents;
  });

  const [loans, setLoans] = useState(() => {
    const saved = localStorage.getItem('library_loans');
    return saved ? JSON.parse(saved) : initialLoans;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('library_categories');
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [admins, setAdmins] = useState(() => {
    const saved = localStorage.getItem('library_admins');
    let adminList = saved ? JSON.parse(saved) : initialAdmins;
    
    // Fix: Ensure ipavelek always has the correct password if it was saved with '123'
    return adminList.map(a => 
      a.username === 'ipavelek' && a.password === '123' 
      ? { ...a, password: '1234' } 
      : a
    );
  });

  useEffect(() => {
    localStorage.setItem('library_books', JSON.stringify(books));
    localStorage.setItem('library_students', JSON.stringify(students));
    localStorage.setItem('library_loans', JSON.stringify(loans));
    localStorage.setItem('library_categories', JSON.stringify(categories));
    localStorage.setItem('library_admins', JSON.stringify(admins));
    localStorage.setItem('library_current_user', JSON.stringify(currentUser));
  }, [books, students, loans, categories, admins, currentUser]);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const ProtectedRoute = ({ children }) => {
    if (!currentUser) return <Navigate to="/login" />;
    return children;
  };

  return (
    <Router>
      <div className="min-h-screen">
        <Navbar currentUser={currentUser} onLogout={handleLogout} />
        <main className="container mx-auto p-4 pt-24">
          <Routes>
            <Route path="/" element={<Home books={books} categories={categories} />} />
            <Route path="/login" element={<LoginPage admins={admins} setCurrentUser={setCurrentUser} />} />
            
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard books={books} students={students} loans={loans} /></ProtectedRoute>} />
            <Route path="/admin/inventory" element={<ProtectedRoute><AdminInventory books={books} setBooks={setBooks} categories={categories} /></ProtectedRoute>} />
            <Route path="/admin/loans" element={<ProtectedRoute><AdminLoans loans={loans} setLoans={setLoans} books={books} setBooks={setBooks} students={students} /></ProtectedRoute>} />
            <Route path="/admin/students" element={<ProtectedRoute><AdminStudents students={students} setStudents={setStudents} /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute><AdminCategories categories={categories} setCategories={setCategories} /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><AdminAdmins admins={admins} setAdmins={setAdmins} /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
