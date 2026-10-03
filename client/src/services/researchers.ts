import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client'
import { Researcher } from '../types/index'

// The backend stores a researcher's publication ids under `publications_ids`,
// while the frontend Researcher type (and the mock data) uses `publications`.
// Normalize here so consumers get the shape they expect.
function normalizeResearcher(r: Researcher): Researcher {
  const apiResearcher = r as unknown as { publications_ids?: number[] }
  return { ...r, publications: apiResearcher.publications_ids ?? r.publications ?? [] }
}

export const researchersApi = {
  getResearchers: async (params?: { institution?: string; role?: string; search?: string }): Promise<Researcher[]> => {
    const res = await apiClient.get<Researcher[]>('/researchers/', { params })
    return res.data.map(normalizeResearcher)
  },
  getResearcher: async (id: number): Promise<Researcher> => {
    const res = await apiClient.get<Researcher>(`/researchers/${id}`)
    return normalizeResearcher(res.data)
  },
  updateResearcher: async (id: number, data: Partial<Researcher>): Promise<Researcher> => {
    const res = await apiClient.put<Researcher>(`/researchers/${id}`, data)
    return normalizeResearcher(res.data)
  },
  createResearcher: async (data: Partial<Researcher>): Promise<Researcher> => {
    const res = await apiClient.post<Researcher>('/researchers/', data)
    return normalizeResearcher(res.data)
  },
  deleteResearcher: async (id: number): Promise<{ success: boolean }> => {
    const res = await apiClient.delete<{ success: boolean }>(`/researchers/${id}`)
    return res.data
  },
}

export function useResearchers(params?: { institution?: string; role?: string; search?: string }) {
  return useQuery({
    queryKey: ['researchers', params],
    queryFn: () => researchersApi.getResearchers(params),
  })
}

export function useResearcher(id: number) {
  return useQuery({
    queryKey: ['researcher', id],
    queryFn: () => researchersApi.getResearcher(id),
    enabled: !!id,
  })
}

export function useUpdateResearcher() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Researcher> }) =>
      researchersApi.updateResearcher(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['researchers'] })
    },
  })
}

export function useCreateResearcher() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Researcher>) => researchersApi.createResearcher(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['researchers'] })
    },
  })
}

export function useDeleteResearcher() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => researchersApi.deleteResearcher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['researchers'] })
    },
  })
}
