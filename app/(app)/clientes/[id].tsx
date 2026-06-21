import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, Wrench, FileText } from 'lucide-react-native'
import { clientesService } from '@/api/services/clientes'
import { equiposService } from '@/api/services/equipos'
import { trabajosService } from '@/api/services/trabajos'
import { colors } from '@/theme'
import type { Client } from '@/types'

function clientDisplayName(c: Client): string {
  if (c.type === 'COMPANY') return c.company_name
  return [c.first_name, c.last_name, c.second_last_name].filter(Boolean).join(' ')
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <View className="flex-row py-2.5 border-b border-zinc-50">
      <Text className="w-32 text-xs text-zinc-400 font-medium">{label}</Text>
      <Text className="flex-1 text-sm text-zinc-700">{value}</Text>
    </View>
  )
}

export default function ClienteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  const { data: clientData, isLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: () => clientesService.get(Number(id)),
  })

  const { data: equiposData } = useQuery({
    queryKey: ['equipment', 'client', id],
    queryFn: () => equiposService.list({ client: id }),
    enabled: !!id,
  })

  const { data: otData } = useQuery({
    queryKey: ['work-orders', 'client', id],
    queryFn: () => trabajosService.list({ client: id }),
    enabled: !!id,
  })

  const cliente = clientData?.data
  const equipos = equiposData?.data?.results ?? []
  const ots = otData?.data?.results ?? []

  if (isLoading || !cliente) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50 items-center justify-center">
        <ActivityIndicator color={colors.orange} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['bottom']}>
      <View className="px-4 py-3 flex-row items-center gap-3" style={{ backgroundColor: colors.navy }}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white font-bold text-lg">{clientDisplayName(cliente)}</Text>
          <Text className="text-blue-200 text-xs">{cliente.type === 'COMPANY' ? 'Empresa' : 'Persona'}</Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-4">
        <View className="bg-white rounded-2xl p-4 border border-zinc-100">
          <Text className="text-sm font-semibold text-zinc-700 mb-2">Información</Text>
          <InfoRow label="Email" value={cliente.email} />
          <InfoRow label="Teléfono" value={cliente.phone} />
          <InfoRow label="RUT / ID" value={cliente.identity_key} />
          <InfoRow label="Dirección" value={cliente.address} />
        </View>

        {equipos.length > 0 && (
          <View className="bg-white rounded-2xl p-4 border border-zinc-100">
            <Text className="text-sm font-semibold text-zinc-700 mb-3">Equipos ({equipos.length})</Text>
            {equipos.map((eq: any) => (
              <TouchableOpacity
                key={eq.id}
                onPress={() => router.push(`/equipos/${eq.id}` as any)}
                className="flex-row items-center py-2.5 border-b border-zinc-50 gap-2"
              >
                <Wrench size={14} color={colors.muted} />
                <Text className="flex-1 text-sm text-zinc-700">
                  {[eq.brand, eq.model].filter(Boolean).join(' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {ots.length > 0 && (
          <View className="bg-white rounded-2xl p-4 border border-zinc-100">
            <Text className="text-sm font-semibold text-zinc-700 mb-3">Órdenes de trabajo ({ots.length})</Text>
            {ots.slice(0, 5).map((ot: any) => (
              <TouchableOpacity
                key={ot.id}
                onPress={() => router.push(`/trabajos/${ot.id}` as any)}
                className="flex-row items-center py-2.5 border-b border-zinc-50 gap-2"
              >
                <FileText size={14} color={colors.muted} />
                <Text className="flex-1 text-sm text-zinc-700">{ot.number}</Text>
                <Text className="text-xs text-zinc-400">{ot.work_status}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
