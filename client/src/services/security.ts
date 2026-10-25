import { apiClient } from './client'

export interface SecuritySettingsData {
  sessionTimeout: string
  minPasswordLen: number
  requireSpecialChar: boolean
  requireUppercase: boolean
  ipAllowlist: boolean
  ipRanges: string[]
  forceLogoutAt?: number | null
}

export interface PasswordPolicy {
  minPasswordLen: number
  requireSpecialChar: boolean
  requireUppercase: boolean
  forceLogoutAt?: number | null
}

export interface SecurityStats {
  failedLoginAttempts24h: number
  activeSessions: number
  lastAuditTime: string
}

export const securityApi = {
  getSettings: async (): Promise<SecuritySettingsData> => {
    const res = await apiClient.get<SecuritySettingsData>('/security/settings')
    return res.data
  },
  updateSettings: async (data: Partial<SecuritySettingsData>): Promise<SecuritySettingsData> => {
    const res = await apiClient.put<SecuritySettingsData>('/security/settings', data)
    return res.data
  },
  forceLogout: async (): Promise<{ success: boolean; forceLogoutAt: number; message: string }> => {
    const res = await apiClient.post<{ success: boolean; forceLogoutAt: number; message: string }>('/security/force-logout')
    return res.data
  },
  resetKeys: async (): Promise<{ success: boolean; forceLogoutAt: number; message: string }> => {
    const res = await apiClient.post<{ success: boolean; forceLogoutAt: number; message: string }>('/security/reset-keys')
    return res.data
  },
  getPolicy: async (): Promise<PasswordPolicy> => {
    const res = await apiClient.get<PasswordPolicy>('/security/policy')
    return res.data
  },
  getStats: async (): Promise<SecurityStats> => {
    const res = await apiClient.get<SecurityStats>('/security/stats')
    return res.data
  },
}
