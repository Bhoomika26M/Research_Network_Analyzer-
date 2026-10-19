import { useState } from 'react'
import {
  Users, FileText, Network, Calendar, Quote, BarChart3,
  ChevronRight, Star, Globe, Zap, Shield, Award, ArrowRight,
  BookOpen, Microscope, Building2, CheckCircle2,
  Share2, AtSign, Link2, Menu, X
} from 'lucide-react'

interface LandingProps {
  onNavigate: (page: string) => void
}

const stats = [
  { label: 'Active Researchers', value: '48,291', icon: Users, color: '#2563EB' },
  { label: 'Publications', value: '2.4M+', icon: FileText, color: '#7C3AED' },
  { label: 'Institutions', value: '1,847', icon: Building2, color: '#14B8A6' },
  { label: 'Research Projects', value: '12,390', icon: Microscope, color: '#F59E0B' },
]

const features = [
  {
    icon: Users, title: 'Researcher Management',
    desc: 'Comprehensive academic profiles with skills, interests, h-index, and collaboration history.',
    color: '#2563EB', bg: '#EFF6FF'
  },
  {
    icon: FileText, title: 'Publication Repository',
    desc: 'Centralized database for journals, conferences, books, and patents with DOI tracking.',
    color: '#7C3AED', bg: '#F5F3FF'
  },
  {
    icon: Network, title: 'Collaboration Network',
    desc: 'Interactive graph visualization of co-author relationships and institutional partnerships.',
    color: '#14B8A6', bg: '#F0FDFA'
  },
  {
    icon: Calendar, title: 'Conference Tracking',
    desc: 'Manage submissions, presentations, and attendance across global research conferences.',
    color: '#F59E0B', bg: '#FFFBEB'
  },
  {
    icon: Quote, title: 'Citation Management',
    desc: 'Track citations, impact factors, and altmetrics with automated reference generation.',
    color: '#EC4899', bg: '#FDF2F8'
  },
  {
    icon: BarChart3, title: 'Institutional Analytics',
    desc: 'Deep insights into institutional research output, collaboration patterns, and impact.',
    color: '#10B981', bg: '#ECFDF5'
  },
]

const testimonials = [
  {
    name: 'Dr. Sarah Chen',
    role: 'Director of Research, MIT',
    avatar: 'SC',
    color: '#2563EB',
    quote: 'SCNA has transformed how we manage our 800+ researchers. The collaboration network alone has sparked 40 new interdisciplinary projects this year.',
    rating: 5
  },
  {
    name: 'Prof. James Okafor',
    role: 'VP Research, Cambridge University',
    avatar: 'JO',
    color: '#7C3AED',
    quote: 'The publication analytics cut our grant reporting time by 70%. The citation tracking is incredibly precise and saves hours of manual work.',
    rating: 5
  },
  {
    name: 'Dr. Priya Sharma',
    role: 'Chief Science Officer, NIH',
    avatar: 'PS',
    color: '#14B8A6',
    quote: "We manage research across 200 laboratories. SCNA's institutional analytics give us the oversight we need without the administrative overhead.",
    rating: 5
  },
]

const partners = ['MIT', 'Stanford', 'Oxford', 'Cambridge', 'ETH Zürich', 'Caltech', 'Harvard', 'Yale']

