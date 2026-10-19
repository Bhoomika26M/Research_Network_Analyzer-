import { useState } from 'react'
import { Pencil, Save, X, Plus } from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'

export default function Profile() {
  const { researchers, updateResearcher, showToast } = useAppContext()
  const profile = researchers[0] // Dr. Sarah Chen

  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: profile?.name ?? '',
    email: profile?.email ?? '',
    institution: profile?.institution ?? '',
    dept: profile?.dept ?? '',
    role: profile?.role ?? '',
    bio: `Principal Investigator specializing in quantum computing, superconducting qubits, and quantum error correction. Leading the QuantumNet distributed computing project at MIT.`,
  })

  const [interests, setInterests] = useState<string[]>(profile?.interests ?? [])
  const [newInterest, setNewInterest] = useState('')

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      if (profile) {
        updateResearcher(profile.id, {
          name: form.name,
          email: form.email,
          institution: form.institution,
          dept: form.dept,
          role: form.role,
          interests,
        })
      }
      setSaving(false)
      setEditMode(false)
      showToast('Profile updated successfully')
    }, 1000)
  }

  const handleAddInterest = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newInterest.trim()) {
      setInterests(prev => [...prev, newInterest.trim()])
      setNewInterest('')
    }
  }

  const handleRemoveInterest = (idx: number) => {
    setInterests(prev => prev.filter((_, i) => i !== idx))
  }

  if (!profile) return <div className="p-6 text-muted-foreground">Profile not found.</div>

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground text-sm">Manage your researcher profile</p>
        </div>
        {!editMode ? (
          <button onClick={() => setEditMode(true)} className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors">
            <Pencil size={15} /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setEditMode(false)} className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors">
              <X size={15} /> Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-70">
              <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Header Card */}
      <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-6 flex-wrap">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0" style={{ background: profile.color }}>
          {profile.initials}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-foreground">{editMode ? form.name : profile.name}</h2>
          <p className="text-muted-foreground text-sm mt-0.5">{editMode ? form.role : profile.role} · {editMode ? form.institution : profile.institution}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-full text-xs font-medium">
              ORCID: {profile.orcid}
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-full text-xs font-medium">
              {profile.status}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Publications', value: profile.publications },
          { label: 'Citations', value: profile.citations.toLocaleString() },
          { label: 'h-Index', value: profile.hIndex },
          { label: 'Collaborators', value: profile.collaborators },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Editable Fields */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <h3 className="font-semibold text-foreground">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { label: 'Full Name', key: 'name' as const },
            { label: 'Email', key: 'email' as const },
            { label: 'Institution', key: 'institution' as const },
            { label: 'Department', key: 'dept' as const },
            { label: 'Role', key: 'role' as const },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{field.label}</label>
              {editMode ? (
                <input
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                  value={form[field.key]}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                />
              ) : (
                <p className="text-sm text-foreground">{form[field.key] || '—'}</p>
              )}
            </div>
          ))}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Bio</label>
            {editMode ? (
              <textarea
                rows={3}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground resize-none"
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              />
            ) : (
              <p className="text-sm text-foreground leading-relaxed">{form.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Research Interests */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-foreground">Research Interests</h3>
        <div className="flex flex-wrap gap-2">
          {interests.map((interest, idx) => (
            <span key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-secondary text-foreground rounded-full text-sm">
              {interest}
              {editMode && (
                <button onClick={() => handleRemoveInterest(idx)} className="text-muted-foreground hover:text-red-500 transition-colors">
                  <X size={13} />
                </button>
              )}
            </span>
          ))}
          {editMode && (
            <div className="flex items-center gap-1.5 border border-dashed border-border rounded-full px-3 py-1">
              <Plus size={13} className="text-muted-foreground" />
              <input
                className="bg-transparent text-sm text-foreground outline-none w-32 placeholder:text-muted-foreground"
                placeholder="Add interest..."
                value={newInterest}
                onChange={e => setNewInterest(e.target.value)}
                onKeyDown={handleAddInterest}
              />
            </div>
          )}
        </div>
        {editMode && <p className="text-xs text-muted-foreground">Press Enter to add a new interest tag.</p>}
      </div>
    </div>
  )
}
