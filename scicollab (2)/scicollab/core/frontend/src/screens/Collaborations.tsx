import { useState } from 'react';
import { Plus, Users, Check, X } from 'lucide-react';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { useRole } from '../context/RoleContext';
import { researchers, projects as initialProjects } from '../data/mock';

type SubView = 'network' | 'projects' | 'project-detail' | 'institutional';
type Project = typeof initialProjects[0];

// ── Module-level mutable state ────────────────────────────────────────────────
let _projects = [...initialProjects];

type Collab = {
  id: number;
  a: string;
  b: string;
  type: string;
  start: string;
  status: string;
  projects: number;
};

let _collabs: Collab[] = [
  { id: 1, a: 'MIT', b: 'Stanford University', type: 'Joint Research', start: '2022-01', status: 'Active', projects: 3 },
  { id: 2, a: 'UC Berkeley', b: 'University of Chicago', type: 'Data Sharing', start: '2021-06', status: 'Active', projects: 2 },
  { id: 3, a: 'Caltech', b: 'MIT', type: 'Joint Research', start: '2023-03', status: 'Active', projects: 2 },
  { id: 4, a: 'Carnegie Mellon', b: 'Caltech', type: 'Student Exchange', start: '2020-09', status: 'Active', projects: 1 },
  { id: 5, a: 'Stanford University', b: 'Johns Hopkins University', type: 'Clinical Trial', start: '2023-07', status: 'Pending', projects: 1 },
];

// ── Network node positions ────────────────────────────────────────────────────

const nodePositions = [
  { id: 1, x: 300, y: 200, r: 28 },
  { id: 2, x: 480, y: 130, r: 34 },
  { id: 3, x: 560, y: 300, r: 20 },
  { id: 4, x: 180, y: 320, r: 22 },
  { id: 5, x: 380, y: 360, r: 30 },
  { id: 6, x: 140, y: 190, r: 24 },
  { id: 7, x: 460, y: 420, r: 18 },
  { id: 8, x: 620, y: 200, r: 26 },
];

const edges = [
  { a: 1, b: 2, weight: 3 }, { a: 1, b: 5, weight: 2 }, { a: 2, b: 3, weight: 2 },
  { a: 2, b: 8, weight: 4 }, { a: 3, b: 8, weight: 1 }, { a: 4, b: 1, weight: 2 },
  { a: 4, b: 6, weight: 3 }, { a: 5, b: 7, weight: 2 }, { a: 5, b: 2, weight: 1 },
  { a: 6, b: 1, weight: 1 }, { a: 7, b: 3, weight: 1 },
];

// ── Project modal ─────────────────────────────────────────────────────────────

