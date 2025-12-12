import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, Link, useLocation } from "react-router-dom";

import Login from "./pages/Login"; 
import AdminPanel from "./pages/AdminPanel";
import PlayerSearchPage from "./pages/PlayerSearchPage";
import Home from "./Home";
import Odds from "./Odds";
import DraftSimulator from "./pages/DraftSimulator";

export default function App() {
  const [user, setUser] = useState(null); 
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = (userData) => {
    setUser(userData);
    if (userData.role === 'admin') navigate('/admin');
    else navigate('/draft');
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/'); // Goes back to home page
  };

  // Hide the app navbar on home and login pages (they have their own navbars)
  const hideNavbar = location.pathname === '/' || location.pathname === '/login';

  return (
    <div className="min-h-screen bg-[#0B0D12] text-white font-sans">
      {/* Only show app navbar when NOT on home or login pages */}
      {!hideNavbar && <Navbar user={user} onLogout={handleLogout} />}

      <Routes>
        {/* Home is the landing page */}
        <Route path="/" element={<Home />} />
        
        {/* Login page */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        
        {/* Public Routes */}
        <Route path="/odds" element={<Odds />} />

        {/* Protected Routes */}
        <Route path="/draft" element={
          <ProtectedRoute user={user}><DraftSimulator /></ProtectedRoute>
        } />
        
        <Route path="/player-search" element={
          <ProtectedRoute user={user}><PlayerSearchPage /></ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute user={user} allowedRole="admin"><AdminPanel /></ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

const ProtectedRoute = ({ user, allowedRole, children }) => {
  if (!user) return <Navigate to="/login" />; // Redirect to /login instead of /
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/draft" />;
  return children;
};

const Navbar = ({ user, onLogout }) => {
  if (!user) return null;

  return (
    <nav className="bg-[#111318] border-b border-gray-800 p-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-xl font-black tracking-tighter hover:opacity-80 transition-opacity">
          DRAFT<span className="text-blue-600">ZONE</span>
        </Link>
        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
          user.role === 'admin' ? 'bg-red-600' : 'bg-blue-600'
        }`}>
          {user.role}
        </span>
      </div>

      <div className="flex items-center gap-6 text-sm font-bold">
        {user.role === 'admin' && (
          <Link to="/admin" className="text-red-400 hover:text-red-300">ADMIN PANEL</Link>
        )}
        <Link to="/draft" className="text-gray-400 hover:text-white">DRAFT</Link>
        <Link to="/player-search" className="text-gray-400 hover:text-white">SEARCH</Link>
        <Link to="/" className="text-gray-400 hover:text-white">HOME</Link>
        <Link to="/odds" className="text-gray-400 hover:text-white">ODDS</Link>
        <div className="h-4 w-px bg-gray-700 mx-2"></div>
        <button onClick={onLogout} className="text-gray-500 hover:text-white">LOGOUT</button>
      </div>
    </nav>
  );
};