import { useState } from 'react'
import FormModal, { inputCls } from '../../components/Modals/FormModal'
import { useToast } from '../../context/ToastContext'
import { hasPermission } from '../../permissions/config'
import { useResearchers, useUpdateResearcher, useCreateResearcher, useDeleteResearcher } from '../../services/researchers'
import type { SessionUser } from '../../types/index'

interface User {
  id: number
  name: string
  email: string
  role: string
  institution: string
  status: string
  joined: string
}

interface Institution {
  id: number
  name: string
  short: string
  users: number
  country: string
  city: string
  address: string
  adminName: string
  admin: string
  status: string
  deptList: string[]
}

const initialUsers: User[] = [
  { id: 1, name: 'Dr. Sarah Chen', email: 's.chen@mit.edu', role: 'Researcher', institution: 'MIT', status: 'Active', joined: 'Jan 2022' },
  { id: 2, name: 'Prof. James Okafor', email: 'j.okafor@cambridge.ac.uk', role: 'Researcher', institution: 'Cambridge', status: 'Active', joined: 'Mar 2022' },
  { id: 3, name: 'Dr. Priya Sharma', email: 'p.sharma@iit.ac.in', role: 'Reviewer', institution: 'IIT Bombay', status: 'Active', joined: 'Jun 2022' },
  { id: 4, name: 'Admin Stanford', email: 'admin@stanford.edu', role: 'Institution Admin', institution: 'Stanford', status: 'Active', joined: 'Jan 2021' },
  { id: 5, name: 'Dr. Yuki Tanaka', email: 'y.tanaka@u-tokyo.ac.jp', role: 'Researcher', institution: 'U. Tokyo', status: 'Inactive', joined: 'Sep 2023' },
  { id: 6, name: 'Dr. Emma Torres', email: 'e.torres@oxford.ac.uk', role: 'Researcher', institution: 'Oxford', status: 'Active', joined: 'Feb 2023' },
  { id: 7, name: 'Dr. Amir Khan', email: 'a.khan@ethz.ch', role: 'Researcher', institution: 'ETH Zürich', status: 'Pending', joined: 'Nov 2024' },
  { id: 8, name: 'System Root', email: 'sysadmin@scicollab.io', role: 'System Admin', institution: 'SciCollab', status: 'Active', joined: 'Jan 2020' },
]

const initialInstitutions: Institution[] = [
  {
    id: 1, name: 'Massachusetts Institute of Technology', short: 'MIT', users: 47, country: 'USA', city: 'Cambridge, MA',
    address: '77 Massachusetts Ave, Cambridge, MA 02139', adminName: 'Dr. James Foster', admin: 'admin@mit.edu',
    status: 'Active', deptList: ['Computer Science', 'Electrical Engineering', 'Physics', 'Mathematics', 'Biology', 'Chemistry'],
  },
  {
    id: 2, name: 'University of Cambridge', short: 'Cambridge', users: 38, country: 'UK', city: 'Cambridge, UK',
    address: 'The Old Schools, Trinity Ln, Cambridge CB2 1TN', adminName: 'Prof. Sarah Mitchell', admin: 'admin@cam.ac.uk',
    status: 'Active', deptList: ['Mathematics', 'Natural Sciences', 'Computer Science', 'Engineering', 'Physics'],
  },
  {
    id: 3, name: 'Stanford University', short: 'Stanford', users: 55, country: 'USA', city: 'Stanford, CA',
    address: '450 Jane Stanford Way, Stanford, CA 94305', adminName: 'Dr. Rachel Kim', admin: 'admin@stanford.edu',
    status: 'Active', deptList: ['CS', 'EE', 'Statistics', 'Bioengineering', 'Applied Physics'],
  },
  {
    id: 4, name: 'ETH Zürich', short: 'ETH', users: 29, country: 'CH', city: 'Zürich, Switzerland',
    address: 'Rämistrasse 101, 8092 Zürich', adminName: 'Prof. Klaus Weber', admin: 'admin@ethz.ch',
    status: 'Active', deptList: ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Mechanical Engineering'],
  },
  {
    id: 5, name: 'University of Tokyo', short: 'U. Tokyo', users: 33, country: 'JP', city: 'Tokyo, Japan',
    address: '7-3-1 Hongo, Bunkyo-ku, Tokyo', adminName: 'Prof. Yuki Tanaka', admin: 'admin@u-tokyo.ac.jp',
    status: 'Review', deptList: ['Information Science', 'Physics', 'Chemistry', 'Engineering', 'Mathematics'],
  },
]

