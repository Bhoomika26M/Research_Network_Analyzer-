import { useState, useRef } from 'react';
import { Plus, Search, Upload, ChevronDown, X, Check, RotateCcw, FileText } from 'lucide-react';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { useRole } from '../context/RoleContext';
import { publications as initialPublications, researchers } from '../data/mock';

type SubView = 'list' | 'detail' | 'board';
type PubStatus = 'Draft' | 'Submitted' | 'Published' | 'Archived';

export interface Publication {
  id: number;
  title: string;
  authors: number[];
  type: string;
  venue: string;
  year: number;
  status: PubStatus;
  citations: number;
  doi: string;
  abstract: string;
  keywords: string[];
  pages: string;
}

const types = ['All Types', 'Journal', 'Conference', 'Book', 'Patent', 'Report'];
const statuses = ['All Statuses', 'Draft', 'Submitted', 'Published', 'Archived'];

function authorAvatars(authorIds: number[]) {
  return authorIds.slice(0, 3).map(id => researchers.find(r => r.id === id)?.avatar ?? 'SC');
}

function authorNames(authorIds: number[]) {
  return authorIds.map(id => researchers.find(r => r.id === id)?.name ?? 'Dr. Sarah Chen').join(', ');
}

// ── Publication Edit/View modal ───────────────────────────────────────────────

