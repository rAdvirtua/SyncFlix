import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import './index.css';
import { cleanupChannelMessages } from './utils/channelUtils';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Channel from './pages/Channel';

// Components
import AuthLayout from './components/layouts/AuthLayout';
import AppLayout from './components/layouts/AppLayout';
import JoinRedirect from './components/JoinRedirect';

export function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Regular auth check with Firebase
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      // Clean up old messages when user logs in
      if (currentUser) {
        cleanupChannelMessages().catch(console.error);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
        </Route>

        {/* App Routes */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/channel/:channelId" element={user ? <Channel /> : <Navigate to="/login" />} />
        </Route>

        {/* Home and About routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />

        {/* Join Redirect */}
        <Route path="/join" element={<JoinRedirect />} />
        
        {/* Redirect */}
        <Route path="/home" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
