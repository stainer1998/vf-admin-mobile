import { api } from '../client'

export interface LoginResponse {
  access: string
  refresh: string
  rol: 'ADMIN' | 'TECNICO' | 'VENDEDOR'
  nombre_completo: string
  username: string
}

export const authService = {
  login: (username: string, password: string) =>
    api.post<LoginResponse>('/api/auth/token/', { username, password }),
}
