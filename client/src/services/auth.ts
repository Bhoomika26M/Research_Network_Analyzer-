import { apiClient } from './client'

export interface User {
  id: number
  name: string
  initials: string
  email: string
  institution: string
  department: string
  role: string
  bio: string
  skills: string[]
  interests: string[]
  h_index: number
  citations_total: number
  permissions?: string[]
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', credentials)
    return res.data
  },
  register: async (userData: { name: string; email: string; password: string; role: string }): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/register', userData)
    return res.data
  },
  me: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/me')
    return res.data
  },
  updateProfile: async (data: { name?: string; email?: string; institution?: string; department?: string; bio?: string }): Promise<User> => {
    const res = await apiClient.put<User>('/auth/me', data)
    return res.data
  },
  changePassword: async (passwords: { current_password: string; new_password: string }): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.post<{ success: boolean; message: string }>('/auth/change-password', passwords)
    return res.data
  },
  deactivateAccount: async (): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.post<{ success: boolean; message: string }>('/auth/deactivate')
    return res.data
  },
  deleteAccount: async (): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete<{ success: boolean; message: string }>('/auth/me')
    return res.data
  },
}