const roleColors: Record<string, string> = {
  'Researcher': 'bg-blue-50 text-blue-700',
  'Reviewer': 'bg-violet-50 text-violet-700',
  'Institution Admin': 'bg-amber-50 text-amber-700',
  'System Admin': 'bg-red-50 text-red-700',
}

const ROLES = ['Researcher', 'Institution Admin', 'Reviewer', 'System Admin']

export default function UserManagement({ user: currentUser }: { user?: SessionUser }) {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState('users')

  const { data: apiResearchers } = useResearchers()
  const updateResearcherMutation = useUpdateResearcher()
  const createResearcherMutation = useCreateResearcher()
  const deleteResearcherMutation = useDeleteResearcher()

  const [institutions, setInstitutions] = useState<Institution[]>(initialInstitutions)
  const [deletedUserIds, setDeletedUserIds] = useState<number[]>([])
  const [localOverrides, setLocalOverrides] = useState<Record<number, User>>({})
  const [userToRemove, setUserToRemove] = useState<User | null>(null)

  const canManageUsers = hasPermission(currentUser, 'admin.manageUsers') || currentUser?.role === 'admin'
  const canAssignRoles = hasPermission(currentUser, 'admin.assignRoles') || currentUser?.role === 'admin'
  const canManageInstitutions = hasPermission(currentUser, 'admin.manageInstitutions') || currentUser?.role === 'admin'

  const apiUsers: User[] = apiResearchers && apiResearchers.length > 0
    ? apiResearchers.map(r => ({
        id: r.id,
        name: r.name,
        email: r.email || `${r.initials?.toLowerCase() || 'usr'}@institution.edu`,
        role: r.role ? (r.role.charAt(0).toUpperCase() + r.role.slice(1)) : 'Researcher',
        institution: r.institution || 'Scientific Network',
        status: (r as any).is_active || 'Active',
        joined: '2024',
      }))
    : initialUsers

  const users: User[] = apiUsers
    .filter(u => !deletedUserIds.includes(u.id))
    .map(u => localOverrides[u.id] || u)

  // Filters
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  // Edit User modal
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState<Omit<User, 'id' | 'joined'>>({ name: '', email: '', role: '', institution: '', status: '' })
  const [confirmRemove, setConfirmRemove] = useState(false)

  // Manage Institution panel
  const [managingInst, setManagingInst] = useState<Institution | null>(null)
  const [instEditMode, setInstEditMode] = useState(false)

  // Invite User modal
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('Researcher')
  const [inviteInstitution, setInviteInstitution] = useState('')

  // Add Institution modal
  const [addInstOpen, setAddInstOpen] = useState(false)
  const [instForm, setInstForm] = useState({ name: '', country: '', city: '', address: '', adminName: '', adminEmail: '' })

  // --- Derived filtered list ---
  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase()
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.institution.toLowerCase().includes(q)
    const matchRole = roleFilter === 'all' || u.role.toLowerCase() === roleFilter.toLowerCase()
    return matchSearch && matchRole
  })

  // --- Handlers ---
  const openEdit = (target: User) => {
    setEditingUser(target)
    setEditForm({ name: target.name, email: target.email, role: target.role, institution: target.institution, status: target.status })
    setConfirmRemove(false)
  }

  const handleSaveUser = () => {
    if (!editForm.name.trim() || !editForm.email.trim()) {
      showToast('Name and email are required', 'error')
      return
    }
    if (editingUser) {
      const id = editingUser.id
      const updatedUser: User = {
        ...editingUser,
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
        institution: editForm.institution,
        status: editForm.status,
      }
      setLocalOverrides(prev => ({ ...prev, [id]: updatedUser }))
      updateResearcherMutation.mutate(
        {
          id,
          data: {
            name: editForm.name,
            email: editForm.email,
            role: editForm.role.toLowerCase(),
            institution: editForm.institution,
            is_active: editForm.status,
          }
        },
        {
          onSuccess: () => {
            showToast(`${editForm.name} updated successfully`, 'success')
            setEditingUser(null)
          },
          onError: (err: any) => {
            showToast(err?.response?.data?.detail || 'Failed to update user', 'error')
          },
        }
      )
    } else {
      setEditingUser(null)
    }
  }

  const handleRemoveUser = (target: User) => {
    setDeletedUserIds(prev => [...prev, target.id])
    deleteResearcherMutation.mutate(target.id, {
      onSuccess: () => {
        showToast(`${target.name} removed from platform`, 'success')
        setUserToRemove(null)
        setEditingUser(null)
        setConfirmRemove(false)
      },
      onError: (err: any) => {
        setDeletedUserIds(prev => prev.filter(id => id !== target.id))
        showToast(err?.response?.data?.detail || 'Failed to remove user', 'error')
        setUserToRemove(null)
        setConfirmRemove(false)
      },
    })
  }

  const handleInvite = () => {
    if (!inviteEmail.trim()) { showToast('Email is required', 'error'); return }
    createResearcherMutation.mutate(
      {
        name: inviteEmail.split('@')[0].replace(/[._-]/g, ' '),
        email: inviteEmail,
        role: inviteRole.toLowerCase(),
        institution: inviteInstitution || 'Scientific Network',
      },
      {
        onSuccess: () => {
          setInviteOpen(false); setInviteEmail(''); setInviteRole('Researcher'); setInviteInstitution('')
          showToast(`Invitation sent to ${inviteEmail}`, 'success')
        },
        onError: (err: any) => {
          showToast(err?.response?.data?.detail || 'Failed to send invitation', 'error')
        },
      }
    )
  }

  const handleAddInstitution = () => {
    if (!instForm.name.trim()) { showToast('Institution name is required', 'error'); return }
    if (instForm.adminEmail) {
      // Persist the institution by provisioning its admin account in the backend.
      createResearcherMutation.mutate(
        {
          name: instForm.adminName || 'Institution Admin',
          email: instForm.adminEmail,
          role: 'institution',
          institution: instForm.name,
        },
        {
          onSuccess: () => {
            setAddInstOpen(false)
            setInstForm({ name: '', country: '', city: '', address: '', adminName: '', adminEmail: '' })
            showToast(`Institution "${instForm.name}" added`, 'success')
          },
          onError: (err: any) => {
            showToast(err?.response?.data?.detail || 'Failed to add institution', 'error')
          },
        }
      )
      return
    }
    const newInst: Institution = {
      id: Date.now(), name: instForm.name,
      short: instForm.name.split(' ').map(w => w[0]).join('').slice(0, 4).toUpperCase(),
      users: 0, country: instForm.country || '—', city: instForm.city || '—',
      address: instForm.address || '—', adminName: instForm.adminName || '—',
      admin: instForm.adminEmail || '—', status: 'Active', deptList: [],
    }
    setInstitutions(prev => [newInst, ...prev])
    setAddInstOpen(false)
    setInstForm({ name: '', country: '', city: '', address: '', adminName: '', adminEmail: '' })
    showToast(`Institution "${instForm.name}" added`, 'success')
  }

  return (
    <div className="p-8 max-w-[1200px]">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] mb-3">
          <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">01 — User Mgmt</span>
        </span>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl text-[#0F172A]">User Management</h1>
            <p className="text-[#64748B] mt-1">Manage users, roles, and institutional accounts</p>
          </div>
          <div className="flex gap-2">
            {activeTab === 'institutions' && canManageInstitutions && (
              <button onClick={() => setAddInstOpen(true)} className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[#64748B] text-sm font-semibold hover:bg-[#F1F5F9] transition-all">
                + Add Institution
              </button>
            )}
            {canManageUsers && (
              <button onClick={() => setInviteOpen(true)} className="px-4 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:brightness-110 hover:shadow-md transition-all">
                + Invite User
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#F1F5F9] p-1 rounded-xl w-fit">
        {['users', 'institutions', 'roles'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'}`}
          >
            {tab === 'users' ? 'All Users' : tab === 'institutions' ? 'Institutions' : 'Role Matrix'}
          </button>
        ))}
      </div>

      {/* ── All Users tab ── */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0]">
          {/* Toolbar */}
          <div className="p-5 border-b border-[#E2E8F0] flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.3"/>
                <line x1="8.5" y1="8.5" x2="12" y2="12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-8 pr-3 py-2 bg-[#F1F5F9] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#0052FF]"
              />
            </div>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-[#F1F5F9] rounded-lg text-sm text-[#64748B] focus:outline-none border-0"
            >
              <option value="all">All roles</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#F1F5F9] flex items-center justify-center mb-3 text-2xl">👤</div>
              <p className="text-sm font-medium text-[#64748B]">No users found</p>
              <p className="text-xs text-[#94A3B8] mt-1">Try adjusting your search or filter</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F1F5F9]">
                  {['User', 'Role', 'Institution', 'Status', 'Joined'].map(col => (
                    <th key={col} className="text-left px-5 py-3 text-xs font-medium text-[#64748B] font-mono uppercase tracking-wide">{col}</th>
                  ))}
                  <th className="text-right px-5 py-3 text-xs font-medium text-[#64748B] font-mono uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(rowUser => (
                  <tr key={rowUser.id} className="border-b border-[#F1F5F9] last:border-0 hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-semibold">
                          {rowUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#0F172A]">{rowUser.name}</p>
                          <p className="text-xs text-[#64748B]">{rowUser.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[rowUser.role] ?? 'bg-[#F1F5F9] text-[#64748B]'}`}>
                        {rowUser.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#64748B]">{rowUser.institution}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        rowUser.status === 'Active' ? 'bg-emerald-50 text-emerald-700' :
                        rowUser.status === 'Invited' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        rowUser.status === 'Pending' ? 'bg-amber-50 text-amber-700' :
                        'bg-[#F1F5F9] text-[#64748B]'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          rowUser.status === 'Active' ? 'bg-emerald-500' :
                          rowUser.status === 'Invited' || rowUser.status === 'Pending' ? 'bg-amber-500' : 'bg-slate-400'
                        }`}></span>
                        {rowUser.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#64748B]">{rowUser.joined}</td>
                    <td className="px-5 py-4 text-right">
                      {canManageUsers && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(rowUser)}
                            className="px-2.5 py-1 text-xs font-semibold text-[#0052FF] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          {rowUser.id !== currentUser?.id ? (
                            <button
                              onClick={() => setUserToRemove(rowUser)}
                              className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                              Remove
                            </button>
                          ) : (
                            <span className="text-[10px] font-mono text-[#94A3B8] px-2 py-0.5 bg-[#F1F5F9] rounded-md">You</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Institutions tab ── */}
      {activeTab === 'institutions' && (
        <div className="flex gap-6">
          <div className="flex-1 bg-white rounded-2xl border border-[#E2E8F0]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F1F5F9]">
                  {['Institution', 'Country', 'Users', 'Status', ''].map(col => (
                    <th key={col} className="text-left px-5 py-3 text-xs font-medium text-[#64748B] font-mono uppercase tracking-wide">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {institutions.map(inst => {
                  const isActive = managingInst?.id === inst.id
                  return (
                    <tr key={inst.id} className={`border-b border-[#F1F5F9] last:border-0 hover:bg-[#FAFAFA] transition-colors ${isActive ? 'bg-blue-50/30' : ''}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white text-sm font-bold">
                            {inst.short.slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#0F172A]">{inst.name}</p>
                            <p className="text-xs text-[#64748B]">{inst.short}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#64748B]">{inst.country}</td>
                      <td className="px-5 py-4 text-sm text-[#0F172A] font-medium">{inst.users}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${inst.status === 'Active' ? 'gradient-bg text-white' : 'bg-amber-50 text-amber-700'}`}>
                          {inst.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => { setManagingInst(inst); setInstEditMode(false) }}
                          className={`text-xs font-medium transition-colors ${isActive ? 'text-[#4D7CFF]' : 'text-[#0052FF] hover:text-[#4D7CFF]'}`}
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Institution detail panel */}
          {managingInst && (
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sticky top-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-base text-[#0F172A]">{managingInst.short}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setInstEditMode(m => !m)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${instEditMode ? 'gradient-bg text-white' : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'}`}
                    >
                      {instEditMode ? 'Editing' : 'Edit'}
                    </button>
                    <button onClick={() => setManagingInst(null)} className="w-7 h-7 rounded-lg bg-[#F1F5F9] flex items-center justify-center hover:bg-[#E2E8F0] transition-colors">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 2l6 6M8 2L2 8" stroke="#64748B" strokeWidth="1.4" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {[
                    { label: 'Full Name', value: managingInst.name },
                    { label: 'Address', value: managingInst.address },
                    { label: 'Country', value: `${managingInst.city} · ${managingInst.country}` },
                    { label: 'Admin Contact', value: managingInst.adminName },
                    { label: 'Admin Email', value: managingInst.admin },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-[10px] font-medium text-[#64748B] font-mono uppercase tracking-wide mb-1">{f.label}</label>
                      {instEditMode
                        ? <input defaultValue={f.value} className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-xs focus:outline-none focus:border-[#0052FF] transition-colors" />
                        : <p className="text-xs text-[#0F172A]">{f.value}</p>
                      }
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#F1F5F9] pt-3 mb-4">
                  <p className="text-[10px] font-medium text-[#64748B] font-mono uppercase tracking-wide mb-2">
                    Departments ({managingInst.deptList.length})
                  </p>
                  <div className="space-y-1">
                    {managingInst.deptList.map(dept => (
                      <div key={dept} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#FAFAFA] hover:bg-[#F1F5F9] transition-colors">
                        <span className="text-xs text-[#0F172A]">{dept}</span>
                        {instEditMode && (
                          <button className="text-[#64748B] hover:text-red-500 transition-colors">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    {instEditMode && (
                      <button className="w-full py-1.5 rounded-lg border border-dashed border-[#0052FF]/40 text-[10px] text-[#0052FF] font-medium hover:bg-blue-50 transition-colors">
                        + Add Department
                      </button>
                    )}
                  </div>
                </div>

                {instEditMode && (
                  <div className="flex gap-2">
                    <button onClick={() => setInstEditMode(false)} className="flex-1 py-2 rounded-xl border border-[#E2E8F0] text-xs font-medium text-[#64748B] hover:bg-[#F1F5F9] transition-colors">Cancel</button>
                    <button onClick={() => { setInstEditMode(false); showToast('Changes saved', 'success') }} className="flex-1 py-2 rounded-xl gradient-bg text-white text-xs font-semibold hover:brightness-110 transition-all">Save</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Role Matrix tab ── */}
      {activeTab === 'roles' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <h3 className="font-display text-lg text-[#0F172A] mb-4">Role Permission Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  <th className="text-left pb-3 pr-8 text-xs font-mono uppercase tracking-wide text-[#64748B]">Permission</th>
                  {['Researcher', 'Reviewer', 'Inst. Admin', 'Sys. Admin'].map(role => (
                    <th key={role} className="pb-3 pr-6 text-xs font-mono uppercase tracking-wide text-[#64748B] text-center">{role}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['View own publications', true, true, true, true],
                  ['Submit publications', true, false, true, true],
                  ['Review publications', false, true, false, true],
                  ['Manage researchers', false, false, true, true],
                  ['View institution reports', false, false, true, true],
                  ['Manage all users', false, false, false, true],
                  ['Access audit logs', false, false, false, true],
                  ['System configuration', false, false, false, true],
                ].map(([label, ...perms], i) => (
                  <tr key={i} className="border-b border-[#F1F5F9] last:border-0">
                    <td className="py-3 pr-8 text-[#64748B]">{label as string}</td>
                    {(perms as boolean[]).map((has, j) => (
                      <td key={j} className="py-3 pr-6 text-center">
                        {has ? (
                          <span className="inline-flex w-5 h-5 rounded-full gradient-bg items-center justify-center mx-auto">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                        ) : (
                          <span className="inline-flex w-5 h-5 rounded-full bg-[#F1F5F9] items-center justify-center mx-auto">
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                              <line x1="2" y1="2" x2="6" y2="6" stroke="#94A3B8" strokeWidth="1.4" strokeLinecap="round"/>
                              <line x1="6" y1="2" x2="2" y2="6" stroke="#94A3B8" strokeWidth="1.4" strokeLinecap="round"/>
                            </svg>
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Edit User Modal ── */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-lg p-6 animate-modal-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] mb-2">
                  <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">User Management</span>
                </span>
                <h2 className="font-display text-xl text-[#0F172A]">Edit User</h2>
              </div>
              <button onClick={() => setEditingUser(null)} className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center hover:bg-[#E2E8F0] transition-colors">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 2l8 8M10 2l-8 8" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Full Name <span className="text-red-500">*</span></label>
                  <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Email <span className="text-red-500">*</span></label>
                  <input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {canAssignRoles && (
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] mb-1.5">Role</label>
                    <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))} className={inputCls}>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Status</label>
                  <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} className={inputCls}>
                    {['Active', 'Pending', 'Inactive', 'Invited'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1.5">Institution</label>
                <input value={editForm.institution} onChange={e => setEditForm(f => ({ ...f, institution: e.target.value }))} className={inputCls} />
              </div>
            </div>

            {/* Remove confirmation */}
            {confirmRemove ? (
              <div className="mt-5 p-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-sm font-medium text-red-700 mb-3">Remove {editingUser.name} from the platform?</p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmRemove(false)} className="flex-1 py-2 rounded-lg border border-[#E2E8F0] text-xs text-[#64748B] hover:bg-white transition-colors cursor-pointer">Cancel</button>
                  <button onClick={() => handleRemoveUser(editingUser)} className="flex-1 py-2 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors cursor-pointer">Yes, Remove</button>
                </div>
              </div>
            ) : (
              <div className="mt-5 pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
                {editingUser.id !== currentUser?.id ? (
                  <button onClick={() => setConfirmRemove(true)} className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors cursor-pointer">
                    Remove User
                  </button>
                ) : (
                  <span className="text-xs text-[#94A3B8]">Current Account</span>
                )}
                <div className="flex gap-3">
                  <button onClick={() => setEditingUser(null)} className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F1F5F9] transition-colors cursor-pointer">Cancel</button>
                  <button onClick={handleSaveUser} className="px-4 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:brightness-110 hover:shadow-md transition-all cursor-pointer">Save Changes</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Direct Remove User Modal ── */}
      {userToRemove && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-red-200 shadow-2xl w-full max-w-md p-6">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3 text-lg font-bold">
              ✕
            </div>
            <h2 className="font-display text-xl text-[#0F172A] mb-2">Remove User?</h2>
            <p className="text-sm text-[#64748B] mb-6">
              Are you sure you want to remove <strong className="text-[#0F172A]">{userToRemove.name}</strong> ({userToRemove.email}) from the platform? This will deactivate their account.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setUserToRemove(null)}
                className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveUser(userToRemove)}
                className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors cursor-pointer"
              >
                Yes, Remove User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Invite User Modal ── */}
      <FormModal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite User" label="User Management" onSubmit={handleInvite} submitLabel="Send Invitation">
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Email Address <span className="text-red-500">*</span></label>
          <input className={inputCls} type="email" placeholder="user@institution.edu" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
        </div>
        {canAssignRoles && (
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Role</label>
            <select className={inputCls} value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Institution</label>
          <input className={inputCls} placeholder="e.g. MIT" value={inviteInstitution} onChange={e => setInviteInstitution(e.target.value)} />
        </div>
      </FormModal>

      {/* ── Add Institution Modal ── */}
      <FormModal open={addInstOpen} onClose={() => setAddInstOpen(false)} title="Add Institution" label="User Management" onSubmit={handleAddInstitution} submitLabel="Add Institution">
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Institution Name <span className="text-red-500">*</span></label>
          <input className={inputCls} placeholder="e.g. University of Example" value={instForm.name} onChange={e => setInstForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Country</label>
            <input className={inputCls} placeholder="e.g. USA" value={instForm.country} onChange={e => setInstForm(f => ({ ...f, country: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">City</label>
            <input className={inputCls} placeholder="e.g. Cambridge, MA" value={instForm.city} onChange={e => setInstForm(f => ({ ...f, city: e.target.value }))} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Admin Contact Name</label>
          <input className={inputCls} placeholder="Dr. Jane Smith" value={instForm.adminName} onChange={e => setInstForm(f => ({ ...f, adminName: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Admin Contact Email</label>
          <input className={inputCls} type="email" placeholder="admin@institution.edu" value={instForm.adminEmail} onChange={e => setInstForm(f => ({ ...f, adminEmail: e.target.value }))} />
        </div>
      </FormModal>
    </div>
  )
}
