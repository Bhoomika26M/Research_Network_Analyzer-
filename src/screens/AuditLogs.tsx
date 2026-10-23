import { useState, useEffect, useCallback } from 'react';
import { Download, Activity, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import Badge from '../components/Badge';
import { api } from '../services/api';
import ToastContainer, { type ToastMessage } from '../components/Toast';

type SubView = 'activity' | 'compliance';

interface AuditLogEntry {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  target: string;
  ip: string;
  result: string;
  tab_category?: string;
}

interface ComplianceReport {
  id: number;
  name: string;
  range: string;
  by: string;
  date: string;
  size: string;
  csv_content: string;
  filename: string;
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

function ActivityLogs({ onToast }: { onToast: (text: string, type?: 'success' | 'error') => void }) {
  const [activeTab, setActiveTab] = useState('User Activity');
  const tabs = ['User Activity', 'Publication History', 'Project Logs', 'Security Logs'];

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('All Action Types');

  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAuditLogs({
        tab: activeTab,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        user: userFilter || undefined,
        action: actionFilter !== 'All Action Types' ? actionFilter : undefined,
      });
      setLogs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch audit logs from backend');
      onToast(err.message || 'Failed to connect to backend', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, dateFrom, dateTo, userFilter, actionFilter, onToast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  async function handleExport() {
    setExporting(true);
    try {
      const csv = await api.exportAuditLogsCSV({
        tab: activeTab,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        user: userFilter || undefined,
        action: actionFilter !== 'All Action Types' ? actionFilter : undefined,
      });
      const filename = `audit_logs_${activeTab.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
      triggerDownload(filename, csv);
      onToast(`Exported ${logs.length} audit logs to CSV`, 'success');
    } catch (err: any) {
      onToast('Export failed: ' + err.message, 'error');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #E1E4E8', paddingBottom: 0 }}>
        {tabs.map(tab => (
          <button
            key={tab}
            id={`tab-${tab.toLowerCase().replace(/\s+/g, '-')}`}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '9px 18px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === tab ? 600 : 500,
              fontSize: 13.5,
              color: activeTab === tab ? '#16324F' : '#5B6472',
              borderBottom: activeTab === tab ? '2.5px solid #16324F' : '2.5px solid transparent',
              marginBottom: -1,
              fontFamily: 'Inter, sans-serif',
              transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          id="filter-date-from"
          type="date"
          className="field-input"
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          style={{ width: 145, height: 38 }}
          aria-label="Filter from date"
        />
        <span style={{ color: '#9CA3AF', fontSize: 13 }}>to</span>
        <input
          id="filter-date-to"
          type="date"
          className="field-input"
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          style={{ width: 145, height: 38 }}
          aria-label="Filter to date"
        />
        <input
          id="filter-user"
          type="text"
          placeholder="Filter by user or IP..."
          className="field-input"
          value={userFilter}
          onChange={e => setUserFilter(e.target.value)}
          style={{ width: 200, height: 38 }}
          aria-label="Filter by user or IP"
        />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <select
            id="filter-action"
            className="field-input"
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            style={{ height: 38, paddingRight: 32, cursor: 'pointer' }}
            aria-label="Filter by action type"
          >
            <option>All Action Types</option>
            <option>Login Attempt</option>
            <option>Publication Created</option>
            <option>User Role Updated</option>
            <option>Data Export</option>
            <option>Report Exported</option>
            <option>Password Changed</option>
          </select>
          <svg
            width="12" height="12" viewBox="0 0 12 12" fill="none"
            style={{ position: 'absolute', right: 10, pointerEvents: 'none', color: '#9CA3AF' }}
          >
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <button
          id="btn-refresh-logs"
          className="btn-secondary"
          onClick={fetchLogs}
          type="button"
          disabled={loading}
          style={{ height: 38, fontSize: 13 }}
          title="Refresh from PostgreSQL"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>

        <button
          id="btn-export-csv"
          className="btn-secondary"
          onClick={handleExport}
          type="button"
          disabled={exporting || logs.length === 0}
          style={{ height: 38, fontSize: 13, marginLeft: 'auto' }}
        >
          {exporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FEF2F2', border: '1px solid #FCA5A5', padding: '10px 14px', borderRadius: 8, color: '#991B1B', marginBottom: 16, fontSize: 13 }}>
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="card">
        <table className="data-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Target Record</th>
              <th>IP / Device</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#5B6472', padding: '40px 16px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <Loader2 size={18} className="animate-spin" color="#16324F" />
                    <span>Loading logs from PostgreSQL database...</span>
                  </div>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#9CA3AF', padding: '36px 16px' }}>
                  No logs found matching your filters in the database.
                </td>
              </tr>
            ) : logs.map(log => (
              <tr key={log.id}>
                <td>
                  <span style={{ fontFamily: 'monospace', fontSize: 12.5, color: '#5B6472' }}>{log.timestamp}</span>
                </td>
                <td style={{ fontWeight: 500 }}>{log.user}</td>
                <td style={{ color: '#1B1F27' }}>{log.action}</td>
                <td style={{ color: '#5B6472', fontSize: 13, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.target}</td>
                <td>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#9CA3AF' }}>{log.ip}</span>
                </td>
                <td><Badge status={log.result} size="sm" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '12px 18px', borderTop: '1px solid #E1E4E8', fontSize: 12.5, color: '#9CA3AF', display: 'flex', justifyContent: 'space-between' }}>
          <span>Connected to PostgreSQL (table: <code>audit_logs</code>)</span>
          <span>Showing {logs.length} entries</span>
        </div>
      </div>
    </div>
  );
}

function ComplianceReportsView({ onToast }: { onToast: (text: string, type?: 'success' | 'error') => void }) {
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState('HIPAA / FERPA Access Log');
  const [selectedRange, setSelectedRange] = useState('Last 90 Days');

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getComplianceReports();
      setReports(data);
    } catch (err: any) {
      onToast('Failed to load compliance reports: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const newReport = await api.generateComplianceReport({
        name: `${selectedReport} (${selectedRange})`,
        range: selectedRange,
        by: 'schen@mit.edu',
      });
      setReports(prev => [newReport, ...prev]);
      onToast(`Generated "${newReport.name}" and saved to PostgreSQL!`, 'success');
    } catch (err: any) {
      onToast('Report generation failed: ' + err.message, 'error');
    } finally {
      setGenerating(false);
    }
  }

  async function handleDownload(report: ComplianceReport) {
    try {
      let content = report.csv_content;
      if (!content) {
        content = await api.downloadComplianceReport(report.id);
      }
      triggerDownload(report.filename, content);
      onToast(`Downloaded ${report.filename}`, 'success');
    } catch (err: any) {
      onToast('Download failed: ' + err.message, 'error');
    }
  }

  return (
    <div>
      {/* Generate report panel */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 15, margin: '0 0 16px', color: '#1B1F27' }}>
          Generate New Compliance Report
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
          <div>
            <label className="field-label" htmlFor="select-report-type">Report Type</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <select
                id="select-report-type"
                className="field-input"
                value={selectedReport}
                onChange={e => setSelectedReport(e.target.value)}
                style={{ paddingRight: 32, cursor: 'pointer' }}
              >
                <option>HIPAA / FERPA Access Log</option>
                <option>User Permission & Role Audit</option>
                <option>Security Incident & Failed Logins</option>
                <option>Data Export Activity Report</option>
              </select>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ position: 'absolute', right: 10, pointerEvents: 'none', color: '#9CA3AF' }}>
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="select-report-range">Date Range</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <select
                id="select-report-range"
                className="field-input"
                value={selectedRange}
                onChange={e => setSelectedRange(e.target.value)}
                style={{ paddingRight: 32, cursor: 'pointer' }}
              >
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
                <option>Q1 2024 (Jan - Mar)</option>
                <option>Q2 2024 (Apr - Jun)</option>
                <option>Full Year 2023</option>
              </select>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ position: 'absolute', right: 10, pointerEvents: 'none', color: '#9CA3AF' }}>
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              id="btn-generate-report"
              type="button"
              className="btn-primary"
              onClick={handleGenerate}
              disabled={generating}
              style={{ height: 38, width: '100%', justifyContent: 'center' }}
            >
              {generating ? <Loader2 size={14} className="animate-spin" /> : <Activity size={14} />}
              {generating ? 'Compiling Live Logs...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Generated reports history */}
      <div className="card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E1E4E8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>Generated Reports Library</h4>
          <button type="button" onClick={fetchReports} className="btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }}>
            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        <table className="data-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Report Name</th>
              <th>Period</th>
              <th>Generated By</th>
              <th>Date</th>
              <th>Size</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#5B6472' }}>
                  <Loader2 size={16} className="animate-spin" /> Loading reports...
                </td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#9CA3AF' }}>
                  No compliance reports generated yet.
                </td>
              </tr>
            ) : reports.map(r => (
              <tr key={r.id}>
                <td style={{ fontWeight: 600, color: '#16324F' }}>{r.name}</td>
                <td style={{ color: '#5B6472' }}>{r.range}</td>
                <td>{r.by}</td>
                <td><span style={{ fontFamily: 'monospace', fontSize: 12.5 }}>{r.date}</span></td>
                <td><span style={{ fontSize: 12, color: '#9CA3AF' }}>{r.size}</span></td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={() => handleDownload(r)}
                    className="btn-secondary"
                    style={{ fontSize: 12, padding: '5px 12px' }}
                  >
                    <Download size={12} /> Download
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
  const [subView, setSubView] = useState<SubView>('activity');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  return (
    <div>
      <ToastContainer toasts={toasts} onDismiss={id => setToasts(prev => prev.filter(t => t.id !== id))} />

      {/* View Switcher Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 22, margin: 0, color: '#16324F' }}>
            {subView === 'activity' ? 'System Audit Trail' : 'Compliance & Governance Reports'}
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13.5, color: '#5B6472' }}>
            Live record of user activity, role changes, exports, and security authentications stored in PostgreSQL.
          </p>
        </div>

        <div style={{ display: 'flex', background: '#E5E7EB', padding: 3, borderRadius: 8 }}>
          <button
            type="button"
            onClick={() => setSubView('activity')}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: subView === 'activity' ? 600 : 500,
              background: subView === 'activity' ? '#fff' : 'transparent',
              color: subView === 'activity' ? '#16324F' : '#4B5563',
              boxShadow: subView === 'activity' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            Activity Logs
          </button>
          <button
            type="button"
            onClick={() => setSubView('compliance')}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: subView === 'compliance' ? 600 : 500,
              background: subView === 'compliance' ? '#fff' : 'transparent',
              color: subView === 'compliance' ? '#16324F' : '#4B5563',
              boxShadow: subView === 'compliance' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            Compliance Reports
          </button>
        </div>
      </div>

      {subView === 'activity' ? <ActivityLogs onToast={addToast} /> : <ComplianceReportsView onToast={addToast} />}
    </div>
  );
}
