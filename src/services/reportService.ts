/** Reports: JSON payload or a binary XLSX / PDF download. */
import { API_BASE_URL, apiClient } from './apiClient';

export type ReportKind = 'publications' | 'research' | 'collaboration' | 'institutions';
export type ReportFormat = 'json' | 'xlsx' | 'pdf';

export interface ReportEnvelope {
  report: string;
  count: number;
  columns: string[];
  rows: Record<string, unknown>[];
}

export type ReportFilters = Record<string, string | number | undefined>;

export const reportService = {
  async fetchJson(kind: ReportKind, filters: ReportFilters = {}): Promise<ReportEnvelope> {
    const { data } = await apiClient.get<ReportEnvelope>(`/reports/${kind}`, {
      params: { format: 'json', ...filters },
    });
    return data;
  },

  /** Download a .xlsx / .pdf and hand it to the browser. */
  async download(kind: ReportKind, format: Exclude<ReportFormat, 'json'>, filters: ReportFilters = {}): Promise<void> {
    const response = await apiClient.get(`/reports/${kind}`, {
      params: { format, ...filters },
      responseType: 'blob',
    });
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${kind}-report.${format}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  jsonUrl(kind: ReportKind, filters: ReportFilters = {}): string {
    const params = new URLSearchParams({ format: 'json', ...(filters as Record<string, string>) });
    return `${API_BASE_URL}/reports/${kind}?${params.toString()}`;
  },
};
