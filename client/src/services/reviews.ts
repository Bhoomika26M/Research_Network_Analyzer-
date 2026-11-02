import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client'

export interface Review {
  id: number
  pub_id: number
  pub_title: string
  pub_author: string
  pub_institution: string
  pub_abstract?: string
  pub_keywords?: string
  pub_venue?: string
  pub_type: string
  submitted_date?: string
  deadline?: string
  status: string
  decision?: string
  overall_score?: number
  method_score?: number
  novelty_score?: number
  clarity_score?: number
  comments?: string
  reviewer_name?: string
}

export const reviewsApi = {
  getReviews: async (): Promise<Review[]> => {
    const res = await apiClient.get<Review[]>('/reviews/')
    return res.data
  },
  updateReview: async (id: number, data: Partial<Review>): Promise<Review> => {
    const res = await apiClient.put<Review>(`/reviews/${id}`, data)
    return res.data
  },
}

export function useReviews() {
  return useQuery({
    queryKey: ['reviews'],
    queryFn: () => reviewsApi.getReviews(),
  })
}

export function useUpdateReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Review> }) =>
      reviewsApi.updateReview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      queryClient.invalidateQueries({ queryKey: ['publications'] })
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] })
    },
  })
}
