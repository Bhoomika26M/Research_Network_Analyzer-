import { useState } from 'react'
import { useToast } from '../../context/ToastContext'
import { TagInput } from '../../components/Modals/FormModal'

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className={`toggle ${on ? 'toggle--on' : ''}`}>
      <span className="toggle-knob" />
    </button>
  )
}

const inputCls = 'px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors w-full'
const labelCls = 'block text-xs font-medium text-[#64748B] mb-1.5'

export default function SystemConfig() {
  const { showToast } = useToast()

  // General Settings
  const [platformName, setPlatformName] = useState('SciCollab')
  const [timezone, setTimezone] = useState('UTC')
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY')
  const [language, setLanguage] = useState('English')

  // Role & Access Defaults
  const [defaultRole, setDefaultRole] = useState('Researcher')
  const [requireApproval, setRequireApproval] = useState(true)
  const [publicSearch, setPublicSearch] = useState(true)

  // Data & Storage
  const [maxUpload, setMaxUpload] = useState('25 MB')
  const [fileTypes, setFileTypes] = useState(['PDF', 'DOCX', 'XLSX'])
  const [autoArchive, setAutoArchive] = useState(false)
  const [archiveYears, setArchiveYears] = useState('5')

  // Integrations
  const [doiKey, setDoiKey] = useState('')
  const [showDOI, setShowDOI] = useState(false)
  const [smtpServer, setSmtpServer] = useState('')
  const [smtpPort, setSmtpPort] = useState('587')
  const [smtpUser, setSmtpUser] = useState('')
  const [smtpPass, setSmtpPass] = useState('')
  const [showSmtpPass, setShowSmtpPass] = useState(false)

  return (
    <div className="p-8 max-w-[720px]">
      {/* Header */}
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] mb-3">
          <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">System Admin / Configuration</span>
        </span>
        <h1 className="font-display text-3xl text-[#0F172A]">System Configuration</h1>
        <p className="text-[#64748B] mt-1">Manage platform-wide settings and integrations</p>
      </div>

      <div className="space-y-6">
        {/* Card 1 — General Settings */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
                General Settings
              </span>
            </div>
          </div>

          <div>
            <label className={labelCls}>Platform Name</label>
            <input value={platformName} onChange={e => setPlatformName(e.target.value)} className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Default Timezone</label>
              <select value={timezone} onChange={e => setTimezone(e.target.value)} className={inputCls}>
                {['UTC', 'US/Eastern', 'US/Pacific', 'Europe/London', 'Asia/Tokyo'].map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Date Format</label>
              <select value={dateFormat} onChange={e => setDateFormat(e.target.value)} className={inputCls}>
                {['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Default Language</label>
            <select value={language} onChange={e => setLanguage(e.target.value)} className={inputCls}>
              {['English', 'French', 'German', 'Japanese'].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => showToast('General settings saved', 'success')}
              className="px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:brightness-110 hover:shadow-md transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Card 2 — Role & Access Defaults */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
            Role &amp; Access Defaults
          </span>

          <div>
            <label className={labelCls}>Default Role for New Users</label>
            <select value={defaultRole} onChange={e => setDefaultRole(e.target.value)} className={inputCls}>
              {['Researcher', 'Reviewer'].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-[#0F172A]">Require Admin Approval for New Institutions</p>
              <p className="text-xs text-[#64748B] mt-0.5">New institution registrations must be approved by a system admin</p>
            </div>
            <Toggle on={requireApproval} onToggle={() => setRequireApproval(v => !v)} />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-[#0F172A]">Allow Public Profile Search</p>
              <p className="text-xs text-[#64748B] mt-0.5">Allow unauthenticated users to search researcher profiles</p>
            </div>
            <Toggle on={publicSearch} onToggle={() => setPublicSearch(v => !v)} />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => showToast('Access settings saved', 'success')}
              className="px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:brightness-110 hover:shadow-md transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Card 3 — Data & Storage */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
            Data &amp; Storage
          </span>

          <div>
            <label className={labelCls}>Max Upload Size</label>
            <select value={maxUpload} onChange={e => setMaxUpload(e.target.value)} className={inputCls}>
              {['5 MB', '10 MB', '25 MB', '50 MB', '100 MB'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Allowed File Types</label>
            <TagInput
              tags={fileTypes}
              onChange={setFileTypes}
              placeholder="e.g. PDF, DOCX"
            />
            <p className="text-xs text-[#94A3B8] mt-1">Type a file extension and press Enter or comma to add</p>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-[#0F172A]">Auto-archive publications</p>
              <p className="text-xs text-[#64748B] mt-0.5">Automatically archive publications after a set number of years</p>
            </div>
            <Toggle on={autoArchive} onToggle={() => setAutoArchive(v => !v)} />
          </div>

          {autoArchive && (
            <div className="flex items-center gap-3">
              <label className="text-sm text-[#64748B] whitespace-nowrap">Auto-archive after</label>
              <input
                type="number"
                min={1}
                max={100}
                value={archiveYears}
                onChange={e => setArchiveYears(e.target.value)}
                className="w-24 px-3 py-2 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors"
              />
              <span className="text-sm text-[#64748B]">years</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={() => showToast('Storage settings saved', 'success')}
              className="px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:brightness-110 hover:shadow-md transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Card 4 — Integrations */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
            Integrations
          </span>

          <div>
            <label className={labelCls}>DOI Registry API Key</label>
            <div className="relative">
              <input
                type={showDOI ? 'text' : 'password'}
                value={doiKey}
                onChange={e => setDoiKey(e.target.value)}
                placeholder="Enter API key"
                className={inputCls + ' pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowDOI(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] transition-colors"
              >
                {showDOI ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5S1 8 1 8z" stroke="currentColor" strokeWidth="1.3"/>
                    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/>
                    <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5S1 8 1 8z" stroke="currentColor" strokeWidth="1.3"/>
                    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>SMTP Server</label>
              <input value={smtpServer} onChange={e => setSmtpServer(e.target.value)} placeholder="smtp.example.com" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>SMTP Port</label>
              <input type="number" value={smtpPort} onChange={e => setSmtpPort(e.target.value)} placeholder="587" className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>SMTP Username</label>
            <input value={smtpUser} onChange={e => setSmtpUser(e.target.value)} placeholder="username@example.com" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>SMTP Password</label>
            <div className="relative">
              <input
                type={showSmtpPass ? 'text' : 'password'}
                value={smtpPass}
                onChange={e => setSmtpPass(e.target.value)}
                placeholder="Enter password"
                className={inputCls + ' pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowSmtpPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] transition-colors"
              >
                {showSmtpPass ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5S1 8 1 8z" stroke="currentColor" strokeWidth="1.3"/>
                    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/>
                    <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5S1 8 1 8z" stroke="currentColor" strokeWidth="1.3"/>
                    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => showToast('Integration settings saved', 'success')}
              className="px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:brightness-110 hover:shadow-md transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
