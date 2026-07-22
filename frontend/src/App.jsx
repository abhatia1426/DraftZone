import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Login from "./pages/Login"; 
import AdminPanel from "./pages/AdminPanel";
import PlayerSearchPage from "./pages/PlayerSearchPage";
import Home from "./Home";
import Odds from "./Odds";
import DraftSimulator from "./pages/DraftSimulator";
import Authors from "./Authors";
import MyBets from "./pages/MyBets";
import NotificationProvider from "./components/NotificationProvider";

const STORAGE_KEY = 'dz_user';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const navigate = useNavigate();

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    if (userData.role === 'admin') navigate('/admin');
    else navigate('/draft');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    navigate('/'); // Goes back to home page
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-white font-sans">
      <NotificationProvider>
      <Routes>
        {/* Home is the landing page */}
        <Route path="/" element={<Home user={user} onLogout={handleLogout} />} />

        {/* Login page */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />

        {/* Authors page - Public route */}
        <Route path="/authors" element={<Authors />} />

        {/* Public Routes */}
        <Route path="/odds" element={<Odds user={user} onLogout={handleLogout} />} />

        {/* Protected Routes */}
        <Route path="/draft" element={
          <ProtectedRoute user={user}><DraftSimulator user={user} onLogout={handleLogout} /></ProtectedRoute>
        } />

        <Route path="/player-search" element={<PlayerSearchPage user={user} onLogout={handleLogout} />} />

        <Route path="/admin" element={
          <ProtectedRoute user={user} allowedRole="admin"><AdminPanel onLogout={handleLogout} /></ProtectedRoute>
        } />

        <Route path="/my-bets" element={
          <ProtectedRoute user={user}><MyBets user={user} onLogout={handleLogout} /></ProtectedRoute>
        } />
      </Routes>
      </NotificationProvider>
    </div>
  );
}

const ProtectedRoute = ({ user, allowedRole, children }) => {
  if (!user) return <Navigate to="/login" />; // Redirect to /login instead of /
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/draft" />;
  return children;
};