import { api } from '../client'
import type { Quote, QuoteListItem } from '@/types'

interface Paginated<T> { results: T[]; count: number; next: string | null; previous: string | null }

export const cotizacionesService = {
  list: (params?: Record<string, string>) =>
    api.get<Paginated<QuoteListItem>>('/api/quotes/', { params }),
  get: (id: number) => api.get<Quote>(`/api/quotes/${id}/`),
  create: (data: Partial<Quote>) => api.post<Quote>('/api/quotes/', data),
  update: (id: number, data: Partial<Quote>) => api.patch<Quote>(`/api/quotes/${id}/`, data),
}
