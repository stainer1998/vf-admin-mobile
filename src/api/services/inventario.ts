import { api } from '../client'
import type { Product, InventoryMovement } from '@/types'

interface Paginated<T> { results: T[]; count: number; next: string | null; previous: string | null }

export const inventarioService = {
  listProducts: (params?: Record<string, string>) =>
    api.get<Paginated<Product>>('/api/products/', { params }),
  getProduct: (id: number) => api.get<Product>(`/api/products/${id}/`),
  listMovements: (params?: Record<string, string>) =>
    api.get<Paginated<InventoryMovement>>('/api/inventory-movements/', { params }),
  createMovement: (data: Partial<InventoryMovement>) =>
    api.post<InventoryMovement>('/api/inventory-movements/', data),
}
