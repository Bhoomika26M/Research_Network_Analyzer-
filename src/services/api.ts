/**
 * REST API Client for Audit Logs & Settings Backend
 * Connects to FastAPI backend running on http://127.0.0.1:8000
 */

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://127.0.0.1:8000/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('audit_settings_token');
  }

  setToken(t: string | null) {
    this.token = t;
    if (t) {
      localStorage.setItem('audit_settings_token', t);
    } else {
      localStorage.removeItem('audit_settings_token');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errorMsg = `API Error ${res.status}: ${res.statusText}`;
      try {
        const errJson = await res.json();
        if (errJson.detail) {
          errorMsg = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
        }
      } catch (_) {}
      throw new Error(errorMsg);
    }

    // Check content type for non-json (e.g. CSV)
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('text/csv')) {
      return res.text() as unknown as T;
    }

    if (res.status === 204) {
      return {} as T;
    }

    return res.json();
  }

  // Auth / Ping
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch('http://127.0.0.1:8000/health');
      return res.ok;
    } catch (_) {
      return false;
    }
  }

  async login(email = 'schen@mit.edu', password = 'password123'): Promise<any> {
    const data = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  }

  async switchRole(role: string): Promise<any> {
    return this.request('/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  }

  // Audit Logs
  async getAuditLogs(params?: {
    tab?: string;
    date_from?: string;
    date_to?: string;
    user?: string;
    action?: string;
    limit?: number;
  }): Promise<any[]> {
    const q = new URLSearchParams();
    if (params?.tab) q.set('tab', params.tab);
    if (params?.date_from) q.set('date_from', params.date_from);
    if (params?.date_to) q.set('date_to', params.date_to);
    if (params?.user) q.set('user', params.user);
    if (params?.action && params.action !== 'All Action Types') q.set('action', params.action);
    if (params?.limit) q.set('limit', params.limit.toString());

    return this.request(`/audit-logs?${q.toString()}`);
  }

  async exportAuditLogsCSV(params?: {
    tab?: string;
    date_from?: string;
    date_to?: string;
    user?: string;
    action?: string;
  }): Promise<string> {
    const q = new URLSearchParams();
    if (params?.tab) q.set('tab', params.tab);
    if (params?.date_from) q.set('date_from', params.date_from);
    if (params?.date_to) q.set('date_to', params.date_to);
    if (params?.user) q.set('user', params.user);
    if (params?.action && params.action !== 'All Action Types') q.set('action', params.action);

    return this.request(`/audit-logs/export?${q.toString()}`);
  }

  async createAuditLog(log: {
    user: string;
    action: string;
    target: string;
    ip: string;
    result?: string;
    tab_category?: string;
  }): Promise<any> {
    return this.request('/audit-logs', {
      method: 'POST',
      body: JSON.stringify(log),
    });
  }

  // Compliance Reports
  async getComplianceReports(): Promise<any[]> {
    return this.request('/compliance-reports');
  }

  async generateComplianceReport(data: { name: string; range: string; by: string }): Promise<any> {
    return this.request('/compliance-reports/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async downloadComplianceReport(id: number): Promise<string> {
    return this.request(`/compliance-reports/${id}/download`);
  }

  // Settings: Profile
  async getProfile(): Promise<any> {
    return this.request('/settings/profile');
  }

  async updateProfile(profile: any): Promise<any> {
    return this.request('/settings/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  // Settings: Notifications
  async getNotifications(): Promise<any> {
    return this.request('/settings/notifications');
  }

  async updateNotifications(notifs: any): Promise<any> {
    return this.request('/settings/notifications', {
      method: 'PUT',
      body: JSON.stringify(notifs),
    });
  }

  // Settings: Security
  async getSecurity(): Promise<{ two_fa_enabled: boolean; sessions: any[] }> {
    return this.request('/settings/security');
  }

  async updateTwoFa(enabled: boolean): Promise<any> {
    return this.request('/settings/security/2fa', {
      method: 'PUT',
      body: JSON.stringify({ enabled }),
    });
  }

  async changePassword(current_password: string, new_password: string): Promise<any> {
    return this.request('/settings/security/password', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password }),
    });
  }

  async revokeSession(sessionId: number): Promise<any> {
    return this.request(`/settings/security/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // Settings: System (Admin)
  async getSystemSettings(): Promise<any> {
    return this.request('/settings/system');
  }

  async updateSystemSettings(data: any): Promise<any> {
    return this.request('/settings/system', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Settings: Appearance
  async getAppearance(): Promise<any> {
    return this.request('/settings/appearance');
  }

  async updateAppearance(data: any): Promise<any> {
    return this.request('/settings/appearance', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Settings: Data & Privacy
  async getPrivacy(): Promise<any> {
    return this.request('/settings/privacy');
  }

  async updatePrivacy(data: any): Promise<any> {
    return this.request('/settings/privacy', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async requestDataExport(): Promise<any> {
    return this.request('/settings/privacy/export-data', {
      method: 'POST',
    });
  }

  async deleteAccount(): Promise<any> {
    return this.request('/settings/privacy/account', {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
