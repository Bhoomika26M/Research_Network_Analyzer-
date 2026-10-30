import { useState } from 'react';
import { Plus, Search, ExternalLink, X, Link, Check } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { useRole } from '../context/RoleContext';
import { citations, publications } from '../data/mock';

type SubView = 'records' | 'references' | 'doi' | 'linking';

const citationTrend = [
  { year: '2019', count: 8 }, { year: '2020', count: 14 }, { year: '2021', count: 23 },
  { year: '2022', count: 31 }, { year: '2023', count: 28 }, { year: '2024', count: 23 },
];

// ── Initial reference data (mutable module state) ─────────────────────────────
let _refs = [
  { num: 1, text: 'McMahan, B. et al. (2017). Communication-efficient learning of deep networks from decentralized data. AISTATS.', doi: '10.1234/aistats.2017.0001', linked: true },
  { num: 2, text: 'Dwork, C., Roth, A. (2014). The algorithmic foundations of differential privacy. Foundations and Trends in TCS.', doi: '10.1561/0400000042', linked: true },
  { num: 3, text: 'Li, T. et al. (2020). Federated learning: Challenges, methods, and future directions. IEEE Signal Processing Magazine.', doi: '10.1109/MSP.2020.2975749', linked: false },
  { num: 4, text: 'Rieke, N. et al. (2020). The future of digital health with federated learning. npj Digital Medicine.', doi: '10.1038/s41746-020-00323-1', linked: true },
  { num: 5, text: 'Abadi, M. et al. (2016). Deep learning with differential privacy. CCS 2016.', doi: '10.1145/2976749.2978318', linked: false },
];

// ── Citation Records ──────────────────────────────────────────────────────────

function CitationRecords() {
  return (
    <div>
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 16, margin: '0 0 6px', color: '#1B1F27' }}>
                Federated Learning with Differential Privacy for Biomedical Data Sharing
              </h2>
              <div style={{ fontSize: 13, color: '#5B6472' }}>Nature Machine Intelligence · 2024 · DOI: 10.1038/s42256-024-0001</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 36, color: '#16324F', lineHeight: 1 }}>127</div>
              <div style={{ fontSize: 12, color: '#5B6472' }}>Total citations</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '12px 16px 8px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5B6472', marginBottom: 8, padding: '0 8px' }}>Citations over time</div>
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={citationTrend}>
              <defs>
                <linearGradient id="citGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A24B" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#C9A24B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Area type="monotone" dataKey="count" stroke="#C9A24B" strokeWidth={2} fill="url(#citGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', gap: 10 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input className="field-input" placeholder="Search citing works…" style={{ paddingLeft: 32, height: 36, fontSize: 13 }} />
          </div>
        </div>
        <table className="data-table" style={{ width: '100%' }}>
          <thead><tr><th>Citing Work</th><th>Authors</th><th>Year</th><th>Venue</th><th>DOI</th></tr></thead>
          <tbody>
            {citations.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 500, maxWidth: 280 }}>{c.title}</td>
                <td style={{ color: '#5B6472', fontSize: 13 }}>{c.authors}</td>
                <td style={{ fontWeight: 600 }}>{c.year}</td>
                <td style={{ color: '#5B6472', fontSize: 13 }}>{c.venue}</td>
                <td>
                  <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#2B6CB0', fontSize: 12, textDecoration: 'none', fontWeight: 500 }}>
                    <ExternalLink size={12} /> DOI
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── References ────────────────────────────────────────────────────────────────

