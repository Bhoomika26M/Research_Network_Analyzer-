import { mockDataStore } from './dataStore';
import { Citation } from '../types';

export const citationService = {
  getAll: async (): Promise<Citation[]> => {
    return await mockDataStore.getCitations();
  },
};
