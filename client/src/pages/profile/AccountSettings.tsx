import { useState } from 'react'

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`toggle focus:outline-none ${on ? 'toggle--on' : ''}`}
    >
      <span className="toggle-knob" />
    </button>
  )
}

export default function AccountSettings() {
  const [notifs, setNotifs] = useState({
    emailDigest: true,
    citationAlerts: true,
    collaborationRequests: true,
    conferencePings: false,
    reviewAssignments: true,
    systemUpdates: false,
  })
  const [privacy, setPrivacy] = useState('network')

  const toggle = (key: keyof typeof notifs) =>
    setNotifs(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="p-8 max-w-[720px]">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] mb-3">
          <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">Account Settings</span>
        </span>
        <h1 className="font-display text-3xl text-[#0F172A]">Settings</h1>
        <p className="text-[#64748B] mt-1">Manage your account preferences and security</p>
      </div>

      <div className="space-y-5">
        {/* Account Info */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-4">
            <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>Account Info
          </span>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1.5">First Name</label>
                <input defaultValue="Sarah" className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1.5">Last Name</label>
                <input defaultValue="Chen" className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Email Address</label>
              <input defaultValue="s.chen@mit.edu" type="email" className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Current Password</label>
              <input type="password" placeholder="Enter current password" className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1.5">New Password</label>
                <input type="password" placeholder="New password" className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1.5">Confirm New Password</label>
                <input type="password" placeholder="Confirm password" className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors" />
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-4">
            <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>Notification Preferences
          </span>
          <div className="space-y-3">
            {([
              { key: 'emailDigest', label: 'Weekly Email Digest', desc: 'Summary of your activity and network updates' },
              { key: 'citationAlerts', label: 'Citation Alerts', desc: 'Notify when your publications are cited' },
              { key: 'collaborationRequests', label: 'Collaboration Requests', desc: 'New incoming collaboration invitations' },
              { key: 'conferencePings', label: 'Conference Reminders', desc: 'Upcoming conference deadlines and schedules' },
              { key: 'reviewAssignments', label: 'Review Assignments', desc: 'Notify when assigned a new paper to review' },
              { key: 'systemUpdates', label: 'System Updates', desc: 'Platform feature announcements and maintenance' },
            ] as const).map(row => (
              <div key={row.key} className="flex items-center justify-between py-2.5 border-b border-[#F1F5F9] last:border-0">
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">{row.label}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">{row.desc}</p>
                </div>
                <Toggle on={notifs[row.key]} onToggle={() => toggle(row.key)} />
              </div>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-4">
            <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>Privacy
          </span>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Profile Visibility</label>
            <select
              value={privacy}
              onChange={e => setPrivacy(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors"
            >
              <option value="public">Public — visible to anyone</option>
              <option value="network">Network — visible to your collaborators</option>
              <option value="institution">Institution — visible to your institution only</option>
              <option value="private">Private — visible to you only</option>
            </select>
            <p className="text-xs text-[#64748B] mt-2">Controls who can view your profile, publications, and research interests in public searches.</p>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button className="px-6 py-3 rounded-xl gradient-bg text-white text-sm font-semibold hover:brightness-110 hover:shadow-md transition-all">
            Save Changes
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl border border-red-100 p-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-red-400 flex items-center gap-1.5 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>Danger Zone
          </span>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl bg-red-50/50 border border-red-100">
              <div>
                <p className="text-sm font-medium text-[#0F172A]">Deactivate Account</p>
                <p className="text-xs text-[#64748B] mt-0.5">Temporarily disable your account. You can reactivate at any time.</p>
              </div>
              <button className="px-4 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors">
                Deactivate
              </button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-red-50/50 border border-red-100">
              <div>
                <p className="text-sm font-medium text-[#0F172A]">Delete Account</p>
                <p className="text-xs text-[#64748B] mt-0.5">Permanently delete your account and all associated data. Irreversible.</p>
              </div>
              <button className="px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
