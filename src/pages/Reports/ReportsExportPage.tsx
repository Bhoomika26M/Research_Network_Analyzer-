import React, { useState } from 'react';
import { Download, BookOpen, Building2, Users, Network } from 'lucide-react';
import { ExportButtons } from '../../components/shared/ExportButtons';
import { AsyncState } from '../../components/shared/AsyncState';
import { useAsyncData } from '../../hooks/useAsyncData';
import { reportService, ReportKind } from '../../services/reportService';

type TabKey = 'publications' | 'researchers' | 'institutions' | 'collaboration';

const KIND: Record<TabKey, ReportKind> = {
  publications: 'publications',
  researchers: 'research',
  institutions: 'institutions',
  collaboration: 'collaboration',
};

export const ReportsExportPage: React.FC = () => {
  const [reportType, setReportType] = useState<TabKey>('publications');
  const [downloading, setDownloading] = useState<string | null>(null);

  const { data: envelope, loading, error, reload } = useAsyncData(
    () => reportService.fetchJson(KIND[reportType]),
    [reportType]
  );
  const data = envelope?.rows ?? [];

  const handleDownload = async (format: 'xlsx' | 'pdf') => {
    setDownloading(format);
    try {
      await reportService.download(KIND[reportType], format);
    } finally {
      setDownloading(null);
    }
  };

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: 'publications', label: 'Publication Reports', icon: BookOpen },
    { key: 'researchers', label: 'Researcher Analytics', icon: Users },
    { key: 'institutions', label: 'Institution Reports', icon: Building2 },
    { key: 'collaboration', label: 'Collaboration Reports', icon: Network },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-foreground">Analytics Reports & Export Studio</h2>
          <p className="text-xs text-muted-foreground">Live reports from the backend, exportable as Excel or PDF</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleDownload('xlsx')}
            disabled={downloading !== null}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-border hover:bg-muted transition-all disabled:opacity-60"
          >
            <Download className="w-4 h-4" /> {downloading === 'xlsx' ? 'Exporting…' : 'Excel'}
          </button>
          <button
            onClick={() => handleDownload('pdf')}
            disabled={downloading !== null}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-border hover:bg-muted transition-all disabled:opacity-60"
          >
            <Download className="w-4 h-4" /> {downloading === 'pdf' ? 'Exporting…' : 'PDF'}
          </button>
          <ExportButtons
            filename={`${reportType}_report`}
            data={data}
            pdfTitle={`Scientific Network - ${reportType.toUpperCase()} REPORT`}
          />
        </div>
      </div>

      <AsyncState loading={loading} error={error} onRetry={reload} />

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-xl border border-border bg-card">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setReportType(key)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              reportType === key ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Preview Table */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
          <span className="text-xs font-bold text-foreground">Preview Data ({data.length} Records)</span>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/50 border-b border-border font-bold uppercase text-muted-foreground">
              <tr>
                {data.length > 0 &&
                  Object.keys(data[0]).map((key) => (
                    <th key={key} className="p-3">
                      {key}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-muted/30">
                  {Object.values(row).map((val, cIdx) => (
                    <td key={cIdx} className="p-3 truncate max-w-xs">
                      {String(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
