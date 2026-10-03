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

const recentEvents = [
  { actor: 'Unknown', event: 'Failed login attempt', time: '2h ago', ip: '203.0.113.42' },
  { actor: 'Unknown', event: 'Failed login attempt', time: '3h ago', ip: '198.51.100.7' },
  { actor: 'system@example.com', event: 'Password reset requested', time: '6h ago', ip: '10.0.0.1' },
  { actor: 'admin@mit.edu', event: 'Role changed', time: '1d ago', ip: '192.168.1.5' },
  { actor: 'Unknown', event: 'Failed login attempt (blocked)', time: '2d ago', ip: '203.0.113.99' },
]

export default function SecuritySettings() {
  const { showToast } = useToast()

  // Authentication
  const [require2FA, setRequire2FA] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState('1 hr')
  const [minPasswordLen, setMinPasswordLen] = useState('8')
  const [requireSpecialChar, setRequireSpecialChar] = useState(true)
  const [requireUppercase, setRequireUppercase] = useState(true)

  // IP Restrictions
  const [ipAllowlist, setIpAllowlist] = useState(false)
  const [ipRanges, setIpRanges] = useState<string[]>([])

  // Confirmation modals
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showResetKeysConfirm, setShowResetKeysConfirm] = useState(false)

  return (
    <div className="p-8 max-w-[720px]">
      {/* Header */}
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] mb-3">
          <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">System Admin / Security</span>
        </span>
        <h1 className="font-display text-3xl text-[#0F172A]">Security Settings</h1>
        <p className="text-[#64748B] mt-1">Authentication rules, access logs, and platform-level security controls</p>
      </div>

      <div className="space-y-6">
        {/* Card 1 — Authentication */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
            Authentication
          </span>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-[#0F172A]">Require 2FA for all users</p>
              <p className="text-xs text-[#64748B] mt-0.5">Force two-factor authentication on every account</p>
            </div>
            <Toggle on={require2FA} onToggle={() => setRequire2FA(v => !v)} />
          </div>

          <div>
            <label className={labelCls}>Session Timeout</label>
            <select value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)} className={inputCls}>
              {['30 min', '1 hr', '4 hr', '24 hr'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Minimum Password Length</label>
            <input
              type="number"
              min={6}
              max={32}
              value={minPasswordLen}
              onChange={e => setMinPasswordLen(e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <p className="text-sm font-medium text-[#0F172A]">Require special character in password</p>
            <Toggle on={requireSpecialChar} onToggle={() => setRequireSpecialChar(v => !v)} />
          </div>

          <div className="flex items-center justify-between py-1">
            <p className="text-sm font-medium text-[#0F172A]">Require uppercase in password</p>
            <Toggle on={requireUppercase} onToggle={() => setRequireUppercase(v => !v)} />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => showToast('Authentication settings saved', 'success')}
              className="px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:brightness-110 hover:shadow-md transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Card 2 — Access Logs Summary */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
            Access Logs Summary
          </span>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Failed Login Attempts (24h)', value: '3' },
              { label: 'Active Sessions', value: '47' },
              { label: 'Last Security Scan', value: '2 hours ago' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl border border-[#E2E8F0] p-4 text-center">
                <p className="font-display text-2xl text-[#0F172A]">{stat.value}</p>
                <p className="text-xs text-[#64748B] mt-1 leading-snug">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#FAFAFA] border-b border-[#E2E8F0]">
                  {['Actor', 'Event', 'Time', 'IP'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5">
                      <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#64748B]">{h}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((ev, i) => (
                  <tr key={i} className="border-b border-[#F1F5F9] last:border-0 hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-4 py-3 text-xs text-[#0F172A] font-medium max-w-[120px] truncate">{ev.actor}</td>
                    <td className="px-4 py-3 text-xs text-[#64748B]">{ev.event}</td>
                    <td className="px-4 py-3 text-xs text-[#94A3B8] whitespace-nowrap">{ev.time}</td>
                    <td className="px-4 py-3 font-mono text-[10px] text-[#64748B]">{ev.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card 3 — IP Restrictions */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
            IP Restrictions
          </span>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-[#0F172A]">Enable IP Allowlist</p>
              <p className="text-xs text-[#64748B] mt-0.5">Restrict admin access to specific IP ranges</p>
            </div>
            <Toggle on={ipAllowlist} onToggle={() => setIpAllowlist(v => !v)} />
          </div>

          {ipAllowlist && (
            <div>
              <label className={labelCls}>Allowed IP Ranges</label>
              <TagInput
                tags={ipRanges}
                onChange={setIpRanges}
                placeholder="192.168.1.0/24"
              />
            </div>
          )}

          <p className="text-xs text-[#64748B]">
            Only allow admin access from these IP ranges. Leave empty to allow all IPs.
          </p>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => showToast('IP restrictions saved', 'success')}
              className="px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:brightness-110 hover:shadow-md transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Card 4 — Danger Zone */}
        <div className="border border-red-100 rounded-2xl p-6 space-y-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-red-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            Danger Zone
          </span>

          <div className="flex items-center justify-between py-2">
            <div className="flex-1 pr-8">
              <p className="text-sm font-medium text-[#0F172A]">Force Logout All Users</p>
              <p className="text-xs text-[#64748B] mt-0.5">Immediately terminate all active user sessions across the platform.</p>
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="border border-red-200 text-red-600 text-xs font-semibold rounded-xl px-4 py-2 hover:bg-red-50 transition-colors whitespace-nowrap"
            >
              Force Logout
            </button>
          </div>

          <div className="border-t border-red-50 pt-4 flex items-center justify-between">
            <div className="flex-1 pr-8">
              <p className="text-sm font-medium text-[#0F172A]">Reset All API Keys</p>
              <p className="text-xs text-[#64748B] mt-0.5">Invalidate all integration API keys. Services using these keys will stop working until re-configured.</p>
            </div>
            <button
              onClick={() => setShowResetKeysConfirm(true)}
              className="border border-red-200 text-red-600 text-xs font-semibold rounded-xl px-4 py-2 hover:bg-red-50 transition-colors whitespace-nowrap"
            >
              Reset All Keys
            </button>
          </div>
        </div>
      </div>

      {/* Force Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-md p-6 animate-confirm-in">
            <h2 className="font-display text-xl text-[#0F172A] mb-2">Are you sure?</h2>
            <p className="text-sm text-[#64748B] mb-6">This will immediately terminate all active user sessions across the platform. Users will need to log in again.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowLogoutConfirm(false); showToast('All users have been logged out', 'success') }}
                className="px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Keys Confirmation Modal */}
      {showResetKeysConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-md p-6 animate-confirm-in">
            <h2 className="font-display text-xl text-[#0F172A] mb-2">Are you sure?</h2>
            <p className="text-sm text-[#64748B] mb-6">All integration API keys will be invalidated immediately. Services depending on these keys will stop working until they are re-configured.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowResetKeysConfirm(false)}
                className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowResetKeysConfirm(false); showToast('All API keys have been reset', 'success') }}
                className="px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
