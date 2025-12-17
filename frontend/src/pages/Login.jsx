import react, { useState } from "react";
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import DraftLogo from '../assets/FFLogo.jpeg';

const Login = ({ onLogin }) => {
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();


    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isSignup ? './signup' : '/login';


        try {
            const res = await axios.post(`http://127.0.0.1:8080/api/auth${endpoint}`, { email, password });
            if(res.data.success) {
                onLogin(res.data.user);
                if(res.data.user === 'admin') {
                    navigate('/admin');
                }
                else {
                    navigate('/draft');
                }
            }
        } catch(err) {
            setError("Invalid credentials. Try admin@draftZone.com / admin");
        }

    };
    

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1524] to-[#1a1f35] text-white font-sans relative overflow-hidden">
          {/* Floating Orbs (matching homepage) */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-96 h-96 bg-[#1DB954] rounded-full blur-[120px] opacity-20 animate-pulse" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#1DB954] rounded-full blur-[120px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

         {/* NAVBAR */}
          <nav className="bg-transparent relative z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img
                  src={DraftLogo}
                  className="h-12 w-12 rounded-full"
                  alt="Fantasy Football Logo"
                />
                <span className="text-2xl font-bold tracking-wide">
                  <span className="text-white">DRAFT</span>
                  <span className="text-[#1DB954]">ZONE</span>
                </span>
              </div>

              <Link
                to="/"
                className="text-gray-400 hover:text-[#1DB954] transition-colors text-sm font-semibold tracking-wider uppercase"
              >
                BACK TO HOMEPAGE
              </Link>
            </div>
          </nav>

          {/* LOGIN FORM */}
          <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
            <div className="relative bg-[#111318] p-8 rounded-2xl border border-[#1DB954]/30 shadow-2xl w-96 backdrop-blur-sm">
              <h1 className="text-3xl font-black text-center mb-6">
                DRAFT<span className="text-[#1DB954]">ZONE</span>
              </h1>
              
              {error && <div className="bg-red-900/50 text-red-300 p-3 rounded mb-4 text-sm text-center">{error}</div>}
      
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 focus:border-[#1DB954] rounded p-3 text-white outline-none transition-colors"
                    placeholder="admin@draftzone.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 focus:border-[#1DB954] rounded p-3 text-white outline-none transition-colors"
                    placeholder="admin"
                  />
                </div>
                <button className="bg-[#1DB954] hover:bg-[#17a84d] text-black font-bold py-3 rounded-full transition-all duration-300 mt-2 hover:scale-105 shadow-lg shadow-[#1DB954]/30">
                  {isSignup ? "Create Account" : "Login"}
                </button>
              </form>
      
              <div className="mt-6 text-center text-sm text-gray-500">
                {isSignup ? "Already have an account?" : "Need an account?"} 
                <button onClick={() => setIsSignup(!isSignup)} className="text-[#1DB954] ml-2 font-bold hover:underline">
                  {isSignup ? "Login" : "Sign Up"}
                </button>
              </div>
              
              {!isSignup && (
                  <div className="mt-4 p-3 bg-gray-800/50 rounded text-xs text-gray-400 border border-gray-700">
                      <p><strong>Admin:</strong> admin@draftzone.com / admin</p>
                      <p><strong>User:</strong> user@draftzone.com / user</p>
                  </div>
              )}
            </div>
          </div>
        </div>
      );
}

export default Login;