function References({ readOnly }: { readOnly?: boolean }) {
  const [refs, setRefs] = useState(_refs);
  const [showModal, setShowModal] = useState(false);
  const [newText, setNewText] = useState('');
  const [newDoi, setNewDoi] = useState('');

  function addRef() {
    if (!newText.trim()) return;
    const newRef = { num: refs.length + 1, text: newText.trim(), doi: newDoi.trim(), linked: false };
    const updated = [...refs, newRef];
    setRefs(updated);
    _refs = updated;
    setNewText('');
    setNewDoi('');
    setShowModal(false);
  }

  return (
    <div>
      <div className="card">
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, margin: 0 }}>References ({refs.length})</h3>
          {!readOnly && (
            <button className="btn-primary" style={{ fontSize: 13 }} onClick={() => setShowModal(true)}>
              <Plus size={14} /> Add Reference
            </button>
          )}
        </div>
        <div style={{ padding: '8px 0' }}>
          {refs.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 20px', borderBottom: i < refs.length - 1 ? '1px solid #F9FAFB' : 'none', alignItems: 'flex-start' }}>
              <div style={{ width: 26, height: 26, borderRadius: 6, background: '#F5F6F8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#5B6472', flexShrink: 0 }}>{r.num}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, color: '#1B1F27', lineHeight: 1.6, marginBottom: 6 }}>{r.text}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <a href="#" style={{ fontSize: 12, color: '#2B6CB0', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ExternalLink size={11} /> {r.doi || 'No DOI'}
                  </a>
                  <Badge status={r.linked ? 'Linked' : 'Unlinked'} size="sm" />
                </div>
              </div>
              {!readOnly && (
                <button onClick={() => { const updated = refs.filter((_, j) => j !== i).map((ref, j) => ({ ...ref, num: j + 1 })); setRefs(updated); _refs = updated; }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 2 }}>
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <Modal
          title="Add Reference"
          onClose={() => setShowModal(false)}
          width={520}
          footer={
            <>
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={addRef} disabled={!newText.trim()}>Add Reference</button>
            </>
          }
        >
          <div style={{ marginBottom: 14 }}>
            <label className="field-label">Search Existing Publications</label>
            <input className="field-input" placeholder="Search by title or DOI…" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#E1E4E8' }} />
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>or enter manually</span>
            <div style={{ flex: 1, height: 1, background: '#E1E4E8' }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="field-label">Citation Text</label>
            <textarea className="field-input" rows={3} placeholder="Author, A. (Year). Title. Journal." value={newText} onChange={e => setNewText(e.target.value)} />
          </div>
          <div style={{ marginBottom: 4 }}>
            <label className="field-label">DOI</label>
            <input className="field-input" placeholder="10.xxxx/xxxxx" value={newDoi} onChange={e => setNewDoi(e.target.value)} />
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── DOI Management ────────────────────────────────────────────────────────────

function DOIManagement({ readOnly }: { readOnly?: boolean }) {
  const [search, setSearch] = useState('');
  const [resolvedResult, setResolvedResult] = useState<{ title: string; authors: string; doi: string } | null>(null);
  const [resolving, setResolving] = useState(false);
  const [missingDOI, setMissingDOI] = useState(
    publications.filter(p => !p.doi).slice(0, 4).map(p => ({ ...p, resolved: false }))
  );
  const [linkedIds, setLinkedIds] = useState<Set<number>>(new Set());

  function handleResolve() {
    if (!search.trim()) return;
    setResolving(true);
    setTimeout(() => {
      setResolvedResult({
        title: 'Federated Learning with Differential Privacy for Biomedical Data Sharing',
        authors: 'Chen, S., Okafor, J.',
        doi: search.includes('10.') ? search : '10.1038/s42256-024-0001',
      });
      setResolving(false);
    }, 600);
  }

  function handleAssignDOI(id: number) {
    setMissingDOI(prev => prev.map(p => p.id === id ? { ...p, resolved: true } : p));
    setTimeout(() => {
      setMissingDOI(prev => prev.filter(p => p.id !== id));
    }, 1000);
  }

  function handleLink(id: number) {
    setLinkedIds(prev => new Set([...prev, id]));
  }

  return (
    <div>
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 15, margin: '0 0 16px' }}>Resolve DOI / Title</h3>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            className="field-input"
            placeholder="Paste a DOI (e.g., 10.1038/s42256-024-0001) or publication title…"
            value={search}
            onChange={e => { setSearch(e.target.value); setResolvedResult(null); }}
            style={{ flex: 1 }}
            onKeyDown={e => e.key === 'Enter' && !readOnly && handleResolve()}
          />
          {!readOnly && (
            <button className="btn-primary" onClick={handleResolve} disabled={resolving || !search.trim()}>
              {resolving ? 'Resolving…' : 'Resolve'}
            </button>
          )}
        </div>

        {resolvedResult && (
          <div style={{ marginTop: 16, padding: 16, background: '#F5F6F8', borderRadius: 10, border: '1px solid #E1E4E8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#1B1F27', marginBottom: 6 }}>{resolvedResult.title}</div>
                <div style={{ fontSize: 13, color: '#5B6472' }}>{resolvedResult.authors} · Nature Machine Intelligence · 2024</div>
                <div style={{ fontSize: 12.5, color: '#2B6CB0', marginTop: 4 }}>DOI: {resolvedResult.doi}</div>
              </div>
              {!readOnly && (
                <button
                  className="btn-primary"
                  style={{ fontSize: 13, flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                  onClick={() => { handleLink(999); setResolvedResult(prev => prev ? { ...prev, doi: prev.doi } : null); }}
                >
                  {linkedIds.has(999) ? <><Check size={13} /> Linked!</> : <><Link size={13} /> Link to Publication</>}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6' }}>
          <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, margin: 0 }}>
            Publications Missing DOI ({missingDOI.length})
          </h3>
        </div>
        {missingDOI.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#1F7A6C', fontWeight: 500, fontSize: 13 }}>
            <Check size={20} style={{ display: 'block', margin: '0 auto 8px', color: '#1F7A6C' }} />
            All publications have been assigned a DOI.
          </div>
        ) : (
          <table className="data-table" style={{ width: '100%' }}>
            <thead><tr><th>Title</th><th>Type</th><th>Year</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {missingDOI.map(p => (
                <tr key={p.id} style={{ opacity: p.resolved ? 0.4 : 1, transition: 'opacity 0.3s' }}>
                  <td style={{ fontWeight: 500, maxWidth: 300 }}>{p.title}</td>
                  <td><span style={{ padding: '2px 8px', background: '#F5F6F8', borderRadius: 4, fontSize: 12, color: '#5B6472' }}>{p.type}</span></td>
                  <td>{p.year}</td>
                  <td><Badge status={p.status} size="sm" /></td>
                  <td>
                    {!readOnly && (
                      p.resolved
                        ? <span style={{ fontSize: 12, color: '#1F7A6C', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Check size={12} /> Assigned</span>
                        : <button className="btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => handleAssignDOI(p.id)}>Assign DOI</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Publication Linking ───────────────────────────────────────────────────────

function PublicationLinking({ readOnly }: { readOnly?: boolean }) {
  const [selectedPub] = useState(publications[0]);
  const [linked, setLinked] = useState<typeof publications>([publications[2], publications[4]]);
  const [search, setSearch] = useState('');

  const available = publications.filter(p => p.id !== selectedPub.id && !linked.find(l => l.id === p.id));
  const filtered = available.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  const relationTypes = ['Extends', 'Related to', 'Replies to', 'Cites'];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      {/* Selected publication + linked list */}
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, margin: '0 0 14px' }}>Selected Publication</h3>
        <div style={{ padding: 14, background: '#F5F6F8', borderRadius: 10, marginBottom: 18 }}>
          <div style={{ fontWeight: 600, fontSize: 13.5, color: '#1B1F27', marginBottom: 6 }}>{selectedPub.title}</div>
          <div style={{ fontSize: 12.5, color: '#5B6472' }}>{selectedPub.venue} · {selectedPub.year}</div>
        </div>

        <div style={{ fontSize: 12, fontWeight: 600, color: '#5B6472', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
          Linked Publications ({linked.length})
        </div>

        {linked.length === 0 && (
          <div style={{ padding: '16px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
            No linked publications yet. Use the panel on the right to link.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {linked.map((p) => (
            <div key={p.id} style={{ display: 'flex', gap: 8, padding: 10, background: '#F9FAFB', borderRadius: 8, border: '1px solid #E1E4E8', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: '#1B1F27', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 5, alignItems: 'center' }}>
                  <select style={{ fontSize: 11, padding: '2px 6px', border: '1px solid #E1E4E8', borderRadius: 4, background: '#fff', color: '#5B6472', cursor: 'pointer' }} disabled={readOnly}>
                    {relationTypes.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              {!readOnly && (
                <button onClick={() => setLinked(l => l.filter(x => x.id !== p.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 2 }}>
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Searchable list to link from */}
      <div className="card">
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #F3F4F6' }}>
          <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, margin: '0 0 10px' }}>
            {readOnly ? 'Linked Publications' : 'Link a Publication'}
          </h3>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input className="field-input" placeholder="Search publications to link…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32, height: 36, fontSize: 13 }} />
          </div>
        </div>
        <div style={{ padding: '8px 0', maxHeight: 500, overflowY: 'auto' }}>
          {filtered.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>No available publications to link.</div>
          )}
          {filtered.map(p => (
            <div key={p.id} style={{ padding: '12px 18px', borderBottom: '1px solid #F9FAFB', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#1B1F27', lineHeight: 1.4 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3 }}>{p.venue} · {p.year}</div>
              </div>
              {!readOnly && (
                <button
                  className="btn-primary"
                  style={{ fontSize: 12, padding: '5px 10px', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  onClick={() => setLinked(l => [...l, p])}
                >
                  <Link size={11} /> Link
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function Citations() {
  const { role } = useRole();
  const isReviewer = role === 'Reviewer';
  const [sub, setSub] = useState<SubView>('records');

  const tabs = [
    { id: 'records', label: 'Citation Records' },
    { id: 'references', label: 'Reference List' },
    { id: 'doi', label: 'DOI Management' },
    { id: 'linking', label: 'Publication Linking' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: 2, background: '#F5F6F8', borderRadius: 8, padding: 3, border: '1px solid #E1E4E8', marginBottom: 20, width: 'fit-content' }}>
        {tabs.map(v => (
          <button key={v.id} onClick={() => setSub(v.id as SubView)} style={{
            padding: '6px 14px', borderRadius: 6, border: 'none',
            background: sub === v.id ? '#16324F' : 'transparent',
            color: sub === v.id ? '#fff' : '#5B6472',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>{v.label}</button>
        ))}
      </div>

      {sub === 'records' && <CitationRecords />}
      {sub === 'references' && <References readOnly={isReviewer} />}
      {sub === 'doi' && <DOIManagement readOnly={isReviewer} />}
      {sub === 'linking' && <PublicationLinking readOnly={isReviewer} />}
    </div>
  );
}
