import { useState } from 'react'
import { User, Bell, Shield, Palette, Globe, Key, Save } from 'lucide-react'

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'integrations', label: 'Integrations', icon: Globe },
  { id: 'api', label: 'API Keys', icon: Key },
] as const

type TabId = typeof tabs[number]['id']

export default function Settings() {
  const [activeTab, setActiveTab] = useState<TabId>('profile')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex-1 overflow-hidden flex bg-background">
      {/* Tab sidebar */}
      <div className="w-56 flex-shrink-0 bg-card border-r border-border p-4">
        <p className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wide mb-4">Settings</p>
        <div className="space-y-0.5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/60'
              }`}
            >
              <tab.icon className="w-4 h-4 flex-shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'profile' && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-sm font-semibold text-foreground mb-5">Personal Information</h2>
              <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">SC</div>
                <div>
                  <button className="text-sm text-primary font-medium hover:text-primary/80">Change avatar</button>
                  <p className="text-xs text-muted-foreground/70 mt-1">JPG, PNG or GIF — max 5MB</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'First Name', value: 'Sarah', placeholder: '' },
                  { label: 'Last Name', value: 'Chen', placeholder: '' },
                  { label: 'Title / Prefix', value: 'Dr.', placeholder: 'Dr., Prof., etc.' },
                  { label: 'Department', value: 'Computer Science', placeholder: '' },
                  { label: 'ORCID iD', value: '0000-0001-2345-6789', placeholder: '0000-0000-0000-0000' },
                  { label: 'Google Scholar ID', value: 'aBcDeFgH', placeholder: '' },
                ].map(field => (
                  <div key={field.label}>
                    <label className="text-xs font-semibold text-foreground/80 mb-1.5 block">{field.label}</label>
                    <input
                      defaultValue={field.value}
                      placeholder={field.placeholder}
                      className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-sm font-semibold text-foreground mb-5">Research Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground/80 mb-1.5 block">Bio</label>
                  <textarea
                    rows={4}
                    defaultValue="Professor of Computer Science at MIT. Research interests in quantum computing, machine learning, and drug discovery."
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground/80 mb-1.5 block">Research Interests (comma-separated)</label>
                  <input
                    defaultValue="Quantum Computing, Machine Learning, Drug Discovery, Bioinformatics"
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                saved ? 'bg-emerald-600 text-white' : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              <Save className="w-4 h-4" />
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="max-w-2xl">
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-sm font-semibold text-foreground mb-5">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { label: 'New citation alerts', desc: 'When your paper is cited by someone', enabled: true },
                  { label: 'Collaboration requests', desc: 'When a researcher wants to collaborate', enabled: true },
                  { label: 'Publication status updates', desc: 'Acceptance, rejection, revision requests', enabled: true },
                  { label: 'Conference deadlines', desc: '7 days, 3 days, and 1 day reminders', enabled: true },
                  { label: 'Weekly digest', desc: 'Summary of network activity every Monday', enabled: false },
                  { label: 'New follower alerts', desc: 'When someone follows your profile', enabled: false },
                  { label: 'System announcements', desc: 'Platform updates and new features', enabled: true },
                ].map(setting => (
                  <div key={setting.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{setting.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{setting.desc}</p>
                    </div>
                    <button className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ml-4 ${setting.enabled ? 'bg-primary' : 'bg-secondary'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${setting.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="max-w-2xl">
            <div className="bg-card rounded-2xl border border-border p-6 mb-4">
              <h2 className="text-sm font-semibold text-foreground mb-2">API Keys</h2>
              <p className="text-xs text-muted-foreground mb-5">Use API keys to integrate SCNA data into your own applications and workflows.</p>
              <div className="space-y-3">
                {[
                  { name: 'Production Key', key: 'scna_prod_••••••••••••••••••••••gh7K', created: 'Nov 1, 2024', last: '2 min ago' },
                  { name: 'Development Key', key: 'scna_dev_••••••••••••••••••••••x9Lm', created: 'Oct 15, 2024', last: '3 days ago' },
                ].map(k => (
                  <div key={k.name} className="border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-foreground">{k.name}</p>
                      <button className="text-xs text-red-500 hover:text-red-400 font-medium">Revoke</button>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground bg-secondary rounded-lg px-3 py-2 mb-2">{k.key}</p>
                    <p className="text-xs text-muted-foreground/70">Created {k.created} · Last used {k.last}</p>
                  </div>
                ))}
              </div>
              <button className="mt-4 flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors">
                <Key className="w-4 h-4" /> Generate New Key
              </button>
            </div>
          </div>
        )}

        {(activeTab === 'security' || activeTab === 'appearance' || activeTab === 'integrations') && (
          <div className="max-w-2xl">
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                {activeTab === 'security' ? <Shield className="w-7 h-7 text-muted-foreground/40" /> :
                 activeTab === 'appearance' ? <Palette className="w-7 h-7 text-muted-foreground/40" /> :
                 <Globe className="w-7 h-7 text-muted-foreground/40" />}
              </div>
              <p className="text-sm font-semibold text-foreground/80 mb-2 capitalize">{activeTab} Settings</p>
              <p className="text-xs text-muted-foreground">This section is available in the full version of SCNA.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
