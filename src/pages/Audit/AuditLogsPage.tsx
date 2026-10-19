import React, { useEffect, useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { auditService } from '../../services/auditService';
import { AuditLog, AuditCategory } from '../../types';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { AsyncState } from '../../components/shared/AsyncState';
import { useAsyncData } from '../../hooks/useAsyncData';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<AuditCategory | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: logsData, loading, error, reload } = useAsyncData(() => auditService.getAll());
  useEffect(() => {
    if (logsData) setLogs(logsData);
  }, [logsData]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesTab = activeTab === 'All' || log.category === activeTab;
      const matchesSearch =
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase());

      const logDate = log.timestamp.split(' ')[0];
      const matchesStart = !startDate || logDate >= startDate;
      const matchesEnd = !endDate || logDate <= endDate;

      return matchesTab && matchesSearch && matchesStart && matchesEnd;
    });
  }, [logs, activeTab, searchTerm, startDate, endDate]);

  const CATEGORIES: (AuditCategory | 'All')[] = ['All', 'User Activity', 'Publication', 'Project', 'Security'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-foreground">System Audit Logs & Governance</h2>
        <p className="text-xs text-muted-foreground">Comprehensive, tamper-proof activity logs for security, compliance, and user actions</p>
      </div>

      <AsyncState loading={loading} error={error} onRetry={reload} />

      {/* Category Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-xl border border-border bg-card">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === cat ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Toolbar Filters */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by user, action, IP, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none"
          />
        </div>

        {/* Date Range Picker */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>From:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2 py-1.5 rounded-lg border border-border bg-background text-foreground focus:outline-none"
          />
          <span>To:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2 py-1.5 rounded-lg border border-border bg-background text-foreground focus:outline-none"
          />
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-muted/50 border-b border-border font-bold uppercase text-muted-foreground">
            <tr>
              <th className="p-3.5">Timestamp</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">User & Role</th>
              <th className="p-3.5">Action</th>
              <th className="p-3.5">IP Address</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  No matching audit entries found.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/30">
                  <td className="p-3.5 font-mono text-[11px] text-muted-foreground">{log.timestamp}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                      {log.category}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <p className="font-bold text-foreground">{log.user}</p>
                    <p className="text-[10px] text-muted-foreground">{log.role}</p>
                  </td>
                  <td className="p-3.5 font-bold text-foreground">{log.action}</td>
                  <td className="p-3.5 font-mono text-[11px] text-muted-foreground">{log.ipAddress}</td>
                  <td className="p-3.5">
                    <StatusBadge status={log.status} size="sm" />
                  </td>
                  <td className="p-3.5 text-muted-foreground">{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
