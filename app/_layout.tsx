import { useEffect } from 'react'
import { Stack, router } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useAuthStore } from '@/auth/store'
import '../src/global.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
})

export default function RootLayout() {
  const { isAuthenticated, isLoading, restore } = useAuthStore()

  useEffect(() => {
    restore()
  }, [])

  useEffect(() => {
    if (isLoading) return
    if (isAuthenticated) {
      router.replace('/(app)')
    } else {
      router.replace('/(auth)/login')
    }
  }, [isAuthenticated, isLoading])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" backgroundColor="#1e3a6e" />
          <Stack screenOptions={{ headerShown: false }} />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
