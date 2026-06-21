import { api } from '../client'
import type { WorkOrder, WorkOrderListItem } from '@/types'

interface Paginated<T> { results: T[]; count: number; next: string | null; previous: string | null }

export const trabajosService = {
  list: (params?: Record<string, string>) =>
    api.get<Paginated<WorkOrderListItem>>('/api/work-orders/', { params }),
  get: (id: number) => api.get<WorkOrder>(`/api/work-orders/${id}/`),
  create: (data: Partial<WorkOrder>) => api.post<WorkOrder>('/api/work-orders/', data),
  update: (id: number, data: Partial<WorkOrder>) => api.patch<WorkOrder>(`/api/work-orders/${id}/`, data),
}
