import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sun, Moon, LogOut, User as UserIcon,
  ChevronDown, Sliders, Sparkles
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { UserRole } from '../../types';

export const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, switchRole } = useAuthStore();
  const { darkMode, toggleDarkMode } = useThemeStore();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  // Click outside handlers
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) setRoleMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const ROLES: UserRole[] = ['Researcher', 'Institution Admin', 'Reviewer', 'System Admin'];

  return (
    <header className="h-16 px-6 bg-card border-b border-border flex items-center justify-between z-20">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">Nexora Collaboration Platform</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* DEMO ROLE SWITCHER PILL */}
        <div className="relative" ref={roleMenuRef}>
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Role: <strong className="ml-0.5">{user?.role}</strong></span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-muted-foreground border-b border-border">
                Demo Role Switcher
              </div>
              {ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    switchRole(role);
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-muted transition-colors flex items-center justify-between ${
                    user?.role === role ? 'text-primary font-bold bg-primary/5' : 'text-foreground'
                  }`}
                >
                  <span>{role}</span>
                  {user?.role === role && <Sparkles className="w-3.5 h-3.5 text-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
          title="Toggle Light/Dark Theme"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>



        {/* User Profile Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-muted transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center">
              {user?.initials || 'U'}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in">
              <div className="px-4 py-2.5 border-b border-border">
                <p className="text-xs font-bold text-foreground">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </div>

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate('/settings');
                }}
                className="w-full text-left px-4 py-2 text-xs text-foreground hover:bg-muted flex items-center gap-2"
              >
                <UserIcon className="w-4 h-4 text-muted-foreground" />
                Profile & Settings
              </button>

              <div className="border-t border-border" />

              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-muted flex items-center gap-2 font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