function PubModal({
  mode,
  initial,
  onClose,
  onSave,
}: {
  mode: 'add' | 'edit' | 'view';
  initial?: Publication;
  onClose: () => void;
  onSave?: (p: Publication) => void;
}) {
  const blank: Publication = {
    id: Date.now(),
    title: '',
    authors: [1],
    type: 'Journal',
    venue: '',
    year: new Date().getFullYear(),
    status: 'Draft',
    citations: 0,
    doi: '',
    abstract: '',
    keywords: [],
    pages: '',
  };

  const [form, setForm] = useState<Publication>(initial ?? blank);
  const [saved, setSaved] = useState(false);
  const [validationError, setValidationError] = useState('');
  const readOnly = mode === 'view';

  function set<K extends keyof Publication>(key: K, val: Publication[K]) {
    setForm(f => ({ ...f, [key]: val }));
    if (validationError) setValidationError('');
  }

  function handleSave() {
    if (!form.title.trim()) {
      setValidationError('Publication title is required.');
      return;
    }
    onSave?.(form);
    setSaved(true);
    setTimeout(onClose, 600);
  }

  return (
    <Modal
      title={mode === 'add' ? 'Add Publication' : mode === 'edit' ? 'Edit Publication' : 'Publication Details'}
      onClose={onClose}
      width={640}
      footer={!readOnly ? (
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {saved ? <><Check size={14} /> Saved!</> : 'Save'}
          </button>
        </>
      ) : <button className="btn-secondary" onClick={onClose}>Close</button>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
        {validationError && (
          <div style={{ padding: '8px 12px', background: '#fdf0ef', border: '1px solid #f8d7da', borderRadius: 6, color: '#C0392B', fontSize: 13, fontWeight: 500 }}>
            {validationError}
          </div>
        )}
        <div>
          <label className="field-label">Title *</label>
          <input
            className="field-input"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            disabled={readOnly}
            placeholder="Enter publication title..."
            style={{ background: readOnly ? '#F5F6F8' : undefined }}
          />
        </div>
        <div>
          <label className="field-label">Abstract</label>
          <textarea
            className="field-input"
            rows={3}
            value={form.abstract}
            onChange={e => set('abstract', e.target.value)}
            disabled={readOnly}
            placeholder="Enter publication abstract..."
            style={{ resize: 'vertical', background: readOnly ? '#F5F6F8' : undefined }}
          />
        </div>
        {readOnly && (
          <div>
            <label className="field-label">Authors</label>
            <input
              className="field-input"
              value={authorNames(form.authors)}
              disabled
              style={{ background: '#F5F6F8' }}
            />
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label className="field-label">Publication Type</label>
            <select
              className="field-input"
              value={form.type}
              onChange={e => set('type', e.target.value)}
              disabled={readOnly}
              style={{ background: readOnly ? '#F5F6F8' : undefined }}
            >
              {['Journal', 'Conference', 'Book', 'Patent', 'Report'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Status</label>
            <select
              className="field-input"
              value={form.status}
              onChange={e => set('status', e.target.value as PubStatus)}
              disabled={readOnly}
              style={{ background: readOnly ? '#F5F6F8' : undefined }}
            >
              {['Draft', 'Submitted', 'Published', 'Archived'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Venue / Journal</label>
            <input
              className="field-input"
              value={form.venue}
              onChange={e => set('venue', e.target.value)}
              disabled={readOnly}
              placeholder="e.g. Nature Machine Intelligence"
              style={{ background: readOnly ? '#F5F6F8' : undefined }}
            />
          </div>
          <div>
            <label className="field-label">Year</label>
            <input
              className="field-input"
              type="number"
              value={form.year}
              onChange={e => set('year', Number(e.target.value))}
              disabled={readOnly}
              style={{ background: readOnly ? '#F5F6F8' : undefined }}
            />
          </div>
          <div>
            <label className="field-label">DOI</label>
            <input
              className="field-input"
              value={form.doi}
              onChange={e => set('doi', e.target.value)}
              disabled={readOnly}
              placeholder="10.1038/s42256-024-0001"
              style={{ background: readOnly ? '#F5F6F8' : undefined }}
            />
          </div>
          <div>
            <label className="field-label">Pages</label>
            <input
              className="field-input"
              value={form.pages}
              onChange={e => set('pages', e.target.value)}
              disabled={readOnly}
              placeholder="e.g. 1–14"
              style={{ background: readOnly ? '#F5F6F8' : undefined }}
            />
          </div>
        </div>
        {readOnly && (
          <div>
            <label className="field-label">Citations</label>
            <input
              className="field-input"
              value={form.citations}
              disabled
              style={{ background: '#F5F6F8', fontWeight: 600, color: '#2B6CB0' }}
            />
          </div>
        )}
        <div>
          <label className="field-label">Keywords (comma-separated)</label>
          <input
            className="field-input"
            value={form.keywords.join(', ')}
            onChange={e => set('keywords', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            disabled={readOnly}
            placeholder="federated learning, privacy, AI"
            style={{ background: readOnly ? '#F5F6F8' : undefined }}
          />
        </div>
      </div>
    </Modal>
  );
}

// ── Reviewer actions ─────────────────────────────────────────────────────────

function ReviewActions({ pub, onApprove, onRequestChanges }: {
  pub: Publication;
  onApprove: () => void;
  onRequestChanges: () => void;
}) {
  const [confirm, setConfirm] = useState<'approve' | 'changes' | null>(null);
  if (pub.status !== 'Submitted') return null;

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {confirm === 'approve' ? (
        <>
          <span style={{ fontSize: 11.5, color: '#5B6472' }}>Approve?</span>
          <button onClick={() => { onApprove(); setConfirm(null); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#1F7A6C', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <Check size={12} /> Yes
          </button>
          <button onClick={() => setConfirm(null)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: 12 }}>Cancel</button>
        </>
      ) : confirm === 'changes' ? (
        <>
          <span style={{ fontSize: 11.5, color: '#5B6472' }}>Request changes?</span>
          <button onClick={() => { onRequestChanges(); setConfirm(null); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#C9822E', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <RotateCcw size={11} /> Yes
          </button>
          <button onClick={() => setConfirm(null)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: 12 }}>Cancel</button>
        </>
      ) : (
        <>
          <button onClick={() => setConfirm('approve')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#e8f5f3', color: '#1F7A6C', border: '1px solid #b2ddd7', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <Check size={12} /> Approve
          </button>
          <button onClick={() => setConfirm('changes')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#fef4e8', color: '#C9822E', border: '1px solid #f5d5a8', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <RotateCcw size={11} /> Request Changes
          </button>
        </>
      )}
    </div>
  );
}

// ── Publication Repository List ───────────────────────────────────────────────

function PublicationList({
  pubs,
  onAddPub,
  onUpdatePub,
  externalSearch,
}: {
  pubs: Publication[];
  onAddPub: (p: Publication) => void;
  onUpdatePub: (id: number, p: Partial<Publication>) => void;
  externalSearch: string;
}) {
  const { role, can } = useRole();
  const isReviewer = role === 'Reviewer';
  const canWrite = can('add', 'publications');

  const [search, setSearch] = useState('');
  const [type, setType] = useState('All Types');
  const [status, setStatus] = useState(isReviewer ? 'Submitted' : 'All Statuses');
  const [modal, setModal] = useState<{ mode: 'add' | 'edit' | 'view'; pub?: Publication } | null>(null);

  const effectiveSearch = externalSearch || search;

  const filtered = pubs.filter(p => {
    if (isReviewer && p.status !== 'Submitted') return false;
    const matchesSearch =
      !effectiveSearch ||
      p.title.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      p.venue.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      p.abstract.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      p.keywords.some(k => k.toLowerCase().includes(effectiveSearch.toLowerCase()));

    const matchesType = type === 'All Types' || p.type === type;
    const matchesStatus = status === 'All Statuses' || p.status === status;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div>
      {isReviewer && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', marginBottom: 16, background: '#f3eeff', border: '1px solid #d8c8f8', borderRadius: 8, fontSize: 13, color: '#6B46C1', fontWeight: 500 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6B46C1', flexShrink: 0 }} />
          Showing only <strong style={{ margin: '0 4px' }}>Submitted</strong> publications. Use Approve or Request Changes to act on each entry.
        </div>
      )}

      {/* Filters & Actions Header */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            className="field-input"
            placeholder="Search publications..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 32, height: 36, fontSize: 13 }}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <select
            className="field-input"
            style={{ height: 36, fontSize: 13, paddingRight: 28, appearance: 'none', minWidth: 140 }}
            value={type}
            onChange={e => setType(e.target.value)}
          >
            {types.map(o => <option key={o}>{o}</option>)}
          </select>
          <ChevronDown size={13} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
        </div>
        {!isReviewer && (
          <div style={{ position: 'relative' }}>
            <select
              className="field-input"
              style={{ height: 36, fontSize: 13, paddingRight: 28, appearance: 'none', minWidth: 140 }}
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              {statuses.map(o => <option key={o}>{o}</option>)}
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
          </div>
        )}
        {canWrite && (
          <button className="btn-primary" style={{ marginLeft: 'auto' }} onClick={() => setModal({ mode: 'add' })}>
            <Plus size={14} /> Add Publication
          </button>
        )}
      </div>

      {/* Publications Table */}
      <div className="card">
        <table className="data-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Authors</th>
              <th>Type</th>
              <th>Venue</th>
              <th>Year</th>
              <th>Status</th>
              <th>Citations</th>
              <th>{isReviewer ? 'Review Actions' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 32, color: '#9CA3AF' }}>
                  {isReviewer ? 'No submissions awaiting review.' : 'No publications match your search or filters.'}
                </td>
              </tr>
            ) : (
              filtered.map(p => (
                <tr key={p.id}>
                  <td style={{ maxWidth: 280 }}>
                    <div style={{ fontWeight: 500, color: '#1B1F27', lineHeight: 1.4 }}>{p.title}</div>
                    {p.doi && <div style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 2 }}>DOI: {p.doi}</div>}
                  </td>
                  <td>
                    <div style={{ display: 'flex' }}>
                      {authorAvatars(p.authors).map((av, i) => (
                        <div
                          key={i}
                          style={{
                            width: 26, height: 26, borderRadius: 6,
                            background: '#16324F', color: '#fff', fontSize: 9,
                            fontWeight: 700, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', marginLeft: i > 0 ? -6 : 0,
                            border: '1.5px solid #fff'
                          }}
                        >
                          {av}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span style={{ padding: '2px 8px', background: '#F5F6F8', borderRadius: 4, fontSize: 12, color: '#5B6472', border: '1px solid #E1E4E8' }}>
                      {p.type}
                    </span>
                  </td>
                  <td style={{ color: '#5B6472', fontSize: 13, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.venue || '—'}
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.year}</td>
                  <td><Badge status={p.status} size="sm" /></td>
                  <td style={{ fontWeight: 700, color: '#2B6CB0' }}>{p.citations}</td>
                  <td>
                    {isReviewer ? (
                      <ReviewActions
                        pub={p}
                        onApprove={() => onUpdatePub(p.id, { status: 'Published' })}
                        onRequestChanges={() => onUpdatePub(p.id, { status: 'Draft' })}
                      />
                    ) : (
                      <div style={{ display: 'flex', gap: 6 }}>
                        {canWrite && (
                          <button
                            className="btn-secondary"
                            style={{ padding: '4px 10px', fontSize: 12 }}
                            onClick={() => setModal({ mode: 'edit', pub: p })}
                          >
                            Edit
                          </button>
                        )}
                        <button
                          className="btn-secondary"
                          style={{ padding: '4px 10px', fontSize: 12 }}
                          onClick={() => setModal({ mode: 'view', pub: p })}
                        >
                          View
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <PubModal
          mode={modal.mode}
          initial={modal.pub}
          onClose={() => setModal(null)}
          onSave={p => {
            if (modal.mode === 'add') onAddPub(p);
            else onUpdatePub(p.id, p);
          }}
        />
      )}
    </div>
  );
}

// ── Publication detail / upload sub-view ─────────────────────────────────────

function PublicationDetail({ onBack }: { onBack: () => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const steps = ['Draft', 'Submitted', 'Published', 'Archived'];
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    setUploadedFiles(prev => [...prev, ...Array.from(files)]);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 18, margin: 0 }}>Publication Detail / Upload</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={onBack}>← Back to List</button>
          <button className="btn-primary">Save Changes</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20, marginBottom: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 15, margin: '0 0 20px' }}>Publication Information</h3>
          <div style={{ marginBottom: 16 }}>
            <label className="field-label">Title</label>
            <input className="field-input" defaultValue="Federated Learning with Differential Privacy for Biomedical Data Sharing" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="field-label">Abstract</label>
            <textarea className="field-input" rows={4} style={{ resize: 'vertical' }} defaultValue="We present a novel framework for privacy-preserving federated learning applied to biomedical datasets across multiple institutions." />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div>
              <label className="field-label">Authors</label>
              <input className="field-input" defaultValue="Dr. Sarah Chen, Prof. James Okafor" />
            </div>
            <div>
              <label className="field-label">Publication Type</label>
              <select className="field-input">
                <option>Journal</option><option>Conference</option><option>Book</option><option>Patent</option><option>Report</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div>
              <label className="field-label">Venue / Journal</label>
              <input className="field-input" defaultValue="Nature Machine Intelligence" />
            </div>
            <div>
              <label className="field-label">DOI</label>
              <input className="field-input" defaultValue="10.1038/s42256-024-0001" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className="field-label">Publish Date</label>
              <input className="field-input" type="date" defaultValue="2024-03-15" />
            </div>
            <div>
              <label className="field-label">Keywords</label>
              <input className="field-input" defaultValue="federated learning, differential privacy, biomedical AI" />
            </div>
          </div>
        </div>

        <div>
          {/* File upload zone */}
          <div className="card" style={{ padding: 22, marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 15, margin: '0 0 16px' }}>File Upload</h3>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc"
              multiple
              style={{ display: 'none' }}
              onChange={e => handleFiles(e.target.files)}
            />
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? '#16324F' : '#E1E4E8'}`,
                borderRadius: 10, padding: '28px 20px', textAlign: 'center',
                background: dragOver ? '#F0F4FF' : '#FAFBFC',
                transition: 'all 0.15s', cursor: 'pointer',
              }}
            >
              <Upload size={28} color={dragOver ? '#16324F' : '#9CA3AF'} style={{ marginBottom: 10 }} />
              <div style={{ fontSize: 14, fontWeight: 500, color: '#5B6472' }}>Drop PDF or DOCX here</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', margin: '6px 0 14px' }}>or click to browse files</div>
              <button
                className="btn-secondary"
                style={{ fontSize: 13 }}
                onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
              >
                Browse Files
              </button>
            </div>

            {uploadedFiles.length > 0 && (
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {uploadedFiles.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#F5F6F8', borderRadius: 8, border: '1px solid #E1E4E8' }}>
                    <FileText size={16} color="#2B6CB0" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#1B1F27', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                      <div style={{ fontSize: 11.5, color: '#9CA3AF' }}>{(f.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <button
                      onClick={() => setUploadedFiles(prev => prev.filter((_, j) => j !== i))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 2, display: 'flex' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status stepper */}
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 15, margin: '0 0 20px' }}>Publication Status</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 12, left: '10%', right: '10%', height: 2, background: '#E1E4E8', zIndex: 0 }} />
              {steps.map((s, i) => (
                <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
                  <div onClick={() => setCurrentStep(i)} style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: i <= currentStep ? '#16324F' : '#E1E4E8',
                    border: `2px solid ${i <= currentStep ? '#16324F' : '#E1E4E8'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 8,
                  }}>
                    {i < currentStep && <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</span>}
                    {i === currentStep && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C9A24B' }} />}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: i === currentStep ? 700 : 500, color: i <= currentStep ? '#16324F' : '#9CA3AF', textAlign: 'center' }}>{s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Kanban board sub-view ───────────────────────────────────────────────────

const colColors: Record<string, { header: string; dot: string; bg: string }> = {
  Draft: { header: '#EBF4FF', dot: '#2B6CB0', bg: '#F8FBFF' },
  Submitted: { header: '#FEF4E8', dot: '#C9822E', bg: '#FFFAF5' },
  Published: { header: '#e8f5f3', dot: '#1F7A6C', bg: '#F7FFFE' },
  Archived: { header: '#F3F4F6', dot: '#9CA3AF', bg: '#FAFBFC' },
};

function BoardAddForm({ col, onAdd, onCancel }: { col: PubStatus; onAdd: (title: string) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('');
  const [venue, setVenue] = useState('');

  return (
    <div style={{ padding: 12, background: '#fff', borderRadius: 8, border: '1px solid #E1E4E8', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <input
        className="field-input"
        placeholder="Publication title..."
        value={title}
        onChange={e => setTitle(e.target.value)}
        style={{ marginBottom: 8, fontSize: 13 }}
        autoFocus
      />
      <input
        className="field-input"
        placeholder="Venue (optional)"
        value={venue}
        onChange={e => setVenue(e.target.value)}
        style={{ marginBottom: 10, fontSize: 13 }}
      />
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          className="btn-primary"
          style={{ flex: 1, justifyContent: 'center', fontSize: 12.5, padding: '6px 10px' }}
          onClick={() => { if (title.trim()) { onAdd(title.trim()); } }}
          disabled={!title.trim()}
        >
          <Plus size={12} /> Add Card
        </button>
        <button className="btn-secondary" style={{ fontSize: 12.5, padding: '6px 10px' }} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function PublicationBoard({
  pubs,
  onAddPub,
}: {
  pubs: Publication[];
  onAddPub: (p: Publication) => void;
}) {
  const columns: PubStatus[] = ['Draft', 'Submitted', 'Published', 'Archived'];
  const [addingCol, setAddingCol] = useState<PubStatus | null>(null);

  function handleAddCard(col: PubStatus, title: string) {
    onAddPub({
      id: Date.now(),
      title,
      authors: [1],
      type: 'Journal',
      venue: '',
      year: new Date().getFullYear(),
      status: col,
      citations: 0,
      doi: '',
      abstract: '',
      keywords: [],
      pages: '',
    });
    setAddingCol(null);
  }

  return (
    <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
      {columns.map(col => {
        const colPubs = pubs.filter(p => p.status === col);
        const c = colColors[col];
        return (
          <div key={col} className="kanban-col" style={{ background: c.bg, border: `1px solid ${c.header}` }}>
            <div className="kanban-col-header" style={{ background: c.header }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.dot }} />
              <span style={{ color: '#1B1F27' }}>{col}</span>
              <span style={{ marginLeft: 'auto', background: '#fff', color: '#5B6472', borderRadius: 99, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{colPubs.length}</span>
            </div>
            <div className="kanban-cards">
              {colPubs.map(p => (
                <div key={p.id} className="card" style={{ padding: 14, cursor: 'grab', borderRadius: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1B1F27', lineHeight: 1.4, marginBottom: 8 }}>{p.title}</div>
                  {p.venue && <div style={{ fontSize: 12, color: '#5B6472', marginBottom: 8 }}>{p.venue}</div>}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex' }}>
                      {authorAvatars(p.authors).map((av, i) => (
                        <div key={i} style={{ width: 22, height: 22, borderRadius: 5, background: '#16324F', color: '#fff', fontSize: 8, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: i > 0 ? -5 : 0, border: '1.5px solid #fff' }}>{av}</div>
                      ))}
                    </div>
                    <span style={{ fontSize: 11, color: '#9CA3AF', background: '#F5F6F8', padding: '2px 7px', borderRadius: 4 }}>
                      {col === 'Published' ? `${p.citations} citations` : `${p.year}`}
                    </span>
                  </div>
                </div>
              ))}

              {addingCol === col ? (
                <BoardAddForm col={col} onAdd={title => handleAddCard(col, title)} onCancel={() => setAddingCol(null)} />
              ) : (
                <button
                  onClick={() => setAddingCol(col)}
                  style={{ border: '2px dashed #E1E4E8', background: 'transparent', borderRadius: 8, padding: '10px', fontSize: 13, color: '#9CA3AF', cursor: 'pointer', width: '100%' }}
                >
                  + Add card
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Publications Screen ──────────────────────────────────────────────────

export default function Publications({ externalSearch = '' }: { externalSearch?: string }) {
  const { role } = useRole();
  const isReviewer = role === 'Reviewer';
  const [sub, setSub] = useState<SubView>('list');

  // React local state for publications list
  const [pubs, setPubs] = useState<Publication[]>(
    initialPublications.map(p => ({ ...p, status: p.status as PubStatus }))
  );

  function addPub(newPub: Publication) {
    setPubs(prev => [newPub, ...prev]);
  }

  function updatePub(id: number, changes: Partial<Publication>) {
    setPubs(prev => prev.map(p => p.id === id ? { ...p, ...changes } : p));
  }

  return (
    <div>
      {!isReviewer && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 2, background: '#F5F6F8', borderRadius: 8, padding: 3, border: '1px solid #E1E4E8' }}>
            {(['list', 'detail', 'board'] as SubView[]).map(v => {
              const labels: Record<SubView, string> = { list: 'Repository', detail: 'Detail / Upload', board: 'Status Board' };
              return (
                <button
                  key={v}
                  onClick={() => setSub(v)}
                  style={{
                    padding: '6px 14px', borderRadius: 6, border: 'none',
                    background: sub === v ? '#16324F' : 'transparent',
                    color: sub === v ? '#fff' : '#5B6472',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {labels[v]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {sub === 'list' && (
        <PublicationList
          pubs={pubs}
          onAddPub={addPub}
          onUpdatePub={updatePub}
          externalSearch={externalSearch}
        />
      )}
      {sub === 'detail' && !isReviewer && <PublicationDetail onBack={() => setSub('list')} />}
      {sub === 'board' && !isReviewer && <PublicationBoard pubs={pubs} onAddPub={addPub} />}
    </div>
  );
}
