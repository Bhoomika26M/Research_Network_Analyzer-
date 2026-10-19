import {
  LayoutDashboard, Users, FileText, Network, Building2,
  FolderOpen, Calendar, Quote, BarChart3, Settings,
  ChevronLeft, ChevronRight, LogOut
} from 'lucide-react'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'researchers', label: 'Researchers', icon: Users },
  { id: 'publications', label: 'Publications', icon: FileText },
  { id: 'collaborations', label: 'Collaborations', icon: Network },
  { id: 'institutions', label: 'Institutions', icon: Building2 },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'conferences', label: 'Conferences', icon: Calendar },
  { id: 'citations', label: 'Citations', icon: Quote },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  activePage: string
  onNavigate: (page: string) => void
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ activePage, onNavigate, collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className="relative flex-shrink-0 h-screen bg-card border-r border-border flex flex-col transition-all duration-300"
      style={{ width: collapsed ? 64 : 220 }}
    >
      {/* Logo */}
      <div className="h-16 flex items-center border-b border-border px-3 overflow-hidden">
        {collapsed ? (
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
            <svg viewBox="0 0 34 34" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <circle cx="17" cy="17" r="3.5" fill="white"/>
              <ellipse cx="17" cy="17" rx="15" ry="5.5" fill="none" stroke="white" strokeWidth="1.5" opacity="0.9"/>
              <ellipse cx="17" cy="17" rx="15" ry="5.5" fill="none" stroke="white" strokeWidth="1.5" opacity="0.7" transform="rotate(60 17 17)"/>
              <ellipse cx="17" cy="17" rx="15" ry="5.5" fill="none" stroke="white" strokeWidth="1.5" opacity="0.5" transform="rotate(120 17 17)"/>
              <circle cx="32" cy="17" r="2" fill="white"/>
              <circle cx="8.5" cy="6" r="2" fill="white" opacity="0.8"/>
            </svg>
          </div>
        ) : (
          <div className="rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 px-3 py-2 flex items-center gap-2">
            <svg viewBox="0 0 34 34" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <circle cx="17" cy="17" r="3.5" fill="white"/>
              <ellipse cx="17" cy="17" rx="15" ry="5.5" fill="none" stroke="white" strokeWidth="1.4" opacity="0.9"/>
              <ellipse cx="17" cy="17" rx="15" ry="5.5" fill="none" stroke="white" strokeWidth="1.4" opacity="0.7" transform="rotate(60 17 17)"/>
              <ellipse cx="17" cy="17" rx="15" ry="5.5" fill="none" stroke="white" strokeWidth="1.4" opacity="0.5" transform="rotate(120 17 17)"/>
              <circle cx="32" cy="17" r="2" fill="white"/>
              <circle cx="8.5" cy="6" r="2" fill="white" opacity="0.8"/>
              <circle cx="8.5" cy="28" r="2" fill="white" opacity="0.6"/>
            </svg>
            <span className="text-white font-bold text-sm tracking-tight">Scientific</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        {navItems.map(item => {
          const active = activePage === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-4 py-2.5 mb-0.5 rounded-none relative group transition-all
                ${active
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
            >
              {active && <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-primary rounded-r" />}
              <item.icon className={`flex-shrink-0 w-4 h-4 ${active ? 'text-primary' : ''}`} />
              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
              {collapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-foreground text-card text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                  {item.label}
                </div>
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border p-3">
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              SC
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-foreground whitespace-nowrap">Dr. Sarah Chen</p>
              <p className="text-xs text-muted-foreground/70 whitespace-nowrap">MIT · Admin</p>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground/70 hover:text-foreground hover:bg-secondary/60 rounded-lg transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-3 h-3" /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  )
}
