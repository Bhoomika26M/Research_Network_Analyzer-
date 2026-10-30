import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from './api';

export default function Login({ setUser }) {
  const navigate = useNavigate();
  const [role, setRole] = useState('Researcher');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    { id: 'Researcher', title: 'Researcher', desc: 'Individual researcher access', color: 'bg-blue-500' },
    { id: 'Institution Admin', title: 'Institution Admin', desc: 'Manage your institution', color: 'bg-green-400' },
    { id: 'System Admin', title: 'System Admin', desc: 'Full platform control', color: 'bg-red-400' },
    { id: 'Reviewer', title: 'Reviewer', desc: 'Review submissions', color: 'bg-purple-400' }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    
    // Map human readable role to db role
    const roleMap = {
      'Researcher': 'researcher',
      'Institution Admin': 'institution_admin',
      'System Admin': 'system_admin',
      'Reviewer': 'reviewer'
    };
    
    try {
      const res = await api.post('/auth/login', {
        email,
        password,
        role: roleMap[role]
      });
      localStorage.setItem('token', res.data.access_token);
      setUser(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 bg-dotted-pattern py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center w-full max-w-md">
        
        <div className="w-16 h-16 bg-yellow-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-yellow-600/20">
           <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><line x1="5.52" y1="16" x2="18.48" y2="16"/></svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">SciCollab</h1>
        <p className="text-slate-400 mb-8">Scientific Collaboration Network Analyzer</p>
        
        <div className="bg-white rounded-2xl p-8 w-full shadow-xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
          <p className="text-slate-500 mb-6">Sign in to your research account</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Sign in as</label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`flex flex-col items-start p-3 border rounded-xl transition-all ${
                      role === r.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2.5 h-2.5 rounded-full ${r.color}`}></div>
                      <span className={`text-sm font-bold ${role === r.id ? 'text-blue-700' : 'text-slate-700'}`}>{r.title}</span>
                    </div>
                    <span className="text-xs text-slate-500 text-left">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="schen@mit.edu"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 text-slate-900"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="text-right mt-2">
                <a href="#" className="text-sm text-slate-900 font-semibold hover:underline">Forgot password?</a>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm font-medium">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-slate-900 text-white font-semibold py-3 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-70 flex justify-center items-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                `Log In as ${role}`
              )}
            </button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-300">or</span>
              </div>
            </div>

            <div className="text-center text-sm text-slate-500">
              Don't have an account? <Link to="/register" className="font-bold text-slate-900 hover:underline">Register</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