function ProjectModal({
  mode,
  initial,
  onClose,
  onSave,
}: {
  mode: 'add' | 'edit' | 'view';
  initial?: Project;
  onClose: () => void;
  onSave?: (p: Project) => void;
}) {
  const blank: Project = {
    id: Date.now(), name: '', pi: '', institutions: [], funding: '', status: 'Pending', team: 0, start: '', end: '', budget: '',
  };
  const [form, setForm] = useState<Project>(initial ?? blank);
  const [saved, setSaved] = useState(false);
  const readOnly = mode === 'view';

  function set<K extends keyof Project>(key: K, val: Project[K]) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function handleSave() {
    onSave?.(form);
    setSaved(true);
    setTimeout(onClose, 700);
  }

  return (
    <Modal
      title={mode === 'add' ? 'Add Research Project' : mode === 'edit' ? 'Edit Project' : form.name}
      onClose={onClose}
      width={580}
      footer={!readOnly ? (
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {saved ? <><Check size={14} /> Saved!</> : 'Save'}
          </button>
        </>
      ) : <button className="btn-secondary" onClick={onClose}>Close</button>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <label className="field-label">Project Name</label>
          <input className="field-input" value={form.name} onChange={e => set('name', e.target.value)} disabled={readOnly} style={{ background: readOnly ? '#F5F6F8' : undefined }} />
        </div>
        <div>
          <label className="field-label">Principal Investigator</label>
          <input className="field-input" value={form.pi} onChange={e => set('pi', e.target.value)} disabled={readOnly} style={{ background: readOnly ? '#F5F6F8' : undefined }} />
        </div>
        <div>
          <label className="field-label">Funding Source</label>
          <input className="field-input" value={form.funding} onChange={e => set('funding', e.target.value)} disabled={readOnly} style={{ background: readOnly ? '#F5F6F8' : undefined }} />
        </div>
        <div>
          <label className="field-label">Budget</label>
          <input className="field-input" value={form.budget} onChange={e => set('budget', e.target.value)} disabled={readOnly} style={{ background: readOnly ? '#F5F6F8' : undefined }} />
        </div>
        <div>
          <label className="field-label">Status</label>
          <select className="field-input" value={form.status} onChange={e => set('status', e.target.value)} disabled={readOnly} style={{ background: readOnly ? '#F5F6F8' : undefined }}>
            <option>Active</option><option>Pending</option><option>Completed</option>
          </select>
        </div>
        <div>
          <label className="field-label">Start Date</label>
          <input className="field-input" value={form.start} onChange={e => set('start', e.target.value)} disabled={readOnly} style={{ background: readOnly ? '#F5F6F8' : undefined }} />
        </div>
        <div>
          <label className="field-label">End Date</label>
          <input className="field-input" value={form.end} onChange={e => set('end', e.target.value)} disabled={readOnly} style={{ background: readOnly ? '#F5F6F8' : undefined }} />
        </div>
        <div>
          <label className="field-label">Team Size</label>
          <input className="field-input" type="number" value={form.team} onChange={e => set('team', Number(e.target.value))} disabled={readOnly} style={{ background: readOnly ? '#F5F6F8' : undefined }} />
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <label className="field-label">Institutions (comma-separated)</label>
          <input className="field-input" value={form.institutions.join(', ')} onChange={e => set('institutions', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} disabled={readOnly} style={{ background: readOnly ? '#F5F6F8' : undefined }} />
        </div>
      </div>
    </Modal>
  );
}

// ── Collaboration modal ───────────────────────────────────────────────────────

function CollabModal({
  mode,
  initial,
  onClose,
  onSave,
}: {
  mode: 'add' | 'edit' | 'view';
  initial?: Collab;
  onClose: () => void;
  onSave?: (c: Collab) => void;
}) {
  const blank: Collab = { id: Date.now(), a: '', b: '', type: 'Joint Research', start: '', status: 'Active', projects: 0 };
  const [form, setForm] = useState<Collab>(initial ?? blank);
  const [saved, setSaved] = useState(false);
  const readOnly = mode === 'view';

  function set<K extends keyof Collab>(key: K, val: Collab[K]) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function handleSave() {
    onSave?.(form);
    setSaved(true);
    setTimeout(onClose, 700);
  }

  return (
    <Modal
      title={mode === 'add' ? 'Add Collaboration' : mode === 'edit' ? 'Edit Collaboration' : `${form.a} ↔ ${form.b}`}
      onClose={onClose}
      width={500}
      footer={!readOnly ? (
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {saved ? <><Check size={14} /> Saved!</> : 'Save'}
          </button>
        </>
      ) : <button className="btn-secondary" onClick={onClose}>Close</button>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label className="field-label">Institution A</label>
          <input className="field-input" value={form.a} onChange={e => set('a', e.target.value)} disabled={readOnly} style={{ background: readOnly ? '#F5F6F8' : undefined }} />
        </div>
        <div>
          <label className="field-label">Institution B</label>
          <input className="field-input" value={form.b} onChange={e => set('b', e.target.value)} disabled={readOnly} style={{ background: readOnly ? '#F5F6F8' : undefined }} />
        </div>
        <div>
          <label className="field-label">Collaboration Type</label>
          <select className="field-input" value={form.type} onChange={e => set('type', e.target.value)} disabled={readOnly} style={{ background: readOnly ? '#F5F6F8' : undefined }}>
            {['Joint Research', 'Data Sharing', 'Student Exchange', 'Clinical Trial', 'Funding Partnership'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Start Date</label>
          <input className="field-input" value={form.start} onChange={e => set('start', e.target.value)} disabled={readOnly} style={{ background: readOnly ? '#F5F6F8' : undefined }} />
        </div>
        <div>
          <label className="field-label">Status</label>
          <select className="field-input" value={form.status} onChange={e => set('status', e.target.value)} disabled={readOnly} style={{ background: readOnly ? '#F5F6F8' : undefined }}>
            <option>Active</option><option>Pending</option><option>Inactive</option>
          </select>
        </div>
        <div>
          <label className="field-label">Number of Projects</label>
          <input className="field-input" type="number" value={form.projects} onChange={e => set('projects', Number(e.target.value))} disabled={readOnly} style={{ background: readOnly ? '#F5F6F8' : undefined }} />
        </div>
      </div>
    </Modal>
  );
}

// ── Network view ──────────────────────────────────────────────────────────────

function NetworkView() {
  const [selected, setSelected] = useState<number | null>(1);
  const [filterInst, setFilterInst] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterMinPubs, setFilterMinPubs] = useState(1);

  // Applied filter state (only changes when Apply is clicked)
  const [appliedInst, setAppliedInst] = useState('');
  const [appliedDept, setAppliedDept] = useState('');
  const [appliedMinPubs, setAppliedMinPubs] = useState(1);

  function applyFilters() {
    setAppliedInst(filterInst);
    setAppliedDept(filterDept);
    setAppliedMinPubs(filterMinPubs);
    // Reset selection if filtered node disappears
    if (selected !== null) {
      const r = researchers.find(res => res.id === selected);
      if (r && !matchesFilter(r)) setSelected(null);
    }
  }

  function matchesFilter(r: typeof researchers[0]) {
    if (appliedInst && !r.institution.toLowerCase().includes(appliedInst.toLowerCase())) return false;
    if (appliedDept && !r.department.toLowerCase().includes(appliedDept.toLowerCase())) return false;
    if (r.publications < appliedMinPubs) return false;
    return true;
  }

  const visibleIds = new Set(researchers.filter(matchesFilter).map(r => r.id));
  const selectedNode = selected ? researchers.find(r => r.id === selected) : null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 260px', gap: 16 }}>
      {/* Filter panel */}
      <div className="card" style={{ padding: 18 }}>
        <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 13, margin: '0 0 16px', color: '#1B1F27' }}>Filters</h3>
        <div style={{ marginBottom: 14 }}>
          <label className="field-label">Institution</label>
          <input className="field-input" placeholder="e.g. MIT" value={filterInst} onChange={e => setFilterInst(e.target.value)} style={{ fontSize: 12, height: 34 }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="field-label">Department</label>
          <input className="field-input" placeholder="e.g. Physics" value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{ fontSize: 12, height: 34 }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="field-label">Date Range</label>
          <input className="field-input" type="date" style={{ fontSize: 12, height: 34, marginBottom: 6 }} />
          <input className="field-input" type="date" style={{ fontSize: 12, height: 34 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label className="field-label">Min. Shared Pubs</label>
          <input className="field-input" type="number" value={filterMinPubs} min={1} onChange={e => setFilterMinPubs(Number(e.target.value))} style={{ fontSize: 12, height: 34 }} />
        </div>
        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }} onClick={applyFilters}>Apply</button>
        {(appliedInst || appliedDept || appliedMinPubs > 1) && (
          <button
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center', fontSize: 12, marginTop: 8 }}
            onClick={() => { setFilterInst(''); setFilterDept(''); setFilterMinPubs(1); setAppliedInst(''); setAppliedDept(''); setAppliedMinPubs(1); }}
          >
            Clear Filters
          </button>
        )}
        {(appliedInst || appliedDept || appliedMinPubs > 1) && (
          <div style={{ marginTop: 12, padding: '8px 10px', background: '#e8f5f3', borderRadius: 6, fontSize: 11.5, color: '#1F7A6C' }}>
            Showing {visibleIds.size} of {researchers.length} researchers
          </div>
        )}
      </div>

      {/* Network diagram */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, margin: 0 }}>Co-authorship Network</h3>
          <div style={{ fontSize: 12, color: '#9CA3AF' }}>Node size = publication count · Line weight = shared papers</div>
        </div>
        <svg width="100%" height="460" viewBox="0 0 760 460" style={{ display: 'block' }}>
          <defs>
            <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F8FAFF" />
              <stop offset="100%" stopColor="#F5F6F8" />
            </radialGradient>
          </defs>
          <rect width="760" height="460" fill="url(#bgGrad)" />

          {edges.map((e, i) => {
            const a = nodePositions.find(n => n.id === e.a)!;
            const b = nodePositions.find(n => n.id === e.b)!;
            const bothVisible = visibleIds.has(e.a) && visibleIds.has(e.b);
            const isHighlighted = selected === e.a || selected === e.b;
            return (
              <line key={i}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={isHighlighted ? '#C9A24B' : '#D1D5DB'}
                strokeWidth={e.weight * (isHighlighted ? 2 : 1)}
                strokeOpacity={!bothVisible ? 0.1 : isHighlighted ? 0.9 : 0.5}
              />
            );
          })}

          {nodePositions.map(n => {
            const r = researchers.find(res => res.id === n.id)!;
            const isSelected = selected === n.id;
            const isNeighbor = edges.some(e => (e.a === selected && e.b === n.id) || (e.b === selected && e.a === n.id));
            const isVisible = visibleIds.has(n.id);
            return (
              <g key={n.id} onClick={() => isVisible && setSelected(n.id)} style={{ cursor: isVisible ? 'pointer' : 'default' }}>
                <circle
                  cx={n.x} cy={n.y} r={n.r}
                  fill={isSelected ? '#16324F' : isNeighbor ? '#1F7A6C' : '#2B6CB0'}
                  opacity={!isVisible ? 0.1 : (selected && !isSelected && !isNeighbor ? 0.4 : 1)}
                  stroke={isSelected ? '#C9A24B' : '#fff'}
                  strokeWidth={isSelected ? 3 : 2}
                />
                <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle"
                  fill="#fff" fontSize={9} fontWeight="700" fontFamily="Poppins" opacity={isVisible ? 1 : 0.2}>
                  {r.avatar}
                </text>
                <text x={n.x} y={n.y + n.r + 12} textAnchor="middle"
                  fill="#5B6472" fontSize={10} fontWeight="500" fontFamily="Inter" opacity={isVisible ? 1 : 0.2}>
                  {r.name.split(' ').slice(-1)[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Detail panel */}
      <div className="card" style={{ padding: 18 }}>
        {selectedNode ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: '#16324F', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins' }}>{selectedNode.avatar}</div>
              <div>
                <div style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 13, color: '#1B1F27' }}>{selectedNode.name}</div>
                <div style={{ fontSize: 12, color: '#5B6472' }}>{selectedNode.department}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              {[{ label: 'Pubs', val: selectedNode.publications }, { label: 'Collabs', val: selectedNode.collaborators }, { label: 'h-idx', val: selectedNode.hIndex }].map(s => (
                <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: '10px 6px', background: '#F5F6F8', borderRadius: 8 }}>
                  <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 18, color: '#1B1F27' }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#5B6472', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Collaborators</div>
            {edges
              .filter(e => e.a === selected || e.b === selected)
              .map((e, i) => {
                const otherId = e.a === selected ? e.b : e.a;
                const other = researchers.find(r => r.id === otherId)!;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }} onClick={() => setSelected(otherId)}>
                    <div style={{ width: 26, height: 26, borderRadius: 6, background: '#1F7A6C', color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{other.avatar}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: '#1B1F27' }}>{other.name}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF' }}>{e.weight} shared paper{e.weight > 1 ? 's' : ''}</div>
                    </div>
                  </div>
                );
              })}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF', fontSize: 13 }}>
            Click a node to view researcher details
          </div>
        )}
      </div>
    </div>
  );
}