export default function Landing({ onNavigate }: LandingProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <div className="rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 px-3 py-2 flex items-center gap-2">
              <svg viewBox="0 0 34 34" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
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
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Institutions', 'Pricing', 'Resources'].map(item => (
              <a key={item} href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">{item}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => onNavigate('login')} className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors px-4 py-2">
              Sign in
            </button>
            <button onClick={() => onNavigate('register')} className="text-sm font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors">
              Get Started
            </button>
          </div>
          <button className="md:hidden text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background px-6 py-4 flex flex-col gap-4">
            {['Features', 'Institutions', 'Pricing', 'Resources'].map(item => (
              <a key={item} href="#" className="text-sm text-foreground/80 font-medium">{item}</a>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={() => onNavigate('login')} className="flex-1 text-sm font-medium border border-border rounded-xl py-2 text-foreground/80">Sign in</button>
              <button onClick={() => onNavigate('register')} className="flex-1 text-sm font-semibold bg-primary text-primary-foreground rounded-xl py-2">Get Started</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-background to-purple-500/5" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-40" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl opacity-40" />

        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-8">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold text-primary tracking-wide">TRUSTED BY 1,800+ INSTITUTIONS WORLDWIDE</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight mb-6">
              Empowering Research<br />
              <span className="gradient-text">Through Collaboration</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
              The intelligent platform for managing researchers, publications, collaborations, and institutional analytics — built for the world's top universities and research laboratories.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onNavigate('register')}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-semibold text-base hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 group"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-2 bg-card border border-border text-foreground/80 px-8 py-4 rounded-2xl font-semibold text-base hover:border-border transition-all hover:shadow-sm"
              >
                View Demo
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Network Illustration */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-card rounded-3xl border border-border shadow-2xl shadow-black/10 dark:shadow-black/40 p-8 overflow-hidden">
              {/* Mock network visualization */}
              <div className="relative h-72 bg-slate-950 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950" />
                {/* Grid lines */}
                <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#60a5fa" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
                {/* Network nodes */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 288" preserveAspectRatio="xMidYMid meet">
                  {/* Connections */}
                  <line x1="400" y1="144" x2="200" y2="80" stroke="#3B82F6" strokeWidth="1.5" strokeOpacity="0.4" />
                  <line x1="400" y1="144" x2="600" y2="70" stroke="#8B5CF6" strokeWidth="1.5" strokeOpacity="0.4" />
                  <line x1="400" y1="144" x2="650" y2="200" stroke="#14B8A6" strokeWidth="1.5" strokeOpacity="0.4" />
                  <line x1="400" y1="144" x2="150" y2="210" stroke="#3B82F6" strokeWidth="1.5" strokeOpacity="0.4" />
                  <line x1="400" y1="144" x2="320" y2="240" stroke="#8B5CF6" strokeWidth="1.5" strokeOpacity="0.4" />
                  <line x1="200" y1="80" x2="600" y2="70" stroke="#3B82F6" strokeWidth="1" strokeOpacity="0.2" />
                  <line x1="600" y1="70" x2="650" y2="200" stroke="#14B8A6" strokeWidth="1" strokeOpacity="0.2" />
                  <line x1="150" y1="210" x2="320" y2="240" stroke="#8B5CF6" strokeWidth="1" strokeOpacity="0.2" />
                  <line x1="200" y1="80" x2="100" y2="150" stroke="#3B82F6" strokeWidth="1" strokeOpacity="0.2" />
                  <line x1="650" y1="200" x2="720" y2="130" stroke="#14B8A6" strokeWidth="1" strokeOpacity="0.2" />
                  {/* Peripheral nodes */}
                  <circle cx="100" cy="150" r="6" fill="#3B82F6" opacity="0.6" />
                  <circle cx="720" cy="130" r="6" fill="#14B8A6" opacity="0.6" />
                  <circle cx="500" cy="240" r="6" fill="#8B5CF6" opacity="0.6" />
                  {/* Main nodes */}
                  <circle cx="200" cy="80" r="16" fill="#1E40AF" opacity="0.9" />
                  <circle cx="200" cy="80" r="24" fill="#3B82F6" opacity="0.15" />
                  <text x="200" y="85" textAnchor="middle" fill="white" fontSize="10" fontFamily="Inter">MIT</text>
                  <circle cx="600" cy="70" r="18" fill="#6D28D9" opacity="0.9" />
                  <circle cx="600" cy="70" r="28" fill="#8B5CF6" opacity="0.15" />
                  <text x="600" y="75" textAnchor="middle" fill="white" fontSize="10" fontFamily="Inter">Oxford</text>
                  <circle cx="650" cy="200" r="14" fill="#0F766E" opacity="0.9" />
                  <circle cx="650" cy="200" r="22" fill="#14B8A6" opacity="0.15" />
                  <text x="650" y="205" textAnchor="middle" fill="white" fontSize="9" fontFamily="Inter">ETH</text>
                  <circle cx="150" cy="210" r="12" fill="#1E40AF" opacity="0.9" />
                  <circle cx="150" cy="210" r="20" fill="#3B82F6" opacity="0.15" />
                  <text x="150" y="215" textAnchor="middle" fill="white" fontSize="8" fontFamily="Inter">Cal</text>
                  <circle cx="320" cy="240" r="12" fill="#6D28D9" opacity="0.9" />
                  <circle cx="320" cy="240" r="18" fill="#8B5CF6" opacity="0.15" />
                  <text x="320" y="245" textAnchor="middle" fill="white" fontSize="9" fontFamily="Inter">Yale</text>
                  {/* Central hub */}
                  <circle cx="400" cy="144" r="32" fill="#1E40AF" opacity="0.95" />
                  <circle cx="400" cy="144" r="46" fill="#3B82F6" opacity="0.12" />
                  <circle cx="400" cy="144" r="58" fill="#3B82F6" opacity="0.06" />
                  <text x="400" y="140" textAnchor="middle" fill="white" fontSize="11" fontFamily="Poppins" fontWeight="600">SCNA</text>
                  <text x="400" y="155" textAnchor="middle" fill="#93C5FD" fontSize="9" fontFamily="Inter">Network Hub</text>
                </svg>
                {/* Floating stats */}
                <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2">
                  <p className="text-xs text-blue-200 font-medium">Active Connections</p>
                  <p className="text-lg font-bold text-white">24,891</p>
                </div>
                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2">
                  <p className="text-xs text-purple-200 font-medium">New Today</p>
                  <p className="text-lg font-bold text-white">+142</p>
                </div>
              </div>
              {/* Bottom stat row */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                {[
                  { label: 'Cross-institution Papers', value: '8,240', change: '+12%' },
                  { label: 'Active Co-authors', value: '31,427', change: '+8%' },
                  { label: 'Avg H-Index', value: '34.2', change: '+2.1' },
                ].map(item => (
                  <div key={item.label} className="text-center">
                    <p className="text-lg font-bold text-foreground">{item.value}</p>
                    <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                    <span className="text-xs text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">{item.change}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(stat => (
            <div key={stat.label} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4" style={{ backgroundColor: stat.color + '15' }}>
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-primary tracking-widest uppercase mb-4">Platform Features</p>
            <h2 className="text-4xl font-bold text-foreground mb-4">Everything research teams need</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A unified platform that connects researchers, tracks publications, and reveals collaboration patterns across institutions.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(feature => (
              <div key={feature.title} className="bg-card rounded-2xl p-6 border border-border card-hover group cursor-pointer">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: feature.bg }}>
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{feature.desc}</p>
                <span className="text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: feature.color }}>
                  Learn more <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-purple-500 tracking-widest uppercase mb-4">Testimonials</p>
            <h2 className="text-4xl font-bold text-foreground mb-4">Trusted by leading researchers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="bg-background rounded-2xl p-6 border border-border">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: t.color }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-16 px-6 bg-background border-y border-border">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-xs font-bold text-muted-foreground/70 tracking-widest uppercase mb-10">Partner Universities & Research Institutions</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {partners.map(p => (
              <div key={p} className="bg-card border border-border rounded-xl px-6 py-3 text-sm font-bold text-foreground/80 hover:border-primary/30 hover:text-primary transition-colors">
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to transform your research network?</h2>
          <p className="text-lg text-blue-200 mb-10">Join 1,800+ institutions already using SCNA to power their research collaboration.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => onNavigate('register')} className="flex items-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-2xl font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5 group">
              Start Free Trial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/10 transition-all">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Network className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white">SCNA</span>
              </div>
              <p className="text-sm leading-relaxed mb-6 text-slate-500">
                Scientific Collaboration Network Analyzer — the intelligence layer for academic research institutions worldwide.
              </p>
              <div className="flex items-center gap-3">
                {[Share2, AtSign, Link2].map((Icon, i) => (
                  <button key={i} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Security', 'Changelog'] },
              { title: 'Research', links: ['Publications', 'Citations', 'Analytics', 'API'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
            ].map(col => (
              <div key={col.title}>
                <p className="text-sm font-semibold text-slate-300 mb-4">{col.title}</p>
                {col.links.map(link => (
                  <a key={link} href="#" className="block text-sm text-slate-500 hover:text-slate-300 mb-2.5 transition-colors">{link}</a>
                ))}
              </div>
            ))}
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">© 2024 Scientific Collaboration Network Analyzer. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
