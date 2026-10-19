import { mockDataStore } from './dataStore';
import { AuditLog } from '../types';

export const auditService = {
  getAll: async (): Promise<AuditLog[]> => {
    return await mockDataStore.getAuditLogs();
  },
};
