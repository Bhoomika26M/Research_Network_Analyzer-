import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client'

export interface TeamMember {
  name: string
  role: string
  initials: string
}

export interface Team {
  id: number
  name: string
  project: string
  members: TeamMember[]
}

export const teamsApi = {
  getTeams: async (): Promise<Team[]> => {
    const res = await apiClient.get<Team[]>('/teams/')
    return res.data
  },
  createTeam: async (data: Omit<Team, 'id'>): Promise<Team> => {
    const res = await apiClient.post<Team>('/teams/', data)
    return res.data
  },
  updateTeam: async (id: number, data: Partial<Team>): Promise<Team> => {
    const res = await apiClient.put<Team>(`/teams/${id}`, data)
    return res.data
  },
  deleteTeam: async (id: number): Promise<{ success: boolean; deleted: number }> => {
    const res = await apiClient.delete<{ success: boolean; deleted: number }>(`/teams/${id}`)
    return res.data
  },
}

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: () => teamsApi.getTeams(),
  })
}

export function useCreateTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Team, 'id'>) => teamsApi.createTeam(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  })
}

export function useUpdateTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Team> }) => teamsApi.updateTeam(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  })
}

export function useDeleteTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => teamsApi.deleteTeam(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
    onError: (err: any) => {
      // delete errors are surfaced via the onError callback
    },
  })
}
