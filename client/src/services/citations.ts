import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client'
import { Citation } from '../types/index'

export const citationsApi = {
  getCitations: async (): Promise<Citation[]> => {
    const res = await apiClient.get<Citation[]>('/citations/')
    return res.data
  },
  createCitation: async (data: Omit<Citation, 'id'>): Promise<Citation> => {
    const res = await apiClient.post<Citation>('/citations/', data)
    return res.data
  },
  updateCitation: async (id: number, data: Partial<Citation>): Promise<Citation> => {
    const res = await apiClient.put<Citation>(`/citations/${id}`, data)
    return res.data
  },
  deleteCitation: async (id: number): Promise<{ success: boolean }> => {
    const res = await apiClient.delete<{ success: boolean }>(`/citations/${id}`)
    return res.data
  },
}

export function useCitations() {
  return useQuery({
    queryKey: ['citations'],
    queryFn: () => citationsApi.getCitations(),
  })
}

export function useCreateCitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Citation, 'id'>) => citationsApi.createCitation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citations'] })
    },
  })
}

export function useUpdateCitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Citation> }) =>
      citationsApi.updateCitation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citations'] })
    },
  })
}

export function useDeleteCitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => citationsApi.deleteCitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citations'] })
    },
  })
}
