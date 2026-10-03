import { useState } from 'react'
import { useToast } from '../../context/ToastContext'
import { researchersApi } from '../../services/researchers'
import type { SessionUser } from '../../types/index'

interface MyProfileProps {
  role: string
  user?: SessionUser
  onUserUpdated?: (user: SessionUser) => void
}

const defaultSkills = ['Graph Neural Networks', 'Federated Learning', 'Quantum Computing', 'Computer Vision', 'NLP', 'Distributed Systems']
const defaultInterests = ['Scientific Knowledge Graphs', 'AI for Drug Discovery', 'Privacy-Preserving ML', 'Computational Neuroscience']

const roleData: Record<string, { email: string; institution: string; department: string; bio: string }> = {
  researcher: {
    email: 's.chen@mit.edu',
    institution: 'Massachusetts Institute of Technology',
    department: 'Computer Science & Artificial Intelligence Lab (CSAIL)',
    bio: 'Dr. Chen specializes in graph neural networks, federated learning, and quantum-classical hybrid algorithms. Her work on protein interaction prediction using geometric deep learning has been widely cited across computational biology and AI research communities. She leads the Network Intelligence Lab at MIT CSAIL.',
  },
  institution: {
    email: 'admin@mit.edu',
    institution: 'Massachusetts Institute of Technology',
    department: 'Office of Research Administration',
    bio: 'MIT Administration oversees research output, institutional partnerships, and faculty coordination across 12 departments within MIT\'s research ecosystem.',
  },
  reviewer: {
    email: 'j.okafor@cambridge.ac.uk',
    institution: 'University of Cambridge',
    department: 'Department of Computer Science & Technology',
    bio: 'Prof. Okafor is a senior researcher and journal reviewer specializing in distributed computing, graph algorithms, and large-scale data systems. He serves on the programme committee of SC and ICS.',
  },
  admin: {
    email: 'sysadmin@scicollab.io',
    institution: 'SciCollab Platform',
    department: 'Platform Engineering',
    bio: 'System administrator responsible for platform health, user management, security audits, and infrastructure operations across the SciCollab network.',
  },
}

const stats = [
  { label: 'Publications', value: '47' },
  { label: 'Projects', value: '8' },
  { label: 'Conferences', value: '12' },
  { label: 'Collaborators', value: '34' },
]

