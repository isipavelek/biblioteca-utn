import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { initialBooks, initialStudents, initialLoans, initialCategories, initialAdmins } from './data';
import { db, auth } from './firebase';
import { collection, getDocs, setDoc, doc, writeBatch } from 'firebase/firestore';
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
      console.log("Fetching data from Firebase... Auth status:", currentUser ? "Authenticated" : "Guest");
      try {
        const collections = ['books', 'students', 'loans', 'categories', 'admins', 'resource_types'];
        const results = {};

        for (const colName of collections) {
          try {
            const querySnapshot = await getDocs(collection(db, colName));
            const data = querySnapshot.docs.map(doc => {
              const docData = doc.data();
              return { 
                ...docData, 
                id: docData.id || doc.id 
              };
            });
            results[colName] = data;
          } catch (colErr) {
            console.warn(`Could not fetch ${colName}:`, colErr.message);
            results[colName] = [];
          }
        }

        // Migration Logic
        const checkAndMigrate = async (key, fireData, initialData) => {
          if (!fireData || fireData.length === 0) {
            const localSaved = localStorage.getItem(`library_${key}`);
            let dataToMigrate = localSaved ? JSON.parse(localSaved) : initialData;
            
            if (dataToMigrate && dataToMigrate.length > 0) {
              console.log(`Migrating ${key} to Firebase...`);
              const batch = writeBatch(db);
              dataToMigrate.forEach((item, idx) => {
                const id = typeof item === 'string' ? item : String(item.id || idx);
                const itemRef = doc(db, key, id);
                const dataObject = typeof item === 'object' ? item : { name: item, id: id, code: String(idx + 1).padStart(3, '0') };
                batch.set(itemRef, dataObject);
              });
              await batch.commit();
              return dataToMigrate;
            }
          }
          return fireData;
        };

        const finalBooks = await checkAndMigrate('books', results.books, initialBooks);
        const finalStudents = await checkAndMigrate('students', results.students, initialStudents);
        const finalLoans = await checkAndMigrate('loans', results.loans, initialLoans);
        
        // Resource Types Migration
        const initialResourceTypes = [
          { id: 'book', name: 'Libro / Manual', code: '001' },
          { id: 'equipment', name: 'Equipamiento / Tecnología', code: '002' }
        ];
        const finalResourceTypes = await checkAndMigrate('resource_types', results.resource_types, initialResourceTypes);

        const finalCategories = await checkAndMigrate('categories', results.categories, initialCategories);
        const finalAdmins = await checkAndMigrate('admins', results.admins, initialAdmins);

        setBooks(finalBooks);
        setStudents(finalStudents);
        setLoans(finalLoans);
        // Keep categories as objects to preserve 'code'
        // Keep categories as objects with unique sequential codes if missing
        const mappedCategories = (finalCategories || []).map((c, idx) => {
          if (!c) return { id: `cat_${idx}`, name: 'Sin Categoría', code: String(idx + 1).padStart(3, '0') };
          const item = typeof c === 'string' ? { id: c, name: c } : c;
          
          if (!item || !item.name) return { id: `cat_${idx}`, name: 'Sin Categoría', code: String(idx + 1).padStart(3, '0') };
          
          // Safer check for the "all 001" issue
          const isLegacy = (finalCategories || []).every(cat => !cat || typeof cat === 'string' || !cat.code || cat.code === '001');
          const needsNewCode = !item.code || (item.code === '001' && isLegacy);
          
          return {
            ...item,
            code: needsNewCode ? String(idx + 1).padStart(3, '0') : item.code
          };
        });
        setCategories(mappedCategories);
        setResourceTypes(finalResourceTypes);
        setAdmins(finalAdmins);
      } catch (error) {
        console.error("Critical error fetching from Firebase:", error);
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
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: 'white',
      padding: '2rem',
      background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
      fontFamily: "'Outfit', sans-serif"
    }}>
      <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '2.5rem' }}>
        {/* Outer Ring */}
        <div className="animate-spin" style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '3px solid transparent',
          borderTopColor: 'var(--primary)',
          borderBottomColor: 'var(--secondary)',
          opacity: 0.8
        }}></div>
        
        {/* Inner Ring (Reverse rotation) */}
        <div style={{
          position: 'absolute',
          inset: '12px',
          borderRadius: '50%',
          border: '2px solid transparent',
          borderLeftColor: 'var(--accent)',
          borderRightColor: 'var(--primary)',
          animation: 'spin 1.5s linear infinite reverse',
          opacity: 0.6
        }}></div>

        {/* Center Pulsing Glow */}
        <div className="animate-pulse" style={{
          position: 'absolute',
          inset: '30px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          filter: 'blur(8px)',
          opacity: 0.3
        }}></div>

        {/* Icon/Logo Placeholder */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            background: 'white', 
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 30px rgba(99, 102, 241, 0.4)'
          }}>
            <div style={{ width: '24px', height: '18px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
               <div style={{ height: '4px', background: 'var(--primary)', borderRadius: '2px' }} />
               <div style={{ height: '4px', background: 'var(--secondary)', borderRadius: '2px', width: '70%' }} />
               <div style={{ height: '4px', background: 'var(--accent)', borderRadius: '2px' }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center' }} className="animate-fade-in">
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: '800', 
          marginBottom: '0.5rem',
          background: 'linear-gradient(to bottom, #fff 30%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.06em'
        }}>
          BiblioUTN
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
          <div className="animate-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />
          <p style={{ 
            fontSize: '0.9rem', 
            color: 'var(--text-muted)', 
            fontWeight: '600',
            letterSpacing: '0.1em',
            textTransform: 'uppercase'
          }}>
            Sincronizando con la nube...
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <Router basename="/biblioteca-utn">
      <div style={{ minHeight: '100vh' }}>
        <Navbar currentUser={currentUser} onLogout={handleLogout} />
        {currentUser && (
          <QuickLoanModal
            books={books}
            students={students}
            loans={loans}
            onLoanCreated={async (newLoan, loanedBook) => {
              const updatedBook = { ...loanedBook, available_count: (loanedBook.available_count || 1) - 1 };
              const newLoans = [...loans, newLoan];
              const newBooks = books.map(b => b.id === loanedBook.id ? updatedBook : b);
              setLoans(newLoans);
              setBooks(newBooks);
              await import('firebase/firestore').then(({ setDoc, doc }) => {
                setDoc(doc(db, 'loans', String(newLoan.id)), newLoan);
                setDoc(doc(db, 'books', String(updatedBook.id)), updatedBook);
              });
            }}
          />
        )}
        <main style={{ paddingTop: '64px', paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingBottom: '2rem' }}>
          <Routes>
            <Route path="/" element={<Home books={books} categories={categories} />} />
            <Route path="/info" element={<Info />} />
            <Route path="/login" element={<LoginPage admins={admins} setCurrentUser={setCurrentUser} />} />
            
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard books={books} students={students} loans={loans} /></ProtectedRoute>} />
            
            <Route path="/admin/inventory" element={
              <ProtectedRoute>
                <AdminInventory 
                  books={books} 
                  setBooks={(newBooks) => {
                    setBooks(newBooks);
                    newBooks.forEach(b => syncItem('books', b));
                  }} 
                  deleteItem={(id) => deleteItem('books', id)}
                  categories={categories} 
                  resourceTypes={resourceTypes}
                />
              </ProtectedRoute>
            } />

            <Route path="/admin/loans" element={
              <ProtectedRoute>
                <AdminLoans 
                  loans={loans} 
                  setLoans={(newLoans) => {
                    setLoans(newLoans);
                    newLoans.forEach(l => syncItem('loans', l));
                  }} 
                  deleteLoan={(id) => deleteItem('loans', id)}
                  books={books} 
                  setBooks={(newBooks) => {
                    setBooks(newBooks);
                    newBooks.forEach(b => syncItem('books', b));
                  }} 
                  students={students} 
                />
              </ProtectedRoute>
            } />

            <Route path="/admin/students" element={
              <ProtectedRoute>
                <AdminStudents 
                  students={students} 
                  setStudents={(newStudents) => {
                    setStudents(newStudents);
                    newStudents.forEach(s => syncItem('students', s));
                  }} 
                  deleteStudent={(id) => deleteItem('students', id)}
                  loans={loans}
                  books={books}
                />
              </ProtectedRoute>
            } />

            <Route path="/admin/categories" element={
              <ProtectedRoute>
                <AdminCategories 
                  categories={categories} 
                  setCategories={(newCats) => {
                    setCategories(newCats);
                    newCats.forEach(c => syncItem('categories', c));
                  }} 
                  resourceTypes={resourceTypes}
                  setResourceTypes={(newTypes) => {
                    setResourceTypes(newTypes);
                    newTypes.forEach(t => syncItem('resource_types', t));
                  }}
                />
              </ProtectedRoute>
            } />

            <Route path="/admin/users" element={
              <ProtectedRoute>
                <AdminAdmins 
                  admins={admins} 
                  setAdmins={(newAdmins) => {
                    setAdmins(newAdmins);
                    newAdmins.forEach(a => syncItem('admins', a));
                  }} 
                />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
