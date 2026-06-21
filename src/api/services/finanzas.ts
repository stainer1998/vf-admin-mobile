import { api } from '../client'
import type { FinancialTransaction, FundBalance } from '@/types'

export const finanzasService = {
  listTransactions: (params?: Record<string, string>) =>
    api.get<{ results: FinancialTransaction[] }>('/api/transactions/', { params }),
  createTransaction: (data: Partial<FinancialTransaction>) =>
    api.post<FinancialTransaction>('/api/transactions/', data),
  listFundBalances: (params?: Record<string, string>) =>
    api.get<FundBalance[]>('/api/fund-movements/', { params }),
  getDashboard: () => api.get('/api/finanzas/dashboard/'),
}
