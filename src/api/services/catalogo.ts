import { api } from '../client'
import type { Service } from '@/types'

interface Paginated<T> { results: T[]; count: number; next: string | null; previous: string | null }

export const catalogoService = {
  list: (params?: Record<string, string>) =>
    api.get<Paginated<Service>>('/api/services/', { params }),
  get: (id: number) => api.get<Service>(`/api/services/${id}/`),
}
