import { useState } from 'react'
import FormModal from '../../components/Modals/FormModal'
import { useToast } from '../../context/ToastContext'
import { hasPermission } from '../../permissions/config'
import { useCreateResearcher } from '../../services/researchers'
import type { SessionUser } from '../../types/index'

type Institution = {
  id: number
  name: string
  short: string
  country: string
  city: string
  address: string
  departments: number
  members: number
  status: string
  admin: string
  adminName: string
  deptList: string[]
}

const initialInstitutions: Institution[] = [
  {
    id: 1,
    name: 'Massachusetts Institute of Technology',
    short: 'MIT',
    country: 'USA',
    city: 'Cambridge, MA',
    address: '77 Massachusetts Ave, Cambridge, MA 02139',
    departments: 12,
    members: 247,
    status: 'Active',
    admin: 'admin@mit.edu',
    adminName: 'Dr. James Foster',
    deptList: ['Computer Science', 'Electrical Engineering', 'Physics', 'Mathematics', 'Biology', 'Chemistry'],
  },
  {
    id: 2,
    name: 'University of Cambridge',
    short: 'Cambridge',
    country: 'UK',
    city: 'Cambridge, UK',
    address: 'The Old Schools, Trinity Ln, Cambridge CB2 1TN',
    departments: 9,
    members: 184,
    status: 'Active',
    admin: 'admin@cam.ac.uk',
    adminName: 'Prof. Sarah Mitchell',
    deptList: ['Mathematics', 'Natural Sciences', 'Computer Science', 'Engineering', 'Physics'],
  },
  {
    id: 3,
    name: 'Stanford University',
    short: 'Stanford',
    country: 'USA',
    city: 'Stanford, CA',
    address: '450 Jane Stanford Way, Stanford, CA 94305',
    departments: 11,
    members: 312,
    status: 'Active',
    admin: 'admin@stanford.edu',
    adminName: 'Dr. Rachel Kim',
    deptList: ['CS', 'EE', 'Statistics', 'Bioengineering', 'Applied Physics'],
  },
  {
    id: 4,
    name: 'ETH Zürich',
    short: 'ETH',
    country: 'CH',
    city: 'Zürich, Switzerland',
    address: 'Rämistrasse 101, 8092 Zürich',
    departments: 8,
    members: 156,
    status: 'Active',
    admin: 'admin@ethz.ch',
    adminName: 'Prof. Klaus Weber',
    deptList: ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Mechanical Engineering'],
  },
  {
    id: 5,
    name: 'University of Tokyo',
    short: 'UTokyo',
    country: 'JP',
    city: 'Tokyo, Japan',
    address: '7-3-1 Hongo, Bunkyo-ku, Tokyo',
    departments: 7,
    members: 198,
    status: 'Review',
    admin: 'admin@u-tokyo.ac.jp',
    adminName: 'Prof. Yuki Tanaka',
    deptList: ['Information Science', 'Physics', 'Chemistry', 'Engineering', 'Mathematics'],
  },
]

const inputCls = 'w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors'