// ── Projects list ─────────────────────────────────────────────────────────────

function ProjectsList({ onDetail }: { onDetail: (p: Project) => void }) {
  const { can } = useRole();
  const [, tick] = useState(0);
  const [modal, setModal] = useState<{ mode: 'add' | 'edit' | 'view'; proj?: Project } | null>(null);

  function rerender() { tick(t => t + 1); }

  return (
    <div>
      {can('add', 'collaborations') && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <button className="btn-primary" onClick={() => setModal({ mode: 'add' })}><Plus size={14} /> Add Project</button>
        </div>
      )}
      <div className="card">
        <table className="data-table" style={{ width: '100%' }}>
          <thead>
            <tr><th>Project Name</th><th>PI</th><th>Institutions</th><th>Funding</th><th>Status</th><th>Team</th><th>Timeline</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {_projects.map(p => (
              <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => onDetail(p)}>
                <td>
                  <div style={{ fontWeight: 600, color: '#1B1F27', maxWidth: 220 }}>{p.name}</div>
                  <div style={{ fontSize: 11.5, color: '#9CA3AF' }}>{p.budget}</div>
                </td>
                <td style={{ color: '#5B6472', fontSize: 13 }}>{p.pi}</td>
                <td><div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>{p.institutions.map((inst, i) => <span key={i} style={{ fontSize: 11.5, color: '#5B6472' }}>{inst}</span>)}</div></td>
                <td><span style={{ padding: '3px 8px', background: '#fdf3dc', color: '#C9822E', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>{p.funding}</span></td>
                <td><Badge status={p.status} size="sm" /></td>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Users size={13} color="#5B6472" /><span style={{ fontWeight: 600 }}>{p.team}</span></div></td>
                <td style={{ color: '#5B6472', fontSize: 12 }}>{p.start} → {p.end}</td>
                <td onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {can('add', 'collaborations') && <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setModal({ mode: 'edit', proj: p })}>Edit</button>}
                    <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setModal({ mode: 'view', proj: p })}>View</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <ProjectModal
          mode={modal.mode}
          initial={modal.proj}
          onClose={() => setModal(null)}
          onSave={p => {
            if (modal.mode === 'add') { _projects = [..._projects, p]; }
            else { _projects = _projects.map(x => x.id === p.id ? p : x); }
            rerender();
          }}
        />
      )}
    </div>
  );
}

