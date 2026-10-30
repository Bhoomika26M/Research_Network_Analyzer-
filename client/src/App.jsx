import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import api from './api';

function ProtectedRoute({ children, user, setUser }) {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    if (!user && localStorage.getItem('token')) {
      fetchUser();
    } else if (!user && !localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [user, navigate, setUser]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 bg-dotted-pattern relative text-white">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 bg-yellow-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-yellow-600/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><line x1="5.52" y1="16" x2="18.48" y2="16"/></svg>
        </div>
        <h1 className="text-3xl font-bold mb-2">SciCollab</h1>
        
        <div className="bg-white text-slate-900 p-8 rounded-2xl w-full max-w-md shadow-xl text-center mt-8">
           <h2 className="text-xl font-bold mb-4">Welcome back, {user.full_name}!</h2>
           <p className="mb-6 text-slate-600">Logged in as {user.role}</p>
           <button 
            onClick={() => {
              localStorage.removeItem('token');
              setUser(null);
              navigate('/login');
            }}
            className="w-full bg-slate-800 text-white font-medium py-2.5 rounded-lg hover:bg-slate-700 transition-colors"
           >
            Log Out
           </button>
        </div>
      </div>
    </div>
  );
}


function App() {
  const [user, setUser] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute user={user} setUser={setUser}>
               <div>Dashboard</div>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
