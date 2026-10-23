import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client'
import { Publication } from '../types/index'

export const publicationsApi = {
  getPublications: async (params?: { year?: number; pub_type?: string; search?: string }): Promise<Publication[]> => {
    const res = await apiClient.get<Publication[]>('/publications/', { params })
    return res.data
  },
  getPublication: async (id: number): Promise<Publication> => {
    const res = await apiClient.get<Publication>(`/publications/${id}`)
    return res.data
  },
  createPublication: async (pubData: Omit<Publication, 'id'>): Promise<Publication> => {
    const res = await apiClient.post<Publication>('/publications/', pubData)
    return res.data
  },
  updatePublication: async (id: number, data: Partial<Publication>): Promise<Publication> => {
    const res = await apiClient.put<Publication>(`/publications/${id}`, data)
    return res.data
  },
  deletePublication: async (id: number): Promise<{ success: boolean }> => {
    const res = await apiClient.delete<{ success: boolean }>(`/publications/${id}`)
    return res.data
  },
}

export function usePublications(params?: { year?: number; pub_type?: string; search?: string }) {
  return useQuery({
    queryKey: ['publications', params],
    queryFn: () => publicationsApi.getPublications(params),
  })
}

export function useCreatePublication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (pubData: Omit<Publication, 'id'>) => publicationsApi.createPublication(pubData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publications'] })
    },
  })
}

export function useUpdatePublication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Publication> }) =>
      publicationsApi.updatePublication(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publications'] })
    },
  })
}

export function useDeletePublication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => publicationsApi.deletePublication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publications'] })
    },
  })
}