// ── Project detail ────────────────────────────────────────────────────────────

function ProjectDetail({ project, onBack }: { project: Project; onBack: () => void }) {
  const [tab, setTab] = useState('Team');
  const teamMembers = [
    { name: 'Dr. Sarah Chen', role: 'PI', notes: 'Leading the ML framework design' },
    { name: 'Prof. James Okafor', role: 'Co-PI', notes: 'Clinical data liaison' },
    { name: 'Dr. Hana Müller', role: 'Researcher', notes: 'fMRI analysis modules' },
    { name: 'Dr. Raj Patel', role: 'Researcher', notes: 'Hardware security integration' },
    { name: 'T. Nguyen (PhD)', role: 'Assistant', notes: 'Data pipeline development' },
  ];

  return (
    <div>
      <div className="card" style={{ padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button className="btn-secondary" style={{ fontSize: 13 }} onClick={onBack}>← Back</button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 18, margin: 0, color: '#1B1F27' }}>{project.name}</h2>
                <Badge status={project.status} />
              </div>
              <div style={{ fontSize: 13, color: '#5B6472', marginTop: 3 }}>PI: {project.pi} · {project.funding} · {project.budget}</div>
            </div>
          </div>
          <button className="btn-primary">Edit Project</button>
        </div>
        <div style={{ display: 'flex', gap: 4, borderTop: '1px solid #F3F4F6', paddingTop: 4 }}>
          {['Overview', 'Team', 'Institutional Collaborators', 'Publications Produced'].map(t => (
            <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
      </div>

      {tab === 'Team' && (
        <div className="card">
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, margin: 0 }}>Team Members ({teamMembers.length})</h3>
            <button className="btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }}>+ Add Member</button>
          </div>
          <table className="data-table" style={{ width: '100%' }}>
            <thead><tr><th>Name</th><th>Role</th><th>Assignment Notes</th><th></th></tr></thead>
            <tbody>
              {teamMembers.map((m, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 7, background: '#16324F', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {m.name.split(' ').map(p => p[0]).join('').slice(0, 2)}
                      </div>
                      <span style={{ fontWeight: 500 }}>{m.name}</span>
                    </div>
                  </td>
                  <td>
                    <select className="field-input" defaultValue={m.role} style={{ fontSize: 12.5, height: 32, width: 130 }}>
                      <option>PI</option><option>Co-PI</option><option>Researcher</option><option>Assistant</option>
                    </select>
                  </td>
                  <td style={{ color: '#5B6472', fontSize: 13 }}>{m.notes}</td>
                  <td><button className="btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab !== 'Team' && (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 15, color: '#1B1F27' }}>{tab}</div>
          <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>Tab content loaded from server.</div>
        </div>
      )}
    </div>
  );
}

// ── Institutional collaborations ──────────────────────────────────────────────

function InstitutionalCollaborations() {
  const { can } = useRole();
  const [, tick] = useState(0);
  const [modal, setModal] = useState<{ mode: 'add' | 'edit' | 'view'; collab?: Collab } | null>(null);

  function rerender() { tick(t => t + 1); }

  return (
    <div>
      {can('add', 'collaborations') && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <button className="btn-primary" onClick={() => setModal({ mode: 'add' })}><Plus size={14} /> Add Collaboration</button>
        </div>
      )}
      <div className="card">
        <table className="data-table" style={{ width: '100%' }}>
          <thead>
            <tr><th>Institution A</th><th>Institution B</th><th>Type</th><th>Start Date</th><th>Status</th><th>Projects</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {_collabs.map((c) => (
              <tr key={c.id}>
                <td style={{ fontWeight: 500 }}>{c.a}</td>
                <td style={{ fontWeight: 500 }}>{c.b}</td>
                <td><span style={{ padding: '3px 8px', background: '#F5F6F8', borderRadius: 4, fontSize: 12, color: '#5B6472' }}>{c.type}</span></td>
                <td style={{ color: '#5B6472' }}>{c.start}</td>
                <td><Badge status={c.status} size="sm" /></td>
                <td style={{ fontWeight: 700 }}>{c.projects}</td>
                <td>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {can('add', 'collaborations') && <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setModal({ mode: 'edit', collab: c })}>Edit</button>}
                    <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setModal({ mode: 'view', collab: c })}>View</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <CollabModal
          mode={modal.mode}
          initial={modal.collab}
          onClose={() => setModal(null)}
          onSave={c => {
            if (modal.mode === 'add') { _collabs = [..._collabs, c]; }
            else { _collabs = _collabs.map(x => x.id === c.id ? c : x); }
            rerender();
          }}
        />
      )}
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function Collaborations() {
  const [sub, setSub] = useState<SubView>('network');
  const [detailProject, setDetailProject] = useState<Project | null>(null);

  return (
    <div>
      <div style={{ display: 'flex', gap: 2, background: '#F5F6F8', borderRadius: 8, padding: 3, border: '1px solid #E1E4E8', marginBottom: 20, alignSelf: 'flex-start', width: 'fit-content' }}>
        {[
          { id: 'network', label: 'Co-author Network' },
          { id: 'projects', label: 'Research Projects' },
          { id: 'institutional', label: 'Institutional' },
        ].map(v => (
          <button key={v.id} onClick={() => setSub(v.id as SubView)} style={{
            padding: '6px 14px', borderRadius: 6, border: 'none',
            background: sub === v.id ? '#16324F' : 'transparent',
            color: sub === v.id ? '#fff' : '#5B6472',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>{v.label}</button>
        ))}
      </div>

      {sub === 'network' && <NetworkView />}
      {sub === 'projects' && !detailProject && (
        <ProjectsList onDetail={p => { setDetailProject(p); setSub('project-detail'); }} />
      )}
      {sub === 'project-detail' && detailProject && (
        <ProjectDetail project={detailProject} onBack={() => { setDetailProject(null); setSub('projects'); }} />
      )}
      {sub === 'institutional' && <InstitutionalCollaborations />}
    </div>
  );
}
