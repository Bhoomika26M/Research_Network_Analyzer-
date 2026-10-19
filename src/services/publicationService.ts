import { mockDataStore } from './dataStore';
import { Publication } from '../types';

export const publicationService = {
  getAll: async (): Promise<Publication[]> => {
    return await mockDataStore.getPublications();
  },

  getById: async (id: string): Promise<Publication | undefined> => {
    return await mockDataStore.getPublicationById(id);
  },

  create: async (data: Omit<Publication, 'id' | 'doi' | 'history'> & { doi?: string }): Promise<Publication> => {
    return await mockDataStore.createPublication(data);
  },

  updateStatus: async (id: string, status: Publication['status'], user: string, notes: string): Promise<Publication> => {
    return await mockDataStore.updatePublicationStatus(id, status, user, notes);
  },
};
