import { mockDataStore } from './dataStore';
import { Institution } from '../types';

export const institutionService = {
  getAll: async (): Promise<Institution[]> => {
    return await mockDataStore.getInstitutions();
  },

  getById: async (id: string): Promise<Institution | undefined> => {
    return await mockDataStore.getInstitutionById(id);
  },

  create: async (data: Omit<Institution, 'id'>): Promise<Institution> => {
    return await mockDataStore.createInstitution(data);
  },

  update: async (id: string, updates: Partial<Institution>): Promise<Institution> => {
    return await mockDataStore.updateInstitution(id, updates);
  },
};
