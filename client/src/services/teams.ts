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
