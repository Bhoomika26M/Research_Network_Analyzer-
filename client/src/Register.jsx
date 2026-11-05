import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from './api';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Researcher',
    institution: ''
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const roles = ['Researcher', 'Institution Admin', 'System Admin', 'Reviewer'];
  
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/.test(password);

  const isFormValid = () => {
    return (
      formData.fullName.trim() !== '' &&
      validateEmail(formData.email) &&
      validatePassword(formData.password) &&
      formData.password === formData.confirmPassword &&
      agreeTerms
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;
    
    setLoading(true);
    setError('');
    
    const roleMap = {
      'Researcher': 'researcher',
      'Institution Admin': 'institution_admin',
      'System Admin': 'system_admin',
      'Reviewer': 'reviewer'
    };

    try {
      await api.post('/auth/register', {
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: roleMap[formData.role],
        institution: formData.institution || null
      });
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
  console.log("REGISTER ERROR:", err);
  console.log("RESPONSE:", err.response);
  const detail = err.response?.data?.detail;
  setError(
    typeof detail === "string"
      ? detail
      : Array.isArray(detail)
      ? detail.map(d => `${d.loc?.join(".")}: ${d.msg}`).join(" | ")
      : err.response?.data?.message || err.message || "Registration failed. Please try again."
    );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 bg-dotted-pattern py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center w-full max-w-2xl">
        
        <div className="w-12 h-12 bg-yellow-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-yellow-600/20">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><line x1="5.52" y1="16" x2="18.48" y2="16"/></svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-8">SciCollab</h1>
        
        <div className="bg-white rounded-2xl p-8 w-full shadow-xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Create your account</h2>
          <p className="text-slate-500 mb-8">Join the research collaboration network</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Dr. Jane Smith"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@university.edu"
                  className={`w-full px-4 py-2.5 rounded-lg border ${formData.email && !validateEmail(formData.email) ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'} focus:outline-none focus:ring-2 focus:border-transparent text-slate-900`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    className={`w-full px-4 py-2.5 rounded-lg border ${formData.password && !validatePassword(formData.password) ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'} focus:outline-none focus:ring-2 focus:border-transparent pr-10 text-slate-900`}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formData.password && !validatePassword(formData.password) && (
                   <p className="text-xs text-red-500 mt-1">Min 8 chars, 1 letter, 1 number</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  className={`w-full px-4 py-2.5 rounded-lg border ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'} focus:outline-none focus:ring-2 focus:border-transparent text-slate-900`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 bg-white"
                >
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Institution</label>
                <input
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  placeholder="Search institution..."
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="terms" className="text-sm text-slate-600">
                I agree to the <span className="font-bold text-slate-900">Terms of Service</span> and <span className="font-bold text-slate-900">Privacy Policy</span>
              </label>
            </div>

            {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
            {success && <div className="text-green-600 text-sm font-medium">{success}</div>}

            <button
              type="submit"
              disabled={!isFormValid() || loading}
              className={`w-full font-semibold py-3 rounded-lg transition-colors flex justify-center items-center ${
                isFormValid() && !loading
                  ? 'bg-slate-500 hover:bg-slate-600 text-white' 
                  : 'bg-slate-400 text-white opacity-70 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Create Account'
              )}
            </button>

            <div className="text-center text-sm text-slate-500 mt-6">
              Already have an account? <Link to="/login" className="font-bold text-slate-900 hover:underline">Sign in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
