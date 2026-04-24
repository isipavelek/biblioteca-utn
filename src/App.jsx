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
            const dataToMigrate = localSaved ? JSON.parse(localSaved) : initialData;
            
            if (dataToMigrate && dataToMigrate.length > 0) {
              console.log(`Migrating ${key} to Firebase...`);
              const batch = writeBatch(db);
              dataToMigrate.forEach(item => {
                const itemRef = doc(db, key, String(item.id || Date.now() + Math.random()));
                batch.set(itemRef, item);
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
        const finalCategories = await checkAndMigrate('categories', (results.categories || []).map(c => c.name || c), initialCategories);
        const finalAdmins = await checkAndMigrate('admins', results.admins, initialAdmins);

        setBooks(finalBooks);
        setStudents(finalStudents);
        setLoans(finalLoans);
        setCategories(finalCategories);
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
    if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
    if (!currentUser) return <Navigate to="/login" />;
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

  if (loading) return <div className="flex items-center justify-center min-h-screen text-white bg-dark">Cargando base de datos...</div>;

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
                    newCats.forEach((c, idx) => setDoc(doc(db, 'categories', String(idx)), { name: c }));
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
