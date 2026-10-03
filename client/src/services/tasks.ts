import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client'

export interface ProjectTask {
  id: number
  projectId: number
  title: string
  assignee: string
  dueDate: string
  status: string
  priority: string
}

export const tasksApi = {
  getTasks: async (): Promise<ProjectTask[]> => {
    const res = await apiClient.get<ProjectTask[]>('/tasks/')
    return res.data
  },
  createTask: async (data: Omit<ProjectTask, 'id'>): Promise<ProjectTask> => {
    const res = await apiClient.post<ProjectTask>('/tasks/', data)
    return res.data
  },
  updateTask: async (id: number, data: Partial<ProjectTask>): Promise<ProjectTask> => {
    const res = await apiClient.put<ProjectTask>(`/tasks/${id}`, data)
    return res.data
  },
}

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksApi.getTasks(),
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<ProjectTask, 'id'>) => tasksApi.createTask(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProjectTask> }) => tasksApi.updateTask(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })
}
