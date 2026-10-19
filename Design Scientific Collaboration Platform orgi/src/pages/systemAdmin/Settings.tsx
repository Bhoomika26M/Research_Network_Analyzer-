import { useState } from 'react'
import { Save, RotateCcw, Loader2 } from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

const TIMEZONES = ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney']
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Chinese (Simplified)']
const SESSION_TIMEOUTS = ['15 minutes', '30 minutes', '1 hour', '2 hours', '4 hours', '8 hours']

interface Settings {
  platformName: string
  adminEmail: string
  timezone: string
  language: string
  publicRegistration: boolean
  emailVerification: boolean
  guestAccess: boolean
  twoFA: boolean
  maintenanceMode: boolean
  smtpHost: string
  smtpPort: string
  fromAddress: string
  sessionTimeout: string
  maxLoginAttempts: number
  ipWhitelist: string
}

const DEFAULTS: Settings = {
  platformName: 'Scientific',
  adminEmail: 'admin@scientific.app',
  timezone: 'UTC',
  language: 'English',
  publicRegistration: true,
  emailVerification: true,
  guestAccess: false,
  twoFA: false,
  maintenanceMode: false,
  smtpHost: 'smtp.sendgrid.net',
  smtpPort: '587',
  fromAddress: 'noreply@scientific.app',
  sessionTimeout: '1 hour',
  maxLoginAttempts: 5,
  ipWhitelist: '',
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)} className={`relative w-10 h-6 rounded-full transition-colors ${value ? 'bg-[#F59E0B]' : 'bg-border'}`}>
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-1'}`} />
    </button>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <h2 className="text-sm font-semibold text-foreground border-b border-border pb-3">{title}</h2>
      {children}
    </div>
  )
}

export default function AdminSettings() {
  const { showToast } = useAppContext()
  const [settings, setSettings] = useState<Settings>(DEFAULTS)
  const [saving, setSaving] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 1500))
    setSaving(false)
    showToast('Settings saved successfully', 'success')
  }

  const handleReset = () => {
    setSettings(DEFAULTS)
    showToast('Settings reset to defaults', 'info')
    setResetOpen(false)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Platform configuration and preferences</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setResetOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-accent transition-colors">
            <RotateCcw size={14} /> Reset to Defaults
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-70 transition-colors" style={{ background: '#F59E0B' }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <Section title="General Settings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Platform Name', key: 'platformName', placeholder: 'Scientific' },
            { label: 'Admin Email', key: 'adminEmail', placeholder: 'admin@example.com' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
              <input value={(settings as unknown as Record<string, string>)[key]} onChange={e => set(key as keyof Settings, e.target.value as never)} placeholder={placeholder} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#F59E0B]" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Timezone</label>
            <select value={settings.timezone} onChange={e => set('timezone', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none">
              {TIMEZONES.map(tz => <option key={tz}>{tz}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Language</label>
            <select value={settings.language} onChange={e => set('language', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none">
              {LANGUAGES.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>
      </Section>

      <Section title="Feature Toggles">
        <div className="space-y-3">
          {[
            { label: 'Enable Public Registration', desc: 'Allow new users to self-register', key: 'publicRegistration' },
            { label: 'Require Email Verification', desc: 'Users must verify their email address before accessing the platform', key: 'emailVerification' },
            { label: 'Allow Guest Access', desc: 'Allow unauthenticated users to browse published content', key: 'guestAccess' },
            { label: 'Enable 2FA', desc: 'Require two-factor authentication for all users', key: 'twoFA' },
            { label: 'Maintenance Mode', desc: 'Temporarily disable the platform for maintenance', key: 'maintenanceMode' },
          ].map(({ label, desc, key }) => (
            <div key={key} className="flex items-start justify-between gap-4 py-2">
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
              <Toggle value={(settings as unknown as Record<string, boolean>)[key]} onChange={v => set(key as keyof Settings, v as never)} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Email Settings">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1">SMTP Host</label>
            <input value={settings.smtpHost} onChange={e => set('smtpHost', e.target.value)} placeholder="smtp.example.com" className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#F59E0B]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">SMTP Port</label>
            <input value={settings.smtpPort} onChange={e => set('smtpPort', e.target.value)} placeholder="587" className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#F59E0B]" />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-foreground mb-1">From Address</label>
            <input value={settings.fromAddress} onChange={e => set('fromAddress', e.target.value)} placeholder="noreply@example.com" className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#F59E0B]" />
          </div>
        </div>
      </Section>

      <Section title="Security Settings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Session Timeout</label>
            <select value={settings.sessionTimeout} onChange={e => set('sessionTimeout', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none">
              {SESSION_TIMEOUTS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Max Login Attempts</label>
            <input type="number" min={1} max={20} value={settings.maxLoginAttempts} onChange={e => set('maxLoginAttempts', Number(e.target.value))} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#F59E0B]" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1">IP Whitelist</label>
            <textarea
              value={settings.ipWhitelist}
              onChange={e => set('ipWhitelist', e.target.value)}
              rows={3}
              placeholder="Enter IP addresses, one per line (leave empty to allow all)"
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#F59E0B] resize-none font-mono"
            />
          </div>
        </div>
      </Section>

      <ConfirmDialog
        open={resetOpen}
        title="Reset to Defaults"
        message="Are you sure you want to reset all settings to their default values? Any unsaved changes will be lost."
        confirmLabel="Reset"
        danger
        onConfirm={handleReset}
        onCancel={() => setResetOpen(false)}
      />
    </div>
  )
}
