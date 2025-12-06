import react, { useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
        <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center text-white font-sans">
          <div className="bg-[#111318] p-8 rounded-2xl border border-gray-800 shadow-2xl w-96">
            <h1 className="text-3xl font-black text-center mb-6">
              DRAFT<span className="text-blue-600">ZONE</span>
            </h1>
            
            {error && <div className="bg-red-900/50 text-red-300 p-3 rounded mb-4 text-sm text-center">{error}</div>}
    
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-blue-500 outline-none"
                  placeholder="admin@draftzone.com"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-blue-500 outline-none"
                  placeholder="admin"
                />
              </div>
              <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded transition mt-2">
                {isSignup ? "Create Account" : "Login"}
              </button>
            </form>
    
            <div className="mt-6 text-center text-sm text-gray-500">
              {isSignup ? "Already have an account?" : "Need an account?"} 
              <button onClick={() => setIsSignup(!isSignup)} className="text-blue-400 ml-2 font-bold hover:underline">
                {isSignup ? "Login" : "Sign Up"}
              </button>
            </div>
            
            {!isSignup && (
                <div className="mt-4 p-3 bg-gray-800/50 rounded text-xs text-gray-400">
                    <p><strong>Admin:</strong> admin@draftzone.com / admin</p>
                    <p><strong>User:</strong> user@draftzone.com / user</p>
                </div>
            )}
          </div>
        </div>
      );
}

export default Login;