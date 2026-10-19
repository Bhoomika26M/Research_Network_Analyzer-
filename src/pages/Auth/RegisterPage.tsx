import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, ArrowRight, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: 'Massachusetts Institute of Technology',
    department: 'Computer Science & AI',
    role: 'Researcher',
  });
  const [registered, setRegistered] = useState(false);
  const [pending, setPending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Institution Admins and Reviewers must be approved before they can log in.
    if (formData.role !== 'Researcher') {
      setPending(true);
      return;
    }
    setRegistered(true);
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-8 relative z-10">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-lg mb-3">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">Register Academic Profile</h2>
          <p className="text-xs text-muted-foreground mt-1">Join the Scientific Collaboration Network</p>
        </div>

        {registered || pending ? (
          <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in">
            <CheckCircle2 className={`w-16 h-16 ${pending ? 'text-amber-500' : 'text-emerald-500'} mb-3`} />
            <h3 className="text-lg font-bold text-foreground">
              {pending ? 'Registration Submitted' : 'Registration Successful!'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {pending
                ? 'Your account is pending approval by a system administrator.'
                : 'Redirecting to login portal...'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="Dr. Jane Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Institutional Email</label>
              <input
                type="email"
                required
                placeholder="jane.doe@mit.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Institution</label>
                <select
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none"
                >
                  <option value="Massachusetts Institute of Technology">MIT</option>
                  <option value="Stanford University">Stanford</option>
                  <option value="ETH Zürich">ETH Zürich</option>
                  <option value="University of Oxford">Oxford</option>
                  <option value="Max Planck Institute">Max Planck</option>
                  <option value="CERN">CERN</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none"
                >
                  <option value="Researcher">Researcher</option>
                  <option value="Institution Admin">Institution Admin</option>
                  <option value="Reviewer">Reviewer</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Complete Registration</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>Already registered?</span>
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
