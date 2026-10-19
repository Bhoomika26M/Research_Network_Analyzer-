import { useState, useMemo } from 'react'
import { Users, Mail, UserPlus } from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'
import Modal from '@/components/shared/Modal'

export default function Collaborations() {
  const { researchers, publications, showToast } = useAppContext()

  const [search, setSearch] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteForm, setInviteForm] = useState({ email: '', message: '' })
  const [inviteError, setInviteError] = useState('')

  const [msgTarget, setMsgTarget] = useState<string | null>(null)
  const [msgText, setMsgText] = useState('')

  const filtered = useMemo(() => {
    if (!search) return researchers
    const q = search.toLowerCase()
    return researchers.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.institution.toLowerCase().includes(q) ||
      r.dept.toLowerCase().includes(q)
    )
  }, [researchers, search])

  const sharedPubs = (name: string) =>
    publications.filter(p => p.authors.some(a => a.toLowerCase().includes(name.split(' ')[1]?.toLowerCase() ?? ''))).length

  const handleInvite = () => {
    if (!inviteForm.email.trim()) { setInviteError('Email is required'); return }
    showToast(`Invitation sent to ${inviteForm.email}`)
    setInviteOpen(false)
    setInviteForm({ email: '', message: '' })
    setInviteError('')
  }

  const handleSendMessage = () => {
    if (!msgText.trim()) return
    showToast(`Message sent to ${msgTarget}`)
    setMsgTarget(null)
    setMsgText('')
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Collaborations</h1>
          <p className="text-muted-foreground text-sm">{researchers.length} researchers in network</p>
        </div>
        <button onClick={() => setInviteOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <UserPlus size={16} /> Invite Collaborator
        </button>
      </div>

      <input
        className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground w-full max-w-sm"
        placeholder="Search by name or institution..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users size={48} className="text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground">No collaborators found</p>
          <p className="text-muted-foreground text-sm mt-1">Try adjusting your search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(r => (
            <div key={r.id} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: r.color }}>
                  {r.initials}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm leading-snug truncate">{r.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{r.role}</p>
                </div>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p className="truncate">{r.institution}</p>
                <p className="truncate">{r.dept}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-secondary rounded-lg py-2">
                  <p className="text-lg font-bold text-foreground">{r.hIndex}</p>
                  <p className="text-xs text-muted-foreground">h-Index</p>
                </div>
                <div className="bg-secondary rounded-lg py-2">
                  <p className="text-lg font-bold text-foreground">{sharedPubs(r.name)}</p>
                  <p className="text-xs text-muted-foreground">Shared Pubs</p>
                </div>
              </div>
              <div className="flex gap-2 mt-auto">
                <button className="flex-1 px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-foreground hover:bg-accent transition-colors">View Profile</button>
                <button onClick={() => { setMsgTarget(r.name); setMsgText('') }} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors">
                  <Mail size={12} /> Message
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      <Modal open={inviteOpen} title="Invite Collaborator" onClose={() => setInviteOpen(false)} size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email Address *</label>
            <input
              type="email"
              className={`w-full border rounded-lg px-3 py-2 text-sm bg-background text-foreground ${inviteError ? 'border-red-500' : 'border-border'}`}
              value={inviteForm.email}
              onChange={e => { setInviteForm(f => ({ ...f, email: e.target.value })); setInviteError('') }}
              placeholder="colleague@institution.edu"
            />
            {inviteError && <p className="text-red-500 text-xs mt-1">{inviteError}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Personal Message</label>
            <textarea
              rows={3}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground resize-none"
              value={inviteForm.message}
              onChange={e => setInviteForm(f => ({ ...f, message: e.target.value }))}
              placeholder="I would love to collaborate with you on..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setInviteOpen(false)} className="px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-accent transition-colors">Cancel</button>
            <button onClick={handleInvite} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">Send Invitation</button>
          </div>
        </div>
      </Modal>

      {/* Send Message Modal */}
      <Modal open={!!msgTarget} title={`Message ${msgTarget}`} onClose={() => setMsgTarget(null)} size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Message</label>
            <textarea
              rows={4}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground resize-none"
              value={msgText}
              onChange={e => setMsgText(e.target.value)}
              placeholder="Write your message..."
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setMsgTarget(null)} className="px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-accent transition-colors">Cancel</button>
            <button onClick={handleSendMessage} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">Send</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
