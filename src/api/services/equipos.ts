import { api } from '../client'
import type { Equipment } from '@/types'

interface Paginated<T> { results: T[]; count: number; next: string | null; previous: string | null }

export const equiposService = {
  list: (params?: Record<string, string>) =>
    api.get<Paginated<Equipment>>('/api/equipment/', { params }),
  get: (id: number) => api.get<Equipment>(`/api/equipment/${id}/`),
  create: (data: Partial<Equipment>) => api.post<Equipment>('/api/equipment/', data),
  update: (id: number, data: Partial<Equipment>) => api.patch<Equipment>(`/api/equipment/${id}/`, data),
}