export default function MyProfile({ role, user, onUserUpdated }: MyProfileProps) {
  const { showToast } = useToast()
  const defaultData = roleData[role] ?? roleData.researcher
  const [activeTab, setActiveTab] = useState<'academic' | 'activity'>('academic')

  // Profile state — real account data from the session, per-role fallback
  // for the offline demo user (which only carries name/email/role).
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || defaultData.email)
  const [institution, setInstitution] = useState(user?.institution || defaultData.institution)
  const [department, setDepartment] = useState(user?.department || defaultData.department)
  const [bio, setBio] = useState(user?.bio || defaultData.bio)
  const [skills, setSkills] = useState<string[]>(user?.skills && user.skills.length > 0 ? user.skills : defaultSkills)
  const [interests, setInterests] = useState<string[]>(user?.interests && user.interests.length > 0 ? user.interests : defaultInterests)
  
  // Edit modal state
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false)
  const [newSkill, setNewSkill] = useState('')

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    // Offline demo session (no account id, backend unreachable): keep the
    // previous local-only behavior.
    const userId = user?.id
    if (!userId) {
      setIsEditingModalOpen(false)
      showToast('Profile updated successfully!', 'success')
      return
    }

    try {
      const updated = await researchersApi.updateResearcher(userId, {
        name,
        email,
        institution,
        department,
        bio,
        skills,
        interests,
      })
      onUserUpdated?.(updated)
      setIsEditingModalOpen(false)
      showToast('Profile updated successfully!', 'success')
    } catch (err: any) {
      if (err?.response?.status === 403) {
        showToast('You do not have permission to edit this profile', 'error')
      } else {
        showToast('Could not save profile — check your connection and try again', 'error')
      }
      // Keep the modal open so the user doesn't lose their edits.
    }
  }

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
    }
  }

  return (
    <div className="p-8 max-w-[1100px]">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] mb-3">
          <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">My Profile</span>
        </span>
        <h1 className="font-display text-3xl text-[#0F172A]">Profile</h1>
        <p className="text-[#64748B] mt-1">Your public researcher profile and account details</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left — profile summary card */}
        <div className="col-span-1">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="h-20 gradient-bg relative">
              <div className="absolute -bottom-9 left-1/2 -translate-x-1/2">
                <div className="relative">
                  <div className="w-[72px] h-[72px] rounded-full gradient-bg border-4 border-white flex items-center justify-center text-white text-2xl font-semibold shadow-md">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <button onClick={() => setIsEditingModalOpen(true)} className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center hover:bg-[#F1F5F9] transition-colors">
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M7.5 1.5L9.5 3.5M1 10l.5-2.5L8 1l2 2-6.5 6.5L1 10z" stroke="#64748B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-12 pb-6 px-5 text-center">
              <h2 className="font-semibold text-[#0F172A] text-base">{name}</h2>
              <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                role === 'researcher' ? 'bg-blue-50 text-blue-700' :
                role === 'institution' ? 'bg-violet-50 text-violet-700' :
                role === 'reviewer' ? 'bg-emerald-50 text-emerald-700' :
                'bg-amber-50 text-amber-700'
              }`}>
                {role === 'researcher' ? 'Researcher' : role === 'institution' ? 'Institution Admin' : role === 'reviewer' ? 'Reviewer' : 'System Admin'}
              </span>
              <p className="text-xs text-[#64748B] mt-2">{email}</p>

              <div className="mt-4 pt-4 border-t border-[#F1F5F9] space-y-2 text-left">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#94A3B8] mb-0.5">Institution</p>
                  <p className="text-xs text-[#0F172A]">{institution}</p>
                </div>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#94A3B8] mb-0.5">Department</p>
                  <p className="text-xs text-[#64748B] leading-relaxed">{department}</p>
                </div>
              </div>

              <button 
                onClick={() => setIsEditingModalOpen(true)} 
                className="mt-5 w-full py-2.5 rounded-xl gradient-bg text-white text-xs font-semibold hover:brightness-110 hover:shadow-md transition-all cursor-pointer"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Right — tabbed content */}
        <div className="col-span-2 space-y-4">
          <div className="flex gap-1 bg-[#F1F5F9] p-1 rounded-xl w-fit">
            {[
              { id: 'academic', label: 'Academic Profile' },
              { id: 'activity', label: 'Activity Summary' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'academic' && (
            <div className="space-y-4">
              {/* Bio */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>Bio
                  </span>
                  <button onClick={() => setIsEditingModalOpen(true)} className="text-xs text-[#0052FF] font-medium hover:underline">
                    Edit Bio
                  </button>
                </div>
                <p className="text-sm text-[#64748B] leading-relaxed">{bio}</p>
              </div>

              {/* Skills */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>Skills & Expertise
                </span>
                <div className="flex flex-wrap gap-2 mb-4">
                  {skills.map(s => (
                    <span key={s} className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100 flex items-center gap-1.5">
                      {s}
                      <button onClick={() => setSkills(skills.filter(sk => sk !== s))} className="hover:text-red-500 font-bold ml-1">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add new skill..."
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    className="px-3 py-1.5 text-xs bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0052FF]"
                  />
                  <button onClick={handleAddSkill} className="px-3 py-1.5 bg-[#0052FF] text-white rounded-xl text-xs font-medium hover:bg-blue-600 transition-colors">
                    Add
                  </button>
                </div>
              </div>

              {/* Research Interests */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>Research Interests
                </span>
                <div className="flex flex-wrap gap-2">
                  {interests.map(i => (
                    <span key={i} className="px-3 py-1.5 rounded-xl bg-[#F1F5F9] text-[#64748B] text-xs font-medium">
                      {i}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {stats.map(s => (
                  <div key={s.label} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 hover:shadow-md transition-all duration-200">
                    <p className="font-display text-3xl text-[#0F172A]">{s.value}</p>
                    <p className="text-sm font-medium text-[#0F172A] mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── EDIT PROFILE MODAL ────────────────────────────────────── */}
      {isEditingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9] mb-4">
              <h3 className="font-display text-xl text-[#0F172A]">Edit Profile Details</h3>
              <button onClick={() => setIsEditingModalOpen(false)} className="text-[#94A3B8] hover:text-[#0F172A] text-lg font-bold">×</button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#0F172A] mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0052FF]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0F172A] mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0052FF]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#0F172A] mb-1">Institution</label>
                  <input
                    type="text"
                    value={institution}
                    onChange={e => setInstitution(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0052FF]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0F172A] mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0052FF]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0F172A] mb-1">Bio</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0052FF] resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setIsEditingModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#64748B] hover:bg-[#F1F5F9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white gradient-bg hover:brightness-110 shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
