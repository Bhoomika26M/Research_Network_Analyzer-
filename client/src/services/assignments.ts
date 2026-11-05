import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client'

export interface Assignment {
  id: number
  projectId: number
  researcherId: number
  role: string
  status: string | null
}

export const assignmentsApi = {
  getAssignments: async (): Promise<Assignment[]> => {
    const res = await apiClient.get<Assignment[]>('/assignments/')
    return res.data
  },
  upsertAssignment: async (data: Omit<Assignment, 'id'>): Promise<Assignment> => {
    const res = await apiClient.post<Assignment>('/assignments/', data)
    return res.data
  },
  deleteAssignment: async (id: number): Promise<{ success: boolean }> => {
    const res = await apiClient.delete<{ success: boolean }>(`/assignments/${id}`)
    return res.data
  },
}

export function useAssignments() {
  return useQuery({
    queryKey: ['assignments'],
    queryFn: () => assignmentsApi.getAssignments(),
  })
}

export function useUpsertAssignment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Assignment, 'id'>) => assignmentsApi.upsertAssignment(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assignments'] }),
  })
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => assignmentsApi.deleteAssignment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assignments'] }),
  })
}
