import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client'

export interface DOIMintResponse {
  success: boolean
  doi: string
  publication_id: number
}

export const doisApi = {
  mintDOI: async (publicationId: number, prefix = '10.1038'): Promise<DOIMintResponse> => {
    const res = await apiClient.post<DOIMintResponse>('/dois/mint', {
      publication_id: publicationId,
      prefix,
    })
    return res.data
  },
}

export function useMintDOI() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ publicationId, prefix }: { publicationId: number; prefix?: string }) =>
      doisApi.mintDOI(publicationId, prefix),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publications'] })
    },
  })
}
