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
}
