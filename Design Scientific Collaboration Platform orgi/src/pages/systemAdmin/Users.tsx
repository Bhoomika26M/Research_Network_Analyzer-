import { useState, useMemo } from 'react'
import { Search, Plus, Edit2, Trash2, Eye } from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'
import Modal from '@/components/shared/Modal'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Pagination from '@/components/shared/Pagination'
import ExportButtons from '@/components/shared/ExportButtons'
import type { User } from '@/data/mockData'

const PAGE_SIZE = 10

function roleBadge(role: string) {
  const map: Record<string, string> = {
    Researcher: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    'Institution Admin': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    Reviewer: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    'System Admin': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  }
  return map[role] ?? 'bg-secondary text-foreground'
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    Active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    Inactive: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  }
  return map[status] ?? 'bg-secondary text-foreground'
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = ['#2563EB', '#7C3AED', '#14B8A6', '#F59E0B', '#EF4444', '#10B981']

const EMPTY: Omit<User, 'id'> = {
  name: '', email: '', role: 'Researcher', institution: '', status: 'Active', lastLogin: '', joinDate: new Date().toISOString().slice(0, 10), permissions: [],
}

export default function AdminUsers() {
  const { users, addUser, updateUser, deleteUser, showToast } = useAppContext()

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<string[]>([])

  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [viewTarget, setViewTarget] = useState<User | null>(null)
  const [form, setForm] = useState<Omit<User, 'id'>>(EMPTY)

  const filtered = useMemo(() => {
    let data = users
    if (search) data = data.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    if (roleFilter !== 'All') data = data.filter(u => u.role === roleFilter)
    if (statusFilter !== 'All') data = data.filter(u => u.status === statusFilter)
    return data
  }, [users, search, roleFilter, statusFilter])

  const paginated = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page])

  const allSelected = paginated.length > 0 && paginated.every(u => selected.includes(u.id))
  const toggleAll = () => setSelected(allSelected ? [] : paginated.map(u => u.id))
  const toggleOne = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const handleBulk = (status: 'Active' | 'Inactive') => {
    selected.forEach(id => updateUser(id, { status }))
    showToast(`${selected.length} users set to ${status}`, 'success')
    setSelected([])
  }

  const openAdd = () => { setForm(EMPTY); setAddOpen(true) }
  const openEdit = (u: User) => { setEditTarget(u); setForm({ name: u.name, email: u.email, role: u.role, institution: u.institution, status: u.status, lastLogin: u.lastLogin, joinDate: u.joinDate, permissions: u.permissions }) }

  const handleSave = () => {
    if (!form.name || !form.email || !form.role) { showToast('Name, email and role are required', 'error'); return }
    if (editTarget) {
      updateUser(editTarget.id, form)
      showToast('User updated', 'success')
      setEditTarget(null)
    } else {
      addUser(form)
      showToast('User added', 'success')
      setAddOpen(false)
    }
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteUser(deleteTarget)
    showToast('User deleted', 'success')
    setDeleteTarget(null)
  }

  const exportData = filtered.map(u => ({
    Name: u.name, Email: u.email, Role: u.role, Institution: u.institution, Status: u.status, 'Last Login': u.lastLogin,
  }))

  const FormFields = () => (
    <div className="space-y-4">
      {[
        { label: 'Full Name', field: 'name', required: true, placeholder: 'Full name' },
        { label: 'Email', field: 'email', required: true, placeholder: 'user@example.com' },
        { label: 'Institution', field: 'institution', placeholder: 'Institution name' },
      ].map(({ label, field, required, placeholder }) => (
        <div key={field}>
          <label className="block text-sm font-medium text-foreground mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
          <input value={(form as Record<string, unknown>)[field] as string} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} placeholder={placeholder} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#F59E0B]" />
        </div>
      ))}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Role <span className="text-red-500">*</span></label>
          <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as User['role'] }))} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none">
            {['Researcher', 'Institution Admin', 'Reviewer', 'System Admin'].map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Status</label>
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as User['status'] }))} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none">
            <option>Active</option><option>Inactive</option><option>Pending</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button onClick={() => { setAddOpen(false); setEditTarget(null) }} className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-accent transition-colors">Cancel</button>
        <button onClick={handleSave} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#F59E0B' }}>{editTarget ? 'Save Changes' : 'Add User'}</button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage platform users</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButtons data={exportData} columns={['Name', 'Email', 'Role', 'Institution', 'Status', 'Last Login']} filename="users" title="Users" />
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#F59E0B' }}>
            <Plus size={15} /> Add User
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search users..." className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#F59E0B]" />
        </div>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }} className="px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none">
          {['All', 'Researcher', 'Institution Admin', 'Reviewer', 'System Admin'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none">
          {['All', 'Active', 'Inactive', 'Pending'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <span className="text-sm font-medium text-amber-800 dark:text-amber-200">{selected.length} users selected</span>
          <button onClick={() => handleBulk('Active')} className="px-3 py-1 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">Set Active</button>
          <button onClick={() => handleBulk('Inactive')} className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-600 text-white hover:bg-gray-700 transition-colors">Set Inactive</button>
          <button onClick={() => setSelected([])} className="ml-auto text-xs text-muted-foreground hover:text-foreground">Clear</button>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/50">
              <tr>
                <th className="px-4 py-3">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded" />
                </th>
                {['Name', 'Email', 'Role', 'Institution', 'Status', 'Last Login', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No users found</td></tr>
              ) : paginated.map((u, i) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.includes(u.id)} onChange={() => toggleOne(u.id)} className="rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                        {initials(u.name)}
                      </div>
                      <span className="font-medium text-foreground">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleBadge(u.role)}`}>{u.role}</span></td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[140px]"><p className="truncate">{u.institution}</p></td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(u.status)}`}>{u.status}</span></td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewTarget(u)} className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" title="View Details"><Eye size={13} /></button>
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" title="Edit"><Edit2 size={13} /></button>
                      <button onClick={() => setDeleteTarget(u.id)} className="p-1.5 rounded-lg border border-border text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border">
          <Pagination page={page} total={filtered.length} perPage={PAGE_SIZE} onChange={setPage} />
        </div>
      </div>

      <Modal open={addOpen} title="Add User" onClose={() => setAddOpen(false)}><FormFields /></Modal>
      <Modal open={!!editTarget} title="Edit User" onClose={() => setEditTarget(null)}><FormFields /></Modal>
      <ConfirmDialog open={!!deleteTarget} title="Delete User" message="Are you sure you want to delete this user? This action cannot be undone." confirmLabel="Delete" danger onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />

      {/* View User Detail Modal */}
      <Modal open={!!viewTarget} title="User Details" onClose={() => setViewTarget(null)}>
        {viewTarget && (
          <div className="space-y-2">
            {[
              ['Full Name', viewTarget.name],
              ['Email', viewTarget.email],
              ['Role', viewTarget.role],
              ['Institution', viewTarget.institution || '—'],
              ['Status', viewTarget.status],
              ['Join Date', viewTarget.joinDate ? new Date(viewTarget.joinDate).toLocaleDateString() : '—'],
              ['Last Login', viewTarget.lastLogin ? new Date(viewTarget.lastLogin).toLocaleDateString() : 'Never'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-sm font-medium text-foreground">{value}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}
