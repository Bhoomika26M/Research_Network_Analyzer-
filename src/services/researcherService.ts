import { mockDataStore } from './dataStore';
import { Researcher } from '../types';

export const researcherService = {
  getAll: async (): Promise<Researcher[]> => {
    return await mockDataStore.getResearchers();
  },

  getById: async (id: string): Promise<Researcher | undefined> => {
    return await mockDataStore.getResearcherById(id);
  },

  create: async (data: Omit<Researcher, 'id'>): Promise<Researcher> => {
    return await mockDataStore.createResearcher(data);
  },
};
