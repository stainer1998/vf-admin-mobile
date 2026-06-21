import { ScrollView, View, Text, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { TouchableOpacity } from 'react-native'
import { useAuthStore } from '@/auth/store'
import { trabajosService } from '@/api/services/trabajos'
import { inventarioService } from '@/api/services/inventario'
import { colors } from '@/theme'
import { formatMoney } from '@/utils/format'

function KpiCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View className="bg-white rounded-2xl p-4 flex-1 border border-zinc-100">
      <Text className="text-xs text-zinc-400 font-medium mb-1">{label}</Text>
      <Text className="text-xl font-bold" style={{ color: color ?? colors.navy }}>{value}</Text>
    </View>
  )
}

export default function DashboardScreen() {
  const { user } = useAuthStore()

  const { data: otData, isLoading: loadingOT } = useQuery({
    queryKey: ['work-orders', 'dashboard'],
    queryFn: () => trabajosService.list({ work_status: 'RECEIVED,IN_PROGRESS', page_size: '100' }),
  })

  const { data: stockData, isLoading: loadingStock } = useQuery({
    queryKey: ['products', 'sin-stock'],
    queryFn: () => inventarioService.listProducts({ stock: '0', page_size: '100' }),
    enabled: user?.rol !== 'TECNICO',
  })

  const otActivas = otData?.data?.results?.length ?? 0
  const sinStock = stockData?.data?.results?.length ?? 0
  const isLoading = loadingOT || loadingStock

  const quickLinks = [
    { label: 'Ver órdenes de trabajo', path: '/(app)/trabajos', roles: ['TECNICO', 'ADMIN'] },
    { label: 'Nueva cotización', path: '/(app)/cotizaciones/nuevo', roles: ['VENDEDOR', 'ADMIN'] },
    { label: 'Buscar cliente', path: '/(app)/clientes', roles: ['TECNICO', 'VENDEDOR', 'ADMIN'] },
  ].filter(l => l.roles.includes(user?.rol ?? ''))

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-2">
          <Text className="text-2xl font-bold text-zinc-900">
            Hola, {user?.nombre_completo?.split(' ')[0]}
          </Text>
          <Text className="text-sm text-zinc-400 mt-0.5 capitalize">{user?.rol?.toLowerCase()}</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.orange} />
        ) : (
          <View className="flex-row gap-3">
            <KpiCard label="OTs activas" value={String(otActivas)} color={colors.orange} />
            {user?.rol !== 'TECNICO' && (
              <KpiCard label="Sin stock" value={String(sinStock)} color={sinStock > 0 ? colors.red : colors.green} />
            )}
          </View>
        )}

        <View className="bg-white rounded-2xl p-4 border border-zinc-100">
          <Text className="text-sm font-semibold text-zinc-600 mb-3">Accesos rápidos</Text>
          {quickLinks.map((l, i) => (
            <TouchableOpacity
              key={l.path}
              onPress={() => router.push(l.path as any)}
              className="py-3 border-b border-zinc-50"
            >
              <Text className="text-sm text-zinc-700 font-medium">{l.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
