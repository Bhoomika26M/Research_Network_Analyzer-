import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Network,
  ChevronLeft, ChevronRight, Settings, Activity
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const { user } = useAuthStore();
  const role = user?.role || 'Researcher';

  // Navigation Items with Role Restrictions
  const NAV_ITEMS = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Researcher', 'Institution Admin', 'Reviewer', 'System Admin'] },
    { label: 'Users', path: '/users', icon: Users, roles: ['System Admin'] },
    { label: 'Collaboration', path: '/collaboration', icon: Network, roles: ['Researcher', 'Institution Admin', 'Reviewer', 'System Admin'] },
  ];

  const filteredNavItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside
      className={`flex flex-col flex-shrink-0 bg-card border-r border-border transition-all duration-300 z-30 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border min-h-[64px]">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-primary-foreground font-bold shadow-md flex-shrink-0">
          <Activity className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-bold tracking-tight text-foreground truncate">Nexora Analyzer</h1>
            <p className="text-[10px] text-muted-foreground truncate">Scientific Network Platform</p>
          </div>
        )}
      </div>

      {/* Role Badge Indicator */}
      {!collapsed && (
        <div className="px-4 py-2 bg-muted/40 border-b border-border flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Current Role</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
            {role}
          </span>
        </div>
      )}

      {/* Main Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Secondary Links: Settings */}
      <div className="p-2 border-t border-border space-y-1">
        <NavLink
          to="/settings"
          title={collapsed ? 'Settings' : undefined}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`
          }
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
      </div>

      {/* Sidebar Collapse Toggle */}
      <button
        onClick={onToggleCollapse}
        className="flex items-center justify-center p-3 border-t border-border text-muted-foreground hover:bg-muted transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
};
