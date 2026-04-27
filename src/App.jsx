import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { initialCategories, initialAdmins } from './data';
import { db, auth } from './firebase';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import AdminInventory from './pages/AdminInventory';
import AdminLoans from './pages/AdminLoans';
import AdminStudents from './pages/AdminStudents';
import AdminCategories from './pages/AdminCategories';
import AdminAdmins from './pages/AdminAdmins';
import LoginPage from './pages/LoginPage';
import Info from './pages/Info';
import Navbar from './components/Navbar';
import QuickLoanModal from './components/QuickLoanModal';

function App() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loans, setLoans] = useState([]);
  const [categories, setCategories] = useState([]);
  const [resourceTypes, setResourceTypes] = useState([]);
  const [admins, setAdmins] = useState([]);

  // Auth Observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Fetch all data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const collections = ['books', 'students', 'loans', 'categories', 'admins', 'resource_types'];
        const results = {};

        for (const colName of collections) {
          try {
            const querySnapshot = await getDocs(collection(db, colName));
            results[colName] = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
          } catch (colErr) {
            results[colName] = [];
          }
        }

        // Direct assignments - No more automatic migration from local files
        const finalBooks = results.books || [];
        const finalStudents = results.students || [];
        const finalLoans = results.loans || [];
        
        const finalResourceTypes = results.resource_types.length > 0 ? results.resource_types : [
          { id: 'book', name: 'Libro / Manual', code: '001' },
          { id: 'equipment', name: 'Equipamiento / Tecnología', code: '002' }
        ];

        const finalCategories = results.categories.length > 0 ? results.categories : initialCategories;
        const finalAdmins = results.admins || [];

        setBooks(finalBooks);
        setStudents(finalStudents);
        setLoans(finalLoans);
        setResourceTypes(finalResourceTypes);
        setAdmins(finalAdmins);

        // Normalize categories to have codes
        const mappedCategories = finalCategories.map((c, idx) => {
          const item = (c && typeof c === 'object') ? c : { id: `cat_${idx}`, name: String(c || 'Sin Categoría'), code: '001' };
          const isLegacy = finalCategories.every(cat => !cat || typeof cat === 'string' || !cat.code || cat.code === '001');
          const needsNewCode = !item.code || (item.code === '001' && isLegacy);
          return {
            ...item,
            code: needsNewCode ? String(idx + 1).padStart(3, '0') : item.code
          };
        });
        setCategories(mappedCategories);

      } catch (error) {
        console.error("Critical error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]); 

  const handleLogout = async () => {
    await signOut(auth);
  };

  const ProtectedRoute = ({ children }) => {
    if (loading) return null; 
    if (!currentUser) return <Navigate to="/login" />;
    return children;
  };

  const syncItem = async (col, item) => {
    if (!item?.id) return;
    await setDoc(doc(db, col, String(item.id)), item);
  };

  const deleteItem = async (col, id) => {
    try {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, col, String(id)));
    } catch (e) { console.error(e); }
  };

  if (loading) return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
      minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', padding: '2rem',
      background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)', fontFamily: "'Outfit', sans-serif"
    }}>
      <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '2.5rem' }}>
        <div className="animate-spin" style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid transparent', borderTopColor: '#6366f1', borderBottomColor: '#a855f7', opacity: 0.8 }}></div>
        <div style={{ position: 'absolute', inset: '12px', borderRadius: '50%', border: '2px solid transparent', borderLeftColor: '#f43f5e', borderRightColor: '#6366f1', animation: 'spin 1.5s linear infinite reverse', opacity: 0.6 }}></div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>BiblioUTN</h1>
        <p style={{ color: '#94a3b8', letterSpacing: '0.1em' }}>CARGANDO...</p>
      </div>
    </div>
  );

  return (
    <Router>
      <div style={{ minHeight: '100vh' }}>
        <Navbar currentUser={currentUser} onLogout={handleLogout} />
        {currentUser && (
          <QuickLoanModal
            books={books}
            students={students}
            loans={loans}
            onLoanCreated={async (newLoan, loanedBook) => {
              const updatedBook = { ...loanedBook, available_count: (loanedBook.available_count || 1) - 1 };
              setLoans([...loans, newLoan]);
              setBooks(books.map(b => b.id === loanedBook.id ? updatedBook : b));
              await setDoc(doc(db, 'loans', String(newLoan.id)), newLoan);
              await setDoc(doc(db, 'books', String(updatedBook.id)), updatedBook);
            }}
          />
        )}
        <main style={{ paddingTop: '64px', paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingBottom: '2rem' }}>
          <Routes>
            <Route path="/" element={<Info />} />
            <Route path="/search" element={<Home books={books} categories={categories} />} />
            <Route path="/info" element={<Navigate to="/" />} />
            <Route path="/login" element={<LoginPage setCurrentUser={setCurrentUser} />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard books={books} students={students} loans={loans} /></ProtectedRoute>} />
            <Route path="/admin/inventory" element={<ProtectedRoute><AdminInventory books={books} setBooks={(nb)=>{setBooks(nb); nb.forEach(b=>syncItem('books',b));}} deleteItem={(id)=>deleteItem('books',id)} categories={categories} resourceTypes={resourceTypes} /></ProtectedRoute>} />
            <Route path="/admin/loans" element={<ProtectedRoute><AdminLoans loans={loans} setLoans={(nl)=>{setLoans(nl); nl.forEach(l=>syncItem('loans',l));}} deleteLoan={(id)=>deleteItem('loans',id)} books={books} setBooks={(nb)=>{setBooks(nb); nb.forEach(b=>syncItem('books',b));}} students={students} /></ProtectedRoute>} />
            <Route path="/admin/students" element={<ProtectedRoute><AdminStudents students={students} setStudents={(ns)=>{setStudents(ns); ns.forEach(s=>syncItem('students',s));}} deleteStudent={(id)=>deleteItem('students',id)} loans={loans} books={books} /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute><AdminCategories categories={categories} setCategories={(nc)=>{setCategories(nc); nc.forEach(c=>syncItem('categories',c));}} resourceTypes={resourceTypes} setResourceTypes={(nt)=>{setResourceTypes(nt); nt.forEach(t=>syncItem('resource_types',t));}} /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><AdminAdmins admins={admins} setAdmins={(na)=>{setAdmins(na); na.forEach(a=>syncItem('admins',a));}} deleteAdmin={(id)=>deleteItem('admins',id)} /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