export default function InstitutionPanel({ user }: { user?: SessionUser }) {
  const { showToast } = useToast()
  const createResearcherMutation = useCreateResearcher()
  const [institutions, setInstitutions] = useState(initialInstitutions)
  const [selected, setSelected] = useState<Institution | null>(initialInstitutions[0])
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)

  // Add Institution form state
  const [form, setForm] = useState({
    name: '',
    address: '',
    country: '',
    city: '',
    adminName: '',
    admin: '',
    status: 'Active',
    deptInputs: [''],
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const filtered = institutions.filter(inst =>
    statusFilter === 'all' || inst.status === statusFilter
  )

  const handleAddInstitution = () => {
    const errors: Record<string, string> = {}
    if (!form.name.trim()) errors.name = 'Required'
    if (!form.address.trim()) errors.address = 'Required'
    if (!form.admin.trim()) errors.admin = 'Required'
    else if (!/\S+@\S+\.\S+/.test(form.admin)) errors.admin = 'Invalid email'
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return }

    // Persist the institution by provisioning its admin account in the backend.
    createResearcherMutation.mutate(
      {
        name: form.adminName.trim() || form.name.trim(),
        email: form.admin.trim(),
        role: 'institution',
        institution: form.name.trim(),
        department: form.deptInputs.filter(d => d.trim())[0] || 'General Department',
      },
      {
        onSuccess: (created) => {
          const deptList = form.deptInputs.filter(d => d.trim())
          const newInst: Institution = {
            id: created.id,
            name: form.name.trim(),
            short: form.name.trim().split(' ').map(w => w[0]).join('').slice(0, 4).toUpperCase(),
            country: form.country.trim() || '—',
            city: form.city.trim() || form.country.trim() || '—',
            address: form.address.trim(),
            departments: deptList.length,
            members: 0,
            status: form.status,
            admin: form.admin.trim(),
            adminName: form.adminName.trim() || form.admin.trim(),
            deptList,
          }
          setInstitutions(prev => [newInst, ...prev])
          setSelected(newInst)
          setDrawerOpen(true)
          setEditMode(false)
          showToast(`Institution "${newInst.name}" added`, 'success')
          setShowAddModal(false)
          setForm({ name: '', address: '', country: '', city: '', adminName: '', admin: '', status: 'Active', deptInputs: [''] })
          setFormErrors({})
        },
        onError: (err: any) => {
          showToast(err?.response?.data?.detail || 'Failed to add institution', 'error')
        },
      }
    )
  }

  return (
    <div className="p-8 max-w-[1200px]">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] mb-3">
          <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">01 — User Mgmt / Institution Panel</span>
        </span>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl text-[#0F172A]">Institution Management</h1>
            <p className="text-[#64748B] mt-1">Manage partner institutions, departments, and admin contacts</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-[#F1F5F9] rounded-xl text-xs text-[#64748B] focus:outline-none border-0"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Review">Under Review</option>
              <option value="Inactive">Inactive</option>
            </select>
            {hasPermission(user, 'admin.manageInstitutions') && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:brightness-110 hover:shadow-md transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 2v10M2 7h10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Add Institution
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Institution cards list */}
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-[#E2E8F0]">
              <div className="w-14 h-14 rounded-2xl bg-[#F1F5F9] flex items-center justify-center mb-3 text-2xl">🏛️</div>
              <p className="text-sm font-medium text-[#64748B]">No institutions found for "{statusFilter}"</p>
              <p className="text-xs text-[#94A3B8] mt-1">Try selecting a different status filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filtered.map((inst) => {
                const isSelected = selected?.id === inst.id
                return (
                  <button
                    key={inst.id}
                    onClick={() => { setSelected(inst); setDrawerOpen(true); setEditMode(false) }}
                    className={`w-full text-left p-5 rounded-2xl border-2 bg-white transition-all duration-200 hover:shadow-sm ${
                      isSelected ? 'shadow-md' : 'border-[#E2E8F0] hover:border-[#0052FF]/30'
                    }`}
                    style={isSelected ? { boxShadow: '0 0 0 2px #0052FF, 0 4px 12px rgba(0,82,255,0.08)' } : {}}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                        {inst.short.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-[#0F172A]">{inst.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            inst.status === 'Active' ? 'gradient-bg text-white' :
                            inst.status === 'Review' ? 'bg-amber-50 text-amber-700' :
                            'bg-[#F1F5F9] text-[#64748B]'
                          }`}>{inst.status}</span>
                        </div>
                        <p className="text-xs text-[#64748B] mt-0.5">{inst.city} · {inst.country}</p>
                      </div>
                      <div className="flex gap-4 flex-shrink-0">
                        <div className="text-center">
                          <p className="font-display text-lg text-[#0F172A]">{inst.departments}</p>
                          <p className="text-[10px] text-[#64748B]">Depts</p>
                        </div>
                        <div className="text-center">
                          <p className="font-display text-lg text-[#0F172A]">{inst.members}</p>
                          <p className="text-[10px] text-[#64748B]">Members</p>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Detail / edit panel */}
        {selected && drawerOpen && (
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sticky top-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-base text-[#0F172A]">{selected.short}</h3>
                <div className="flex gap-2">
                  {hasPermission(user, 'admin.manageInstitutions') && (
                    <button
                      onClick={() => setEditMode(!editMode)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${editMode ? 'gradient-bg text-white' : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'}`}
                    >
                      {editMode ? 'Editing' : 'Edit'}
                    </button>
                  )}
                  <button onClick={() => setDrawerOpen(false)} className="w-7 h-7 rounded-lg bg-[#F1F5F9] flex items-center justify-center hover:bg-[#E2E8F0] transition-colors">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 2l6 6M8 2L2 8" stroke="#64748B" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {[
                  { label: 'Full Name', value: selected.name },
                  { label: 'Address', value: selected.address },
                  { label: 'Country', value: `${selected.city} · ${selected.country}` },
                  { label: 'Admin Contact', value: selected.adminName },
                  { label: 'Admin Email', value: selected.admin },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="block text-[10px] font-medium text-[#64748B] font-mono uppercase tracking-wide mb-1">{f.label}</label>
                    {editMode ? (
                      <input defaultValue={f.value} className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-xs focus:outline-none focus:border-[#0052FF] transition-colors" />
                    ) : (
                      <p className="text-xs text-[#0F172A]">{f.value}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t border-[#F1F5F9] pt-3 mb-4">
                <p className="text-[10px] font-medium text-[#64748B] font-mono uppercase tracking-wide mb-2">Departments ({selected.departments})</p>
                <div className="space-y-1">
                  {selected.deptList.map((dept) => (
                    <div key={dept} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#FAFAFA] hover:bg-[#F1F5F9] transition-colors">
                      <span className="text-xs text-[#0F172A]">{dept}</span>
                      {editMode && (
                        <button className="text-[#64748B] hover:text-red-500 transition-colors">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  {editMode && (
                    <button className="w-full py-1.5 rounded-lg border border-dashed border-[#0052FF]/40 text-[10px] text-[#0052FF] font-medium hover:bg-blue-50 transition-colors">
                      + Add Department
                    </button>
                  )}
                </div>
              </div>

              {editMode && (
                <div className="flex gap-2">
                  <button onClick={() => setEditMode(false)} className="flex-1 py-2 rounded-xl border border-[#E2E8F0] text-xs font-medium text-[#64748B] hover:bg-[#F1F5F9] transition-colors">Cancel</button>
                  <button onClick={() => { setEditMode(false); showToast('Changes saved', 'success') }} className="flex-1 py-2 rounded-xl gradient-bg text-white text-xs font-semibold hover:brightness-110 transition-all">Save Changes</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Institution Modal */}
      <FormModal
        open={showAddModal}
        onClose={() => { setShowAddModal(false); setFormErrors({}) }}
        title="Add Institution"
        label="Institution Panel"
        submitLabel="Add Institution"
        onSubmit={handleAddInstitution}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Institution Name <span className="text-red-500">*</span></label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Harvard University"
              className={`${inputCls} ${formErrors.name ? 'border-red-400' : ''}`}
            />
            {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Address <span className="text-red-500">*</span></label>
            <input
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              placeholder="e.g. 1 Oxford Street, Cambridge, MA"
              className={`${inputCls} ${formErrors.address ? 'border-red-400' : ''}`}
            />
            {formErrors.address && <p className="text-xs text-red-500 mt-1">{formErrors.address}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">City</label>
              <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Cambridge, MA" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Country</label>
              <input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="USA" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Admin Contact Name</label>
            <input value={form.adminName} onChange={e => setForm({ ...form, adminName: e.target.value })} placeholder="Dr. Jane Smith" className={inputCls} />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Admin Contact Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              value={form.admin}
              onChange={e => setForm({ ...form, admin: e.target.value })}
              placeholder="admin@university.edu"
              className={`${inputCls} ${formErrors.admin ? 'border-red-400' : ''}`}
            />
            {formErrors.admin && <p className="text-xs text-red-500 mt-1">{formErrors.admin}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inputCls}>
              <option value="Active">Active</option>
              <option value="Review">Under Review</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-[#64748B]">Departments</label>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, deptInputs: [...f.deptInputs, ''] }))}
                className="text-xs text-[#0052FF] font-medium hover:text-[#4D7CFF] transition-colors"
              >
                + Add another
              </button>
            </div>
            <div className="space-y-2">
              {form.deptInputs.map((dept, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={dept}
                    onChange={e => {
                      const next = [...form.deptInputs]
                      next[i] = e.target.value
                      setForm(f => ({ ...f, deptInputs: next }))
                    }}
                    placeholder={`Department ${i + 1}`}
                    className={inputCls}
                  />
                  {form.deptInputs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, deptInputs: f.deptInputs.filter((_, j) => j !== i) }))}
                      className="w-10 h-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center text-[#64748B] hover:bg-red-50 hover:text-red-500 flex-shrink-0 transition-colors"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </FormModal>
    </div>
  )
}
