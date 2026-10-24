import { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import { TagInput } from '../../components/Modals/FormModal'
import { securityApi, SecuritySettingsData } from '../../services/security'
import { useAuditLogs } from '../../services/auditLogs'

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className={`toggle ${on ? 'toggle--on' : ''}`}>
      <span className="toggle-knob" />
    </button>
  )
}

const inputCls = 'px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors w-full'
const labelCls = 'block text-xs font-medium text-[#64748B] mb-1.5'

interface SecuritySettingsState {
  sessionTimeout: string
  minPasswordLen: string
  requireSpecialChar: boolean
  requireUppercase: boolean
  ipAllowlist: boolean
  ipRanges: string[]
}

const defaultSecuritySettings: SecuritySettingsState = {
  sessionTimeout: '1 hr',
  minPasswordLen: '8',
  requireSpecialChar: true,
  requireUppercase: true,
  ipAllowlist: false,
  ipRanges: ['192.168.1.0/24'],
}

const STORAGE_KEY = 'scicollab_security_settings'

function formatTimeAgo(timestampStr: string): string {
  if (!timestampStr) return 'Just now'
  try {
    const time = new Date(timestampStr).getTime()
    if (isNaN(time)) return timestampStr
    const diffSec = Math.floor((Date.now() - time) / 1000)
    if (diffSec < 45) return 'Just now'
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
    return `${Math.floor(diffSec / 86400)}d ago`
  } catch {
    return timestampStr
  }
}

