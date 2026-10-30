import { useState, useCallback } from 'react';
import { FileText, BookOpen, Network, Building, Download, ChevronDown, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { pubTrend, deptPubs, publications, researchers, projects, institutions } from '../data/mock';

type SubView = 'hub' | 'builder';

// ─── CSV generation utilities ──────────────────────────────────────────────

function escapeCSV(value: unknown): string {
  const str = String(value ?? '').replace(/"/g, '""');
  const needsQuote = str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r');
  return needsQuote ? `"${str}"` : str;
}

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(','),
    ...rows.map(row => headers.map(h => escapeCSV(row[h])).join(',')),
  ];
  return lines.join('\r\n');
}

function triggerDownload(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Per-type CSV builders ──────────────────────────────────────────────────

function buildPublicationCSV(): { filename: string; content: string } {
  const rows = publications.map(p => ({
    ID: p.id,
    Title: p.title,
    Type: p.type,
    Venue: p.venue,
    Year: p.year,
    Status: p.status,
    Citations: p.citations,
    DOI: p.doi,
    Authors: p.authors.map(id => researchers.find(r => r.id === id)?.name ?? id).join('; '),
    Keywords: p.keywords.join('; '),
  }));
  const content = toCSV(rows);
  const filename = `publication_report_${today()}.csv`;
  return { filename, content };
}

function buildResearchCSV(): { filename: string; content: string } {
  const rows = projects.map(p => ({
    ID: p.id,
    'Project Name': p.name,
    PI: p.pi,
    Institutions: p.institutions.join('; '),
    'Funding Source': p.funding,
    Status: p.status,
    'Team Size': p.team,
    'Start Date': p.start,
    'End Date': p.end,
    Budget: p.budget,
  }));
  const content = toCSV(rows);
  const filename = `research_report_${today()}.csv`;
  return { filename, content };
}

function buildCollaborationCSV(): { filename: string; content: string } {
  // Build from institution pairs derived from project data
  const rows: Record<string, unknown>[] = [];
  projects.forEach(p => {
    for (let i = 0; i < p.institutions.length - 1; i++) {
      for (let j = i + 1; j < p.institutions.length; j++) {
        rows.push({
          'Institution A': p.institutions[i],
          'Institution B': p.institutions[j],
          'Collaboration Type': 'Joint Research',
          'Start Date': p.start,
          Status: p.status,
          'Linked Projects': p.name,
          'Funding Source': p.funding,
        });
      }
    }
  });
  const content = toCSV(rows);
  const filename = `collaboration_report_${today()}.csv`;
  return { filename, content };
}

function buildInstitutionCSV(): { filename: string; content: string } {
  const rows = institutions.map(inst => ({
    ID: inst.id,
    Name: inst.name,
    Type: inst.type,
    Country: inst.country,
    Researchers: inst.researchers,
    Publications: inst.publications,
    Status: inst.status,
    Established: inst.established,
    'Publications per Researcher': inst.researchers > 0 ? (inst.publications / inst.researchers).toFixed(1) : 'N/A',
  }));
  const content = toCSV(rows);
  const filename = `institution_report_${today()}.csv`;
  return { filename, content };
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function todayDisplay(): string {
  return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface ReportRecord {
  name: string;
  type: string;
  by: string;
  date: string;
  size: string;
  csvContent: string;
  filename: string;
}

const typeColors: Record<string, string> = {
  Publication: '#2B6CB0',
  Collaboration: '#C9822E',
  Research: '#1F7A6C',
  Institution: '#6B46C1',
};

// ─── Static recent reports (no download content, show button disabled) ──────

// ─── Report hub ─────────────────────────────────────────────────────────────

interface ReportTypeCard {
  id: string;
  icon: React.ElementType;
  label: string;
  desc: string;
  color: string;
  bg: string;
  generate: () => { filename: string; content: string };
  reportTypeName: string;
}

const reportTypes: ReportTypeCard[] = [
  {
    id: 'pub', icon: BookOpen,
    label: 'Publication Reports',
    desc: 'Analyze publication output, types, and trends across researchers and institutions.',
    color: '#2B6CB0', bg: '#EBF4FF',
    generate: buildPublicationCSV,
    reportTypeName: 'Publication',
  },
  {
    id: 'research', icon: FileText,
    label: 'Research Reports',
    desc: 'Track active and completed projects, funding sources, and team compositions.',
    color: '#1F7A6C', bg: '#e8f5f3',
    generate: buildResearchCSV,
    reportTypeName: 'Research',
  },
  {
    id: 'collab', icon: Network,
    label: 'Collaboration Reports',
    desc: 'Map co-authorship networks, institutional partnerships, and collaboration intensity.',
    color: '#C9822E', bg: '#fef4e8',
    generate: buildCollaborationCSV,
    reportTypeName: 'Collaboration',
  },
  {
    id: 'inst', icon: Building,
    label: 'Institution Reports',
    desc: 'Compare institutional performance across publications, citations, and projects.',
    color: '#6B46C1', bg: '#f3eeff',
    generate: buildInstitutionCSV,
    reportTypeName: 'Institution',
  },
];

function bytesToKB(content: string): string {
  const bytes = new Blob([content]).size;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function makeStaticReports(): ReportRecord[] {
  const pub = buildPublicationCSV();
  const col = buildCollaborationCSV();
  const res = buildResearchCSV();
  const ins = buildInstitutionCSV();
  return [
    { name: 'Publication Output Q2 2024', type: 'Publication', by: 'admin@scna.edu', date: 'Jul 15, 2024', size: bytesToKB(pub.content), csvContent: pub.content, filename: 'publication_output_q2_2024.csv' },
    { name: 'Cross-Institutional Collaborations H1 2024', type: 'Collaboration', by: 'Dr. Sarah Chen', date: 'Jul 10, 2024', size: bytesToKB(col.content), csvContent: col.content, filename: 'collaborations_h1_2024.csv' },
    { name: 'Researcher Productivity Annual 2023', type: 'Research', by: 'Prof. Aisha Nkosi', date: 'Jul 1, 2024', size: bytesToKB(res.content), csvContent: res.content, filename: 'researcher_productivity_2023.csv' },
    { name: 'MIT vs Stanford Benchmarking', type: 'Institution', by: 'admin@scna.edu', date: 'Jun 22, 2024', size: bytesToKB(ins.content), csvContent: ins.content, filename: 'institution_benchmarking_2024.csv' },
    { name: 'Citation Impact Trend 2020–2024', type: 'Publication', by: 'Dr. Li Wei', date: 'Jun 15, 2024', size: bytesToKB(pub.content), csvContent: pub.content, filename: 'citation_impact_trend_2024.csv' },
  ];
}

function ReportsHub({ onBuilder, recentReports, onGenerate }: {
  onBuilder: () => void;
  recentReports: ReportRecord[];
  onGenerate: (record: ReportRecord) => void;
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleGenerate = useCallback((rt: ReportTypeCard) => {
    setLoadingId(rt.id);
    // Simulate a brief loading state, then generate
    setTimeout(() => {
      const { filename, content } = rt.generate();
      triggerDownload(filename, content);
      const record: ReportRecord = {
        name: `${rt.label} — ${todayDisplay()}`,
        type: rt.reportTypeName,
        by: 'Dr. Sarah Chen',
        date: todayDisplay(),
        size: bytesToKB(content),
        csvContent: content,
        filename,
      };
      onGenerate(record);
      setLoadingId(null);
    }, 1200);
  }, [onGenerate]);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 28 }}>
        {reportTypes.map(rt => {
          const loading = loadingId === rt.id;
          return (
            <div key={rt.id} className="card" style={{ padding: 24, display: 'flex', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: rt.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <rt.icon size={22} color={rt.color} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 15, margin: '0 0 6px', color: '#1B1F27' }}>{rt.label}</h3>
                <p style={{ fontSize: 13, color: '#5B6472', margin: '0 0 14px', lineHeight: 1.5 }}>{rt.desc}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn-primary"
                    style={{ fontSize: 13, opacity: loading ? 0.8 : 1, cursor: loading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    onClick={() => !loading && handleGenerate(rt)}
                    disabled={loading}
                  >
                    {loading
                      ? <><Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> Generating…</>
                      : <><Download size={13} /> Generate CSV</>
                    }
                  </button>
                  <button className="btn-secondary" style={{ fontSize: 13 }} onClick={onBuilder}>Configure</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div className="card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}>
          <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, margin: 0 }}>Recent Reports</h3>
        </div>
        <table className="data-table" style={{ width: '100%' }}>
          <thead>
            <tr><th>Report Name</th><th>Type</th><th>Generated By</th><th>Date</th><th>Size</th><th>Download</th></tr>
          </thead>
          <tbody>
            {recentReports.map((r, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{r.name}</td>
                <td>
                  <span style={{ padding: '3px 8px', background: (typeColors[r.type] ?? '#5B6472') + '18', color: typeColors[r.type] ?? '#5B6472', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                    {r.type}
                  </span>
                </td>
                <td style={{ color: '#5B6472', fontSize: 13 }}>{r.by}</td>
                <td style={{ color: '#5B6472', fontSize: 13 }}>{r.date}</td>
                <td style={{ color: '#9CA3AF', fontSize: 12 }}>{r.size}</td>
                <td>
                  {r.csvContent ? (
                    <button
                      onClick={() => triggerDownload(r.filename, r.csvContent)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16324F', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, fontSize: 13, padding: 0 }}
                    >
                      <Download size={14} /> Download
                    </button>
                  ) : (
                    <span style={{ color: '#9CA3AF', fontSize: 13 }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Preview stats helper ────────────────────────────────────────────────────

function PreviewStats({ reportType }: { reportType: string }) {
  const stats: { label: string; val: string }[] =
    reportType === 'Publication Reports'
      ? [
          { label: 'Total Publications', val: String(publications.length) },
          { label: 'Avg. Citations', val: (publications.reduce((s, p) => s + p.citations, 0) / publications.length).toFixed(1) },
          { label: 'Unique Authors', val: String(new Set(publications.flatMap(p => p.authors)).size) },
        ]
      : reportType === 'Research Reports'
      ? [
          { label: 'Total Projects', val: String(projects.length) },
          { label: 'Active Projects', val: String(projects.filter(p => p.status === 'Active').length) },
          { label: 'Avg. Team Size', val: (projects.reduce((s, p) => s + p.team, 0) / projects.length).toFixed(1) },
        ]
      : reportType === 'Collaboration Reports'
      ? [
          { label: 'Collaboration Pairs', val: '8' },
          { label: 'Institutions', val: String(institutions.length) },
          { label: 'Active Projects', val: String(projects.filter(p => p.status === 'Active').length) },
        ]
      : [
          { label: 'Institutions', val: String(institutions.length) },
          { label: 'Total Researchers', val: institutions.reduce((s, i) => s + i.researchers, 0).toLocaleString() },
          { label: 'Total Publications', val: institutions.reduce((s, i) => s + i.publications, 0).toLocaleString() },
        ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
      {stats.map(s => (
        <div key={s.label} style={{ padding: '14px 16px', background: '#F5F6F8', borderRadius: 10, textAlign: 'center' }}>
          <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 24, color: '#1B1F27' }}>{s.val}</div>
          <div style={{ fontSize: 12, color: '#5B6472', marginTop: 3 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Report Builder ──────────────────────────────────────────────────────────

function ReportBuilder({ onBack, onGenerate }: { onBack: () => void; onGenerate: (record: ReportRecord) => void }) {
  const [reportType, setReportType] = useState('Publication Reports');
  const [loading, setLoading] = useState(false);

  const previewData = reportType.includes('Institution') ? deptPubs : pubTrend;

  const typeToBuilder: Record<string, ReportTypeCard> = Object.fromEntries(
    reportTypes.map(rt => [rt.label, rt])
  );

  const handleExport = () => {
    const rt = typeToBuilder[reportType];
    if (!rt) return;
    setLoading(true);
    setTimeout(() => {
      const { filename, content } = rt.generate();
      triggerDownload(filename, content);
      onGenerate({
        name: `${rt.label} — ${todayDisplay()}`,
        type: rt.reportTypeName,
        by: 'Dr. Sarah Chen',
        date: todayDisplay(),
        size: bytesToKB(content),
        csvContent: content,
        filename,
      });
      setLoading(false);
    }, 800);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 18, margin: 0 }}>Report Builder</h2>
        <button className="btn-secondary" onClick={onBack}>← Back</button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>
        <div className="card" style={{ padding: 24, height: 'fit-content' }}>
          <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, margin: '0 0 20px' }}>Report Configuration</h3>

          <div style={{ marginBottom: 16 }}>
            <label className="field-label">Report Type</label>
            <div style={{ position: 'relative' }}>
              <select className="field-input" style={{ appearance: 'none' }} value={reportType} onChange={e => setReportType(e.target.value)}>
                {reportTypes.map(rt => <option key={rt.id}>{rt.label}</option>)}
              </select>
              <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="field-label">Date Range</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="field-input" type="date" defaultValue="2024-01-01" style={{ flex: 1, fontSize: 13 }} />
              <input className="field-input" type="date" defaultValue="2024-12-31" style={{ flex: 1, fontSize: 13 }} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="field-label">Institution</label>
            <div style={{ position: 'relative' }}>
              <select className="field-input" style={{ appearance: 'none' }}>
                <option>All Institutions</option>
                <option>MIT</option>
                <option>Stanford University</option>
                <option>UC Berkeley</option>
              </select>
              <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label className="field-label">Group By</label>
            <div style={{ position: 'relative' }}>
              <select className="field-input" style={{ appearance: 'none' }}>
                <option>Year</option>
                <option>Department</option>
                <option>Institution</option>
                <option>Publication Type</option>
              </select>
              <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
            </div>
          </div>

          <div style={{ paddingTop: 16, borderTop: '1px solid #E1E4E8' }}>
            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', gap: 6, fontSize: 13, opacity: loading ? 0.8 : 1 }}
              onClick={handleExport}
              disabled={loading}
            >
              {loading
                ? <><Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> Generating…</>
                : <><Download size={13} /> Export as CSV</>
              }
            </button>
            <p style={{ textAlign: 'center', fontSize: 11.5, color: '#9CA3AF', margin: '10px 0 0' }}>
              Downloads a CSV file to your computer
            </p>
          </div>
        </div>

        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, margin: 0 }}>Preview — {reportType}</h3>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>All data · Current filter</span>
          </div>
          <div style={{ padding: '20px 16px' }}>
            <PreviewStats reportType={reportType} />
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={previewData as Record<string, unknown>[]} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey={previewData === deptPubs ? 'dept' : 'year'} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey={previewData === deptPubs ? 'pubs' : 'count'} fill="#16324F" radius={[4, 4, 0, 0]} name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Reports screen ─────────────────────────────────────────────────────

export default function Reports() {
  const [sub, setSub] = useState<SubView>('hub');
  const [recentReports, setRecentReports] = useState<ReportRecord[]>(() => makeStaticReports());

  const addReport = useCallback((record: ReportRecord) => {
    setRecentReports(prev => [record, ...prev]);
    // If we're in builder, switch back to hub so user sees it in the table
    setSub('hub');
  }, []);

  return (
    <div>
      {sub === 'hub' && (
        <ReportsHub
          onBuilder={() => setSub('builder')}
          recentReports={recentReports}
          onGenerate={addReport}
        />
      )}
      {sub === 'builder' && (
        <ReportBuilder onBack={() => setSub('hub')} onGenerate={addReport} />
      )}
    </div>
  );
}
