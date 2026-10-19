import { mockDataStore } from './dataStore';
import { Conference } from '../types';

export const conferenceService = {
  getAll: async (): Promise<Conference[]> => {
    return await mockDataStore.getConferences();
  },

  register: async (confId: string, researcherId: string, researcherName: string, paperTitle?: string): Promise<Conference> => {
    return await mockDataStore.registerForConference(confId, researcherId, researcherName, paperTitle);
  },
};
