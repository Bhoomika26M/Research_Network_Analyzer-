import { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import { authApi } from '../../services/auth'
import type { SessionUser } from '../../types/index'

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`toggle focus:outline-none cursor-pointer ${on ? 'toggle--on' : ''}`}
    >
      <span className="toggle-knob" />
    </button>
  )
}

interface AccountSettingsProps {
  user?: SessionUser
  onLogout?: () => void
  onUserUpdated?: (user: SessionUser) => void
}

export default function AccountSettings({ user, onLogout, onUserUpdated }: AccountSettingsProps) {
  const { showToast } = useToast()

  // Name splitting for First / Last
  const nameParts = (user?.name || 'Dr. Sarah Chen').split(' ')
  const initialFirstName = nameParts[0] || ''
  const initialLastName = nameParts.slice(1).join(' ') || ''

  const [firstName, setFirstName] = useState(initialFirstName)
  const [lastName, setLastName] = useState(initialLastName)
  const [email, setEmail] = useState(user?.email || 's.chen@mit.edu')

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingAccount, setSavingAccount] = useState(false)

  // Notification Preferences
  const notifStorageKey = `scicollab_notifs_${user?.id || 'default'}`
  const [notifs, setNotifs] = useState(() => {
    try {
      const saved = localStorage.getItem(notifStorageKey)
      if (saved) return JSON.parse(saved)
    } catch {
      // ignore
    }
    return {
      emailDigest: true,
      citationAlerts: true,
      collaborationRequests: true,
      conferencePings: false,
      reviewAssignments: true,
      systemUpdates: false,
    }
  })

  // Privacy Preference
  const privacyStorageKey = `scicollab_privacy_${user?.id || 'default'}`
  const [privacy, setPrivacy] = useState(() => {
    try {
      const saved = localStorage.getItem(privacyStorageKey)
      if (saved) return saved
    } catch {
      // ignore
    }
    return 'network'
  })

  // Modals
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isProcessingDanger, setIsProcessingDanger] = useState(false)

  const toggleNotif = (key: keyof typeof notifs) =>
    setNotifs((prev: any) => ({ ...prev, [key]: !prev[key] }))

  // Save Account Profile & Password
  const handleSaveAccountInfo = async () => {
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()
    if (!fullName) {
      showToast('Name cannot be empty', 'error')
      return
    }
    if (!email.trim()) {
      showToast('Email address is required', 'error')
      return
    }

    setSavingAccount(true)
    try {
      let updatedUserObj = user ? { ...user } : null

      // If user provided profile updates
      if (fullName !== user?.name || email !== user?.email) {
        try {
          const resUser = await authApi.updateProfile({
            name: fullName,
            email: email.trim(),
          })
          if (resUser) {
            updatedUserObj = {
              ...(user || {}),
              name: resUser.name,
              email: resUser.email,
              initials: resUser.initials,
            }
          }
        } catch (err: any) {
          // If backend offline or mock mode, still update session user
          updatedUserObj = {
            ...(user || {}),
            name: fullName,
            email: email.trim(),
            initials: fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
          }
        }
      }

      // If password update was requested
      if (newPassword || currentPassword) {
        if (!currentPassword) {
          showToast('Please enter your current password to set a new password', 'error')
          setSavingAccount(false)
          return
        }
        if (newPassword !== confirmPassword) {
          showToast('New passwords do not match', 'error')
          setSavingAccount(false)
          return
        }
        if (newPassword.length < 6) {
          showToast('New password must be at least 6 characters', 'error')
          setSavingAccount(false)
          return
        }

        try {
          await authApi.changePassword({
            current_password: currentPassword,
            new_password: newPassword,
          })
          setCurrentPassword('')
          setNewPassword('')
          setConfirmPassword('')
          showToast('Password changed successfully', 'success')
        } catch (err: any) {
          showToast(err?.response?.data?.detail || 'Incorrect current password', 'error')
          setSavingAccount(false)
          return
        }
      }

      // Save preferences to localStorage
      try {
        localStorage.setItem(notifStorageKey, JSON.stringify(notifs))
        localStorage.setItem(privacyStorageKey, privacy)
      } catch {
        // ignore
      }

      if (updatedUserObj) {
        localStorage.setItem('scicollab_user', JSON.stringify(updatedUserObj))
        onUserUpdated?.(updatedUserObj)
      }

      showToast('Account settings saved successfully', 'success')
    } catch (err: any) {
      showToast(err?.response?.data?.detail || 'Failed to update settings', 'error')
    } finally {
      setSavingAccount(false)
    }
  }

  // Deactivate handler
  const handleConfirmDeactivate = async () => {
    setIsProcessingDanger(true)
    try {
      await authApi.deactivateAccount()
    } catch {
      // ignore network errors for offline demo
    }
    showToast('Your account has been deactivated', 'success')
    setShowDeactivateModal(false)
    setIsProcessingDanger(false)
    if (onLogout) {
      onLogout()
    } else {
      localStorage.removeItem('scicollab_token')
      localStorage.removeItem('scicollab_user')
      window.location.reload()
    }
  }

  // Delete account handler
  const handleConfirmDelete = async () => {
    setIsProcessingDanger(true)
    try {
      await authApi.deleteAccount()
    } catch {
      // ignore network errors for offline demo
    }
    showToast('Your account has been permanently deleted', 'success')
    setShowDeleteModal(false)
    setIsProcessingDanger(false)
    if (onLogout) {
      onLogout()
    } else {
      localStorage.removeItem('scicollab_token')
      localStorage.removeItem('scicollab_user')
      window.location.reload()
    }
  }

  return (
    <div className="p-8 max-w-[760px]">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] mb-3">
          <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">Account Settings</span>
        </span>
        <h1 className="font-display text-3xl text-[#0F172A]">Settings</h1>
        <p className="text-[#64748B] mt-1">Manage your account profile, preferences, and security</p>
      </div>

      <div className="space-y-6">
        {/* Account Info */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-4">
            <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>Account Info &amp; Security
          </span>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1.5">First Name</label>
                <input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1.5">Last Name</label>
                <input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Email Address</label>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors"
              />
            </div>

            <div className="pt-2 border-t border-[#F1F5F9]">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-3">Change Password (optional)</p>
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="New password (min 6 chars)"
                    className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs">
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
                <Toggle on={notifs[row.key]} onToggle={() => toggleNotif(row.key)} />
              </div>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs">
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
          <button
            onClick={handleSaveAccountInfo}
            disabled={savingAccount}
            className="px-6 py-3 rounded-xl gradient-bg text-white text-sm font-semibold hover:brightness-110 hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {savingAccount ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl border border-red-200 p-6 shadow-xs">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-red-500 flex items-center gap-1.5 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>Danger Zone
          </span>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl bg-red-50/40 border border-red-100">
              <div>
                <p className="text-sm font-medium text-[#0F172A]">Deactivate Account</p>
                <p className="text-xs text-[#64748B] mt-0.5">Temporarily disable your account. You can reactivate at any time.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeactivateModal(true)}
                className="px-4 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors cursor-pointer"
              >
                Deactivate
              </button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-red-50/40 border border-red-100">
              <div>
                <p className="text-sm font-medium text-[#0F172A]">Delete Account</p>
                <p className="text-xs text-[#64748B] mt-0.5">Permanently delete your account and all associated data. Irreversible.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Deactivate Account Confirmation Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-md p-6">
            <h2 className="font-display text-xl text-[#0F172A] mb-2">Deactivate Account?</h2>
            <p className="text-sm text-[#64748B] mb-6">
              Your profile and publications will be hidden from searches while your account is deactivated. You will be logged out immediately.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeactivate}
                disabled={isProcessingDanger}
                className="px-4 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isProcessingDanger ? 'Deactivating...' : 'Confirm Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-red-200 shadow-2xl w-full max-w-md p-6">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3 text-lg font-bold">
              ⚠
            </div>
            <h2 className="font-display text-xl text-[#0F172A] mb-2">Permanently Delete Account?</h2>
            <p className="text-sm text-[#64748B] mb-6">
              This action cannot be undone. All your account credentials, collaborations, and profile details will be permanently removed.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isProcessingDanger}
                className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isProcessingDanger ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
