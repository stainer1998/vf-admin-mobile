import { api } from '../client'
import type { Client } from '@/types'

interface Paginated<T> { results: T[]; count: number; next: string | null; previous: string | null }

export const clientesService = {
  list: (params?: Record<string, string>) =>
    api.get<Paginated<Client>>('/api/clients/', { params }),
  get: (id: number) => api.get<Client>(`/api/clients/${id}/`),
  create: (data: Partial<Client>) => api.post<Client>('/api/clients/', data),
  update: (id: number, data: Partial<Client>) => api.patch<Client>(`/api/clients/${id}/`, data),
}
