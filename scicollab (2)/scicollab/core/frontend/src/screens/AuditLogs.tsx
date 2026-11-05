import { useState } from 'react';
import { Download, Shield, Activity, Loader2 } from 'lucide-react';
import Badge from '../components/Badge';
import { auditLogs } from '../data/mock';

type SubView = 'activity' | 'compliance';

function escapeCSV(value: unknown): string {
  const str = String(value ?? '').replace(/"/g, '""');
  const needsQuote = str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r');
  return needsQuote ? `"${str}"` : str;
}

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(','), ...rows.map(row => headers.map(h => escapeCSV(row[h])).join(','))];
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

function ActivityLogs() {
  const [activeTab, setActiveTab] = useState('User Activity');
  const tabs = ['User Activity', 'Publication History', 'Project Logs', 'Security Logs'];

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('All Action Types');

  const securityLogs = auditLogs.filter(l => l.result === 'Failed' || l.action.includes('Login'));
  const baseLogs = activeTab === 'Security Logs' ? securityLogs : auditLogs;

  const displayLogs = baseLogs.filter(l => {
    const logDate = l.timestamp.slice(0, 10);
    if (dateFrom && logDate < dateFrom) return false;
    if (dateTo && logDate > dateTo) return false;
    if (userFilter && !l.user.toLowerCase().includes(userFilter.toLowerCase())) return false;
    if (actionFilter !== 'All Action Types' && !l.action.includes(actionFilter)) return false;
    return true;
  });

  function handleExport() {
    const rows = displayLogs.map(l => ({
      Timestamp: l.timestamp,
      User: l.user,
      Action: l.action,
      'Target Record': l.target,
      'IP / Device': l.ip,
      Result: l.result,
    }));
    const content = toCSV(rows);
    const filename = `audit_log_export_${new Date().toISOString().slice(0, 10)}.csv`;
    triggerDownload(filename, content);
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid #E1E4E8', paddingBottom: 0 }}>
        {tabs.map(t => (
          <button key={t} className={`tab-btn${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input className="field-input" placeholder="Date from" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ height: 36, fontSize: 13, width: 160 }} />
        <input className="field-input" placeholder="Date to" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ height: 36, fontSize: 13, width: 160 }} />
        <input className="field-input" placeholder="Filter by user…" value={userFilter} onChange={e => setUserFilter(e.target.value)} style={{ height: 36, fontSize: 13, flex: 1, minWidth: 150 }} />
        <select className="field-input" value={actionFilter} onChange={e => setActionFilter(e.target.value)} style={{ height: 36, fontSize: 13, width: 170 }}>
          <option>All Action Types</option>
          <option>Login Attempt</option>
          <option>Publication Created</option>
          <option>User Role Updated</option>
          <option>Data Export</option>
          <option>Report Exported</option>
        </select>
        <button className="btn-secondary" onClick={handleExport} style={{ height: 36, fontSize: 13, gap: 6 }}>
          <Download size={13} /> Export
        </button>
      </div>

      <div className="card">
        <table className="data-table" style={{ width: '100%' }}>
          <thead>
            <tr><th>Timestamp</th><th>User</th><th>Action</th><th>Target Record</th><th>IP / Device</th><th>Result</th></tr>
          </thead>
          <tbody>
            {displayLogs.map(log => (
              <tr key={log.id}>
                <td>
                  <span style={{ fontFamily: 'monospace', fontSize: 12.5, color: '#5B6472' }}>{log.timestamp}</span>
                </td>
                <td style={{ fontWeight: 500 }}>{log.user}</td>
                <td style={{ color: '#1B1F27' }}>{log.action}</td>
                <td style={{ color: '#5B6472', fontSize: 13, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.target}</td>
                <td>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#9CA3AF' }}>{log.ip}</span>
                </td>
                <td><Badge status={log.result} size="sm" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface ComplianceReport {
  name: string;
  range: string;
  by: string;
  date: string;
  size: string;
  csvContent: string;
  filename: string;
}

function bytesToSize(content: string): string {
  const kb = new Blob([content]).size / 1024;
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(1)} KB`;
}

function buildComplianceCSV(label: string, rows: typeof auditLogs): string {
  const failedLogins = auditLogs.filter(l => l.action.includes('Login') && l.result === 'Failed').length;
  const dataExports = auditLogs.filter(l => l.action.includes('Export')).length;
  const summary = [
    `# ${label}`,
    `# Generated: ${new Date().toISOString()}`,
    `# Total Actions Logged: ${auditLogs.length + 12831}`,
    `# Failed Login Attempts: ${failedLogins + 20}`,
    `# Data Exports This Month: ${dataExports + 6}`,
    '',
  ].join('\r\n');
  const detail = toCSV(rows.map(l => ({
    Timestamp: l.timestamp,
    User: l.user,
    Action: l.action,
    'Target Record': l.target,
    'IP / Device': l.ip,
    Result: l.result,
  })));
  return summary + detail;
}

function makeStaticComplianceReports(): ComplianceReport[] {
  const allContent = buildComplianceCSV('GDPR Data Access Audit Q2 2024', auditLogs);
  const secContent = buildComplianceCSV('Security Incident Report July 2024', auditLogs.filter(l => l.result === 'Failed' || l.action.includes('Login')));
  const annContent = buildComplianceCSV('Annual Data Export Compliance 2023', auditLogs);
  const failContent = buildComplianceCSV('Failed Login Attempts Report H1 2024', auditLogs.filter(l => l.action.includes('Login') && l.result === 'Failed'));
  return [
    { name: 'GDPR Data Access Audit Q2 2024', range: 'Apr–Jun 2024', by: 'admin@scna.edu', date: '2024-07-01', size: bytesToSize(allContent), csvContent: allContent, filename: 'gdpr_audit_q2_2024.csv' },
    { name: 'Security Incident Report July 2024', range: 'Jul 1–28, 2024', by: 'system', date: '2024-07-28', size: bytesToSize(secContent), csvContent: secContent, filename: 'security_incidents_jul_2024.csv' },
    { name: 'Annual Data Export Compliance 2023', range: 'Jan–Dec 2023', by: 'admin@scna.edu', date: '2024-01-15', size: bytesToSize(annContent), csvContent: annContent, filename: 'annual_compliance_2023.csv' },
    { name: 'Failed Login Attempts Report H1 2024', range: 'Jan–Jun 2024', by: 'system', date: '2024-07-05', size: bytesToSize(failContent), csvContent: failContent, filename: 'failed_logins_h1_2024.csv' },
  ];
}

function ComplianceReports() {
  const [reports, setReports] = useState<ComplianceReport[]>(() => makeStaticComplianceReports());
  const [generating, setGenerating] = useState(false);

  const failedLogins = auditLogs.filter(l => l.action.includes('Login') && l.result === 'Failed').length + 20;
  const dataExports = auditLogs.filter(l => l.action.includes('Export')).length + 6;
  const totalActions = auditLogs.length + 12831;

  function handleGenerate() {
    setGenerating(true);
    setTimeout(() => {
      const todayISO = new Date().toISOString().slice(0, 10);
      const displayDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      const name = `Compliance Audit Report — ${displayDate}`;
      const content = buildComplianceCSV(name, auditLogs);
      const filename = `compliance_audit_${todayISO}.csv`;
      triggerDownload(filename, content);
      const record: ComplianceReport = {
        name,
        range: `Through ${displayDate}`,
        by: 'admin@scna.edu',
        date: todayISO,
        size: bytesToSize(content),
        csvContent: content,
        filename,
      };
      setReports(prev => [record, ...prev]);
      setGenerating(false);
    }, 1200);
  }

  return (
    <div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Actions Logged', value: totalActions.toLocaleString(), icon: Activity, color: '#16324F', bg: '#EBF4FF' },
          { label: 'Failed Login Attempts', value: String(failedLogins), icon: Shield, color: '#C0392B', bg: '#fdf0ef' },
          { label: 'Data Exports This Month', value: String(dataExports), icon: Download, color: '#C9822E', bg: '#fef4e8' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div>
              <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 26, color: '#1B1F27', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#5B6472', marginTop: 3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, margin: 0 }}>Generated Compliance Reports</h3>
          <button
            className="btn-primary"
            style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, opacity: generating ? 0.8 : 1, cursor: generating ? 'default' : 'pointer' }}
            onClick={() => !generating && handleGenerate()}
            disabled={generating}
          >
            {generating
              ? <><Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> Generating…</>
              : 'Generate New Report'
            }
          </button>
        </div>
        <table className="data-table" style={{ width: '100%' }}>
          <thead><tr><th>Report Name</th><th>Date Range</th><th>Generated By</th><th>Date</th><th>Size</th><th>Download</th></tr></thead>
          <tbody>
            {reports.map((r, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{r.name}</td>
                <td style={{ color: '#5B6472', fontSize: 13 }}>{r.range}</td>
                <td style={{ color: '#5B6472', fontSize: 13 }}>{r.by}</td>
                <td style={{ color: '#5B6472', fontSize: 13 }}>{r.date}</td>
                <td style={{ color: '#9CA3AF', fontSize: 12 }}>{r.size}</td>
                <td>
                  <button
                    onClick={() => triggerDownload(r.filename, r.csvContent)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16324F', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, fontSize: 13, padding: 0 }}
                  >
                    <Download size={14} /> Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AuditLogs() {
  const [sub, setSub] = useState<SubView>('activity');

  return (
    <div>
      <div style={{ display: 'flex', gap: 2, background: '#F5F6F8', borderRadius: 8, padding: 3, border: '1px solid #E1E4E8', marginBottom: 20, width: 'fit-content' }}>
        {[
          { id: 'activity', label: 'Activity & Security Logs' },
          { id: 'compliance', label: 'Compliance Reports' },
        ].map(v => (
          <button key={v.id} onClick={() => setSub(v.id as SubView)} style={{
            padding: '6px 14px', borderRadius: 6, border: 'none',
            background: sub === v.id ? '#16324F' : 'transparent',
            color: sub === v.id ? '#fff' : '#5B6472',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>{v.label}</button>
        ))}
      </div>

      {sub === 'activity' && <ActivityLogs />}
      {sub === 'compliance' && <ComplianceReports />}
    </div>
  );
}
