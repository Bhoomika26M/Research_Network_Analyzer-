import { useQuery } from '@tanstack/react-query'
import { apiClient } from './client'
import { AuditLog } from '../types/index'

export const auditLogsApi = {
  getAuditLogs: async (): Promise<AuditLog[]> => {
    const res = await apiClient.get<AuditLog[]>('/audit-logs/')
    return res.data
  },
}

export function useAuditLogs() {
  return useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => auditLogsApi.getAuditLogs(),
  })
}
