import React, { useState } from 'react';
import { User, Moon, Save, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

export const SettingsPage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const { darkMode, toggleDarkMode } = useThemeStore();
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || 'Dr. Sarah Chen',
    email: user?.email || 'sarah.chen@mit.edu',
    department: user?.department || 'Computer Science & AI',
    bio: user?.bio || 'Professor of AI focusing on deep learning in bio-molecular structures.',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      setUser({
        ...user,
        name: formData.name,
        email: formData.email,
        department: formData.department,
        bio: formData.bio,
      });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-foreground">User Profile & Account Settings</h2>
        <p className="text-xs text-muted-foreground">Manage personal information, security preferences, and display settings</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Details */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> Profile Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Bio</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none"
            />
          </div>
        </div>

        {/* Display & Preferences */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Moon className="w-4 h-4 text-primary" /> Preferences
          </h3>

          <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
            <div>
              <p className="text-xs font-bold text-foreground">Dark Theme Mode</p>
              <p className="text-[11px] text-muted-foreground">Toggle platform dark mode color scheme</p>
            </div>
            <button
              type="button"
              onClick={toggleDarkMode}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                darkMode ? 'bg-primary justify-end' : 'bg-muted justify-start'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" /> Save Settings
          </button>

          {saved && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Profile updated successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
