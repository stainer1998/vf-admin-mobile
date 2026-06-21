import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000'

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = await SecureStore.getItemAsync('refresh_token')
        if (!refresh) throw new Error('no refresh token')
        const { data } = await axios.post(`${BASE_URL}/api/auth/token/refresh/`, { refresh })
        await SecureStore.setItemAsync('access_token', data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original)
      } catch {
        await SecureStore.deleteItemAsync('access_token')
        await SecureStore.deleteItemAsync('refresh_token')
        // auth store will react to missing token and redirect to login
      }
    }
    return Promise.reject(error)
  },
)
