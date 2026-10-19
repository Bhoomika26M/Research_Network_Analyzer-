import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client'

export interface PubLink {
  id: number
  sourceTitle: string
  targetTitle: string
  targetAuthors: string
  targetYear: string
  targetType: string
  relation: string
}

export const linksApi = {
  getLinks: async (): Promise<PubLink[]> => {
    const res = await apiClient.get<PubLink[]>('/links/')
    return res.data
  },
  createLink: async (data: Omit<PubLink, 'id'>): Promise<PubLink> => {
    const res = await apiClient.post<PubLink>('/links/', data)
    return res.data
  },
  updateLink: async (id: number, data: Partial<PubLink>): Promise<PubLink> => {
    const res = await apiClient.put<PubLink>(`/links/${id}`, data)
    return res.data
  },
  deleteLink: async (id: number): Promise<{ success: boolean }> => {
    const res = await apiClient.delete<{ success: boolean }>(`/links/${id}`)
    return res.data
  },
}

export function useLinks() {
  return useQuery({
    queryKey: ['links'],
    queryFn: () => linksApi.getLinks(),
  })
}

export function useCreateLink() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<PubLink, 'id'>) => linksApi.createLink(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['links'] }),
  })
}

export function useUpdateLink() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PubLink> }) => linksApi.updateLink(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['links'] }),
  })
}

export function useDeleteLink() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => linksApi.deleteLink(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['links'] }),
  })
}
