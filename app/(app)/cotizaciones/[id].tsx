import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react-native'
import { cotizacionesService } from '@/api/services/cotizaciones'
import { colors } from '@/theme'
import { formatDate, formatMoney } from '@/utils/format'
import type { QuoteStatus } from '@/types'

const STATUS_LABEL: Record<QuoteStatus, string> = {
  DRAFT: 'Borrador',
  SENT: 'Enviada',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
  EXPIRED: 'Vencida',
}

const STATUS_COLOR: Record<QuoteStatus, string> = {
  DRAFT: '#d97706',
  SENT: '#2563eb',
  APPROVED: '#16a34a',
  REJECTED: '#ef4444',
  EXPIRED: '#6b7280',
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

export default function CotizacionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  const { data, isLoading } = useQuery({
    queryKey: ['quote', id],
    queryFn: () => cotizacionesService.get(Number(id)),
  })

  const quote = data?.data
  if (isLoading || !quote) {
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
          <Text className="text-white font-bold text-lg">{quote.folio}</Text>
          <Text className="text-blue-200 text-xs">{quote.client_name}</Text>
        </View>
        <View className="rounded-full px-3 py-1" style={{ backgroundColor: STATUS_COLOR[quote.status] + '30' }}>
          <Text className="text-xs font-semibold" style={{ color: STATUS_COLOR[quote.status] }}>
            {STATUS_LABEL[quote.status] ?? quote.status}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-4">
        <View className="bg-white rounded-2xl p-4 border border-zinc-100">
          <Text className="text-sm font-semibold text-zinc-700 mb-2">Información</Text>
          <InfoRow label="Cliente" value={quote.client_name} />
          <InfoRow label="Fecha" value={formatDate(quote.date)} />
          <InfoRow label="Validez" value={`${quote.validity_days} días`} />
          {quote.notes && <InfoRow label="Notas" value={quote.notes} />}
        </View>

        {quote.lines && quote.lines.length > 0 && (
          <View className="bg-white rounded-2xl p-4 border border-zinc-100">
            <Text className="text-sm font-semibold text-zinc-700 mb-3">Líneas</Text>
            {quote.lines.map((line, i) => (
              <View key={i} className="flex-row justify-between py-2 border-b border-zinc-50">
                <Text className="flex-1 text-sm text-zinc-700 pr-2">{line.description}</Text>
                <Text className="text-sm font-semibold text-zinc-900">
                  {formatMoney(Number(line.unit_price) * line.quantity)}
                </Text>
              </View>
            ))}
            <View className="flex-row justify-between pt-3">
              <Text className="text-sm font-bold text-zinc-700">Total</Text>
              <Text className="text-base font-bold" style={{ color: colors.orange }}>
                {formatMoney(quote.total)}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
