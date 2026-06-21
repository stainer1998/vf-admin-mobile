import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import { authService, type LoginResponse } from '@/api/services/auth'

interface AuthState {
  user: Omit<LoginResponse, 'access' | 'refresh'> | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  restore: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (username, password) => {
    const { data } = await authService.login(username, password)
    await SecureStore.setItemAsync('access_token', data.access)
    await SecureStore.setItemAsync('refresh_token', data.refresh)
    await SecureStore.setItemAsync('user_meta', JSON.stringify({
      rol: data.rol,
      nombre_completo: data.nombre_completo,
      username: data.username,
    }))
    set({
      user: { rol: data.rol, nombre_completo: data.nombre_completo, username: data.username },
      isAuthenticated: true,
    })
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('access_token')
    await SecureStore.deleteItemAsync('refresh_token')
    await SecureStore.deleteItemAsync('user_meta')
    set({ user: null, isAuthenticated: false })
  },

  restore: async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token')
      const meta = await SecureStore.getItemAsync('user_meta')
      if (token && meta) {
        set({ user: JSON.parse(meta), isAuthenticated: true })
      }
    } finally {
      set({ isLoading: false })
    }
  },
}))
