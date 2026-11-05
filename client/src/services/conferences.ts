import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client'
import { Conference } from '../types/index'

export const conferencesApi = {
  getConferences: async (): Promise<Conference[]> => {
    const res = await apiClient.get<Conference[]>('/conferences/')
    return res.data
  },
  createConference: async (confData: Omit<Conference, 'id'>): Promise<Conference> => {
    const res = await apiClient.post<Conference>('/conferences/', confData)
    return res.data
  },
  updateConference: async (id: number, data: Partial<Conference>): Promise<Conference> => {
    const res = await apiClient.put<Conference>(`/conferences/${id}`, data)
    return res.data
  },
  deleteConference: async (id: number): Promise<{ success: boolean }> => {
    const res = await apiClient.delete<{ success: boolean }>(`/conferences/${id}`)
    return res.data
  },
}

export function useConferences() {
  return useQuery({
    queryKey: ['conferences'],
    queryFn: () => conferencesApi.getConferences(),
  })
}

export function useCreateConference() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (confData: Omit<Conference, 'id'>) => conferencesApi.createConference(confData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conferences'] })
    },
  })
}

export function useUpdateConference() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Conference> }) =>
      conferencesApi.updateConference(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conferences'] })
    },
  })
}

export function useDeleteConference() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => conferencesApi.deleteConference(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conferences'] })
    },
  })
}
