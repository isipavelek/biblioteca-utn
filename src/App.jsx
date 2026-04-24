import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import Navbar from './components/Navbar';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loans, setLoans] = useState([]);
  const [categories, setCategories] = useState([]);
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
        const collections = ['books', 'students', 'loans', 'categories', 'admins'];
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
                // Use a stable ID for categories if they are strings, or use their provided ID
                const id = typeof item === 'string' ? item : String(item.id || idx);
                const itemRef = doc(db, key, id);
                
                // Firestore REQUIRES objects. If item is a string (common in categories), wrap it.
                const dataObject = typeof item === 'object' ? item : { name: item, id: id };
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
        const finalCategories = await checkAndMigrate('categories', results.categories, initialCategories);
        const finalAdmins = await checkAndMigrate('admins', results.admins, initialAdmins);

        setBooks(finalBooks);
        setStudents(finalStudents);
        setLoans(finalLoans);
        // Normalize categories back to an array of strings for the UI if needed
        setCategories(finalCategories.map(c => typeof c === 'object' ? (c.name || c.id) : c));
        setAdmins(finalAdmins);
      } catch (error) {
        console.error("Critical error fetching from Firebase:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]); // Re-fetch when user logs in/out

  // Sync state to Firebase on changes
  // Note: For production, it's better to write to Firestore in the handlers (AdminInventory, etc.)
  const handleLogout = async () => {
    await signOut(auth);
  };

  const ProtectedRoute = ({ children }) => {
    if (loading) return null; // Loading is handled at the app level
    if (!currentUser) return <Navigate to="/" />;
    return children;
  };

  // We wrap the setters to include Firestore persistence
  const wrapSetState = (collectionName, setter) => (newDataOrFunc) => {
    setter(prev => {
      const next = typeof newDataOrFunc === 'function' ? newDataOrFunc(prev) : newDataOrFunc;
      
      // Persistence logic
      const persist = async () => {
        try {
          // If it's a deletion, we need to handle it differently, but for now:
          // We sync the entire collection state (simple but not optimal for thousands of records)
          // For now, let's just do individual doc updates where possible or batch
          
          // Strategy: Find the difference? No, let's just update Firestore
          // Since the user is using small-ish datasets, we can do this.
          // Better: Only sync the specific item changed.
        } catch (e) { console.error(e); }
      };

      // Since we want to stay compatible with existing code, we'll implement 
      // a more targeted sync in the next step.
      return next;
    });
  };

  // We'll update the components to use these new persistent setters
  // But wait, the simplest way is to use the global useEffect but with individual document writes.
  
  // Let's implement a more efficient sync in the Admin components or here
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
      padding: '1rem',
      background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)'
    }}>
      <div style={{ position: 'relative', marginBottom: '2rem' }}>
        <div className="animate-spin" style={{
          width: '4rem',
          height: '4rem',
          borderRadius: '9999px',
          borderTop: '2px solid var(--primary)',
          borderBottom: '2px solid var(--primary)',
          borderLeft: '2px solid transparent',
          borderRight: '2px solid transparent'
        }}></div>
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="animate-pulse" style={{
            height: '2.5rem',
            width: '2.5rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(var(--primary-rgb), 0.1)'
          }}></div>
        </div>
      </div>
      <div style={{ textAlign: 'center' }} className="animate-fade-in">
        <h2 style={{ 
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: '0.5rem',
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          BiblioUTN
        </h2>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          justifyContent: 'center'
        }}>
          <span className="animate-pulse" style={{
            display: 'inline-block',
            width: '0.5rem',
            height: '0.5rem',
            borderRadius: '9999px',
            backgroundColor: 'var(--primary)'
          }}></span>
          Sincronizando con la nube...
        </p>
      </div>
    </div>
  );

  return (
    <Router>
      <div className="min-h-screen">
        <Navbar currentUser={currentUser} onLogout={handleLogout} />
        <main className="container mx-auto p-4 pt-24">
          <Routes>
            <Route path="/" element={<Home books={books} categories={categories} />} />
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
                />
              </ProtectedRoute>
            } />

            <Route path="/admin/categories" element={
              <ProtectedRoute>
                <AdminCategories 
                  categories={categories} 
                  setCategories={(newCats) => {
                    setCategories(newCats);
                    // Categories are a simple array in data.js, in Firestore we wrap them
                    newCats.forEach((c) => setDoc(doc(db, 'categories', String(c)), { name: c }));
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