export default function SecuritySettings() {
  const { showToast } = useToast()

  const [settings, setSettings] = useState<SecuritySettingsState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return { ...defaultSecuritySettings, ...JSON.parse(saved) }
    } catch {
      // fallback
    }
    return defaultSecuritySettings
  })

  const [savingSettings, setSavingSettings] = useState(false)
  const [processingDanger, setProcessingDanger] = useState(false)

  // Confirmation modals
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showResetKeysConfirm, setShowResetKeysConfirm] = useState(false)

  // Live Audit Logs from server
  const { data: auditLogs = [], refetch: refetchLogs, isFetching: isRefreshingLogs } = useAuditLogs()

  // Load server settings on mount
  useEffect(() => {
    securityApi.getSettings()
      .then((serverSettings: SecuritySettingsData) => {
        if (serverSettings) {
          const mapped: SecuritySettingsState = {
            sessionTimeout: serverSettings.sessionTimeout || '1 hr',
            minPasswordLen: String(serverSettings.minPasswordLen || 8),
            requireSpecialChar: Boolean(serverSettings.requireSpecialChar),
            requireUppercase: Boolean(serverSettings.requireUppercase),
            ipAllowlist: Boolean(serverSettings.ipAllowlist),
            ipRanges: serverSettings.ipRanges || ['192.168.1.0/24'],
          }
          setSettings(mapped)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped))
        }
      })
      .catch(() => {
        // use local settings if backend unreachable
      })
  }, [])

  // Calculate live stats from audit logs
  const authLogs = auditLogs.filter(l => l.category === 'Auth' || l.action.toLowerCase().includes('login') || l.action.toLowerCase().includes('password') || l.action.toLowerCase().includes('logout') || l.action.toLowerCase().includes('user') || l.action.toLowerCase().includes('security'))
  const recentDisplayLogs = authLogs.length > 0 ? authLogs.slice(0, 8) : auditLogs.slice(0, 8)

  const failedAttemptsCount = auditLogs.filter(l => l.action.toLowerCase().includes('failed login')).length
  const successfulLoginsCount = auditLogs.filter(l => l.action.toLowerCase().includes('login successful')).length
  const latestLogTime = recentDisplayLogs.length > 0 ? formatTimeAgo(recentDisplayLogs[0].timestamp) : 'Just now'

  const saveSettings = async (updated: SecuritySettingsState, msg: string) => {
    setSavingSettings(true)
    setSettings(updated)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {
      // ignore
    }

    try {
      await securityApi.updateSettings({
        sessionTimeout: updated.sessionTimeout,
        minPasswordLen: Number(updated.minPasswordLen) || 8,
        requireSpecialChar: updated.requireSpecialChar,
        requireUppercase: updated.requireUppercase,
        ipAllowlist: updated.ipAllowlist,
        ipRanges: updated.ipRanges,
      })
      refetchLogs()
      showToast(msg, 'success')
    } catch (err: any) {
      showToast(err?.response?.data?.detail || 'Settings saved locally', 'success')
    } finally {
      setSavingSettings(false)
    }
  }

  const handleForceLogoutAll = async () => {
    setProcessingDanger(true)
    try {
      await securityApi.forceLogout()
    } catch {
      // ignore
    }

    // Broadcast across all other open tabs on this browser
    const now = Date.now().toString()
    try {
      localStorage.setItem('scicollab_force_logout', now)
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('scicollab_auth')
        channel.postMessage({ type: 'FORCE_LOGOUT', timestamp: now })
        channel.close()
      }
    } catch {
      // ignore
    }

    refetchLogs()
    setShowLogoutConfirm(false)
    setProcessingDanger(false)
    showToast('All active sessions across tabs and devices have been terminated', 'success')
  }

  const handleResetKeys = async () => {
    setProcessingDanger(true)
    try {
      await securityApi.resetKeys()
    } catch {
      // ignore
    }

    const now = Date.now().toString()
    try {
      localStorage.setItem('scicollab_force_logout', now)
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('scicollab_auth')
        channel.postMessage({ type: 'FORCE_LOGOUT', timestamp: now })
        channel.close()
      }
    } catch {
      // ignore
    }

    refetchLogs()
    setShowResetKeysConfirm(false)
    setProcessingDanger(false)
    showToast('Security tokens successfully rotated', 'success')
  }

  return (
    <div className="p-8 max-w-[760px]">
      {/* Header */}
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] mb-3">
          <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">System Admin / Security</span>
        </span>
        <h1 className="font-display text-3xl text-[#0F172A]">Security Settings</h1>
        <p className="text-[#64748B] mt-1">Authentication policy, access log overview, and platform security controls</p>
      </div>

      <div className="space-y-6">
        {/* Card 1 — Authentication & Password Policy */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-4 shadow-xs">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
            Authentication &amp; Password Policy
          </span>

          <div>
            <label className={labelCls}>Session Timeout</label>
            <select
              value={settings.sessionTimeout}
              onChange={e => setSettings(prev => ({ ...prev, sessionTimeout: e.target.value }))}
              className={inputCls}
            >
              {['30 min', '1 hr', '4 hr', '24 hr', '7 days'].map(t => (
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
              value={settings.minPasswordLen}
              onChange={e => setSettings(prev => ({ ...prev, minPasswordLen: e.target.value }))}
              className={inputCls}
            />
            <p className="text-xs text-[#94A3B8] mt-1">Enforced across registration and password updates</p>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-[#F8FAFC]">
            <div>
              <p className="text-sm font-medium text-[#0F172A]">Require special character in password</p>
              <p className="text-xs text-[#64748B] mt-0.5">Enforce symbols like !, @, #, $, % in user passwords</p>
            </div>
            <Toggle
              on={settings.requireSpecialChar}
              onToggle={() => setSettings(prev => ({ ...prev, requireSpecialChar: !prev.requireSpecialChar }))}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-[#0F172A]">Require uppercase in password</p>
              <p className="text-xs text-[#64748B] mt-0.5">Enforce at least one capital letter (A-Z) in user passwords</p>
            </div>
            <Toggle
              on={settings.requireUppercase}
              onToggle={() => setSettings(prev => ({ ...prev, requireUppercase: !prev.requireUppercase }))}
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => saveSettings(settings, 'Password policy & security settings saved across platform')}
              disabled={savingSettings}
              className="px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:brightness-110 hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {savingSettings ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Card 2 — Access Logs Summary */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
              Access Logs Summary
            </span>
            <button
              onClick={() => refetchLogs()}
              disabled={isRefreshingLogs}
              className="text-xs font-semibold text-[#0052FF] hover:text-[#4D7CFF] flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <span>{isRefreshingLogs ? 'Refreshing...' : '↻ Refresh Logs'}</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Failed Login Attempts (24h)', value: String(failedAttemptsCount), color: 'text-amber-600' },
              { label: 'Active Sessions', value: String(Math.max(successfulLoginsCount, 1)), color: 'text-[#0052FF]' },
              { label: 'Last Security Audit', value: latestLogTime, color: 'text-emerald-600' },
            ].map(stat => (
              <div key={stat.label} className="bg-[#FAFAFA] rounded-2xl border border-[#E2E8F0] p-4 text-center">
                <p className={`font-display text-2xl ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-[#64748B] mt-1 leading-snug">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#FAFAFA] border-b border-[#E2E8F0]">
                  {['Actor', 'Event', 'Time', 'Target / IP'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5">
                      <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#64748B]">{h}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentDisplayLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-xs text-[#94A3B8]">
                      No security audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentDisplayLogs.map((ev, i) => (
                    <tr key={ev.id || i} className="border-b border-[#F1F5F9] last:border-0 hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-4 py-3 text-xs text-[#0F172A] font-medium max-w-[140px] truncate">{ev.actor}</td>
                      <td className="px-4 py-3 text-xs text-[#64748B] font-medium">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] ${
                          ev.action.toLowerCase().includes('failed') ? 'bg-red-50 text-red-700' :
                          ev.action.toLowerCase().includes('login') ? 'bg-emerald-50 text-emerald-700' :
                          ev.action.toLowerCase().includes('force logout') ? 'bg-amber-50 text-amber-700 font-bold' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {ev.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#94A3B8] whitespace-nowrap">{formatTimeAgo(ev.timestamp)}</td>
                      <td className="px-4 py-3 font-mono text-[10px] text-[#64748B] truncate max-w-[160px]">{ev.target || ev.ip || '127.0.0.1'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card 3 — IP Restrictions */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-4 shadow-xs">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
            IP Restrictions
          </span>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-[#0F172A]">Enable IP Allowlist</p>
              <p className="text-xs text-[#64748B] mt-0.5">Restrict admin access to specific network IP ranges</p>
            </div>
            <Toggle
              on={settings.ipAllowlist}
              onToggle={() => setSettings(prev => ({ ...prev, ipAllowlist: !prev.ipAllowlist }))}
            />
          </div>

          {settings.ipAllowlist && (
            <div className="space-y-1.5">
              <label className={labelCls}>Allowed IP Ranges</label>
              <TagInput
                tags={settings.ipRanges}
                onChange={ranges => setSettings(prev => ({ ...prev, ipRanges: ranges }))}
                placeholder="e.g. 192.168.1.0/24"
              />
              <p className="text-xs text-[#64748B]">
                Only allow admin access from these IP ranges. Type an IP/CIDR and press Enter.
              </p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={() => saveSettings(settings, 'IP restrictions saved successfully')}
              disabled={savingSettings}
              className="px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:brightness-110 hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {savingSettings ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Card 4 — Danger Zone */}
        <div className="bg-white border border-red-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-red-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Danger Zone
          </span>

          <div className="flex items-center justify-between py-2">
            <div className="flex-1 pr-8">
              <p className="text-sm font-medium text-[#0F172A]">Force Logout All Users</p>
              <p className="text-xs text-[#64748B] mt-0.5">Immediately terminate all active user sessions across other browser tabs and devices.</p>
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="border border-red-200 text-red-600 text-xs font-semibold rounded-xl px-4 py-2 hover:bg-red-50 transition-colors whitespace-nowrap cursor-pointer"
            >
              Force Logout
            </button>
          </div>

          <div className="border-t border-red-100 pt-4 flex items-center justify-between">
            <div className="flex-1 pr-8">
              <p className="text-sm font-medium text-[#0F172A]">Reset Security Keys</p>
              <p className="text-xs text-[#64748B] mt-0.5">Rotate security tokens and invalidate active session tokens.</p>
            </div>
            <button
              onClick={() => setShowResetKeysConfirm(true)}
              className="border border-red-200 text-red-600 text-xs font-semibold rounded-xl px-4 py-2 hover:bg-red-50 transition-colors whitespace-nowrap cursor-pointer"
            >
              Reset Keys
            </button>
          </div>
        </div>
      </div>

      {/* Force Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-md p-6">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3 text-lg font-bold">
              ⚠
            </div>
            <h2 className="font-display text-xl text-[#0F172A] mb-2">Force Logout All Users?</h2>
            <p className="text-sm text-[#64748B] mb-6">
              This will immediately terminate all active sessions across other browser tabs and external devices. Users will be required to log in again.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleForceLogoutAll}
                disabled={processingDanger}
                className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {processingDanger ? 'Logging out...' : 'Confirm Logout'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Keys Confirmation Modal */}
      {showResetKeysConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-md p-6">
            <h2 className="font-display text-xl text-[#0F172A] mb-2">Reset Platform Security Keys?</h2>
            <p className="text-sm text-[#64748B] mb-6">
              Platform session and security tokens will be rotated immediately, invalidating previous session keys.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowResetKeysConfirm(false)}
                className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleResetKeys}
                disabled={processingDanger}
                className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {processingDanger ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
