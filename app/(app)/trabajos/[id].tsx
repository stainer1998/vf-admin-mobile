import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Pencil } from 'lucide-react-native'
import { trabajosService } from '@/api/services/trabajos'
import { colors } from '@/theme'
import { formatDate, formatMoney } from '@/utils/format'
import type { WorkStatus } from '@/types'

const STATUS_OPTIONS: { value: WorkStatus; label: string }[] = [
  { value: 'RECEIVED', label: 'Recibido' },
  { value: 'IN_PROGRESS', label: 'En proceso' },
  { value: 'READY', label: 'Listo para entrega' },
  { value: 'DELIVERED', label: 'Entregado' },
]

const STATUS_COLOR: Record<WorkStatus, string> = {
  RECEIVED: '#d97706',
  IN_PROGRESS: '#2563eb',
  READY: '#16a34a',
  DELIVERED: '#6b7280',
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

export default function TrabajoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['work-order', id],
    queryFn: () => trabajosService.get(Number(id)),
  })

  const mutation = useMutation({
    mutationFn: (work_status: WorkStatus) => trabajosService.update(Number(id), { work_status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['work-order', id] })
      qc.invalidateQueries({ queryKey: ['work-orders'] })
    },
  })

  const ot = data?.data
  if (isLoading || !ot) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50 items-center justify-center">
        <ActivityIndicator color={colors.orange} />
      </SafeAreaView>
    )
  }

  const handleChangeStatus = () => {
    Alert.alert(
      'Cambiar estado',
      'Selecciona el nuevo estado:',
      [
        ...STATUS_OPTIONS.map((opt) => ({
          text: opt.label,
          onPress: () => mutation.mutate(opt.value),
        })),
        { text: 'Cancelar', style: 'cancel' as const },
      ],
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['bottom']}>
      <View className="px-4 py-3 flex-row items-center gap-3" style={{ backgroundColor: colors.navy }}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white font-bold text-lg">{ot.number}</Text>
          <Text className="text-blue-200 text-xs">{ot.client_name}</Text>
        </View>
        <View className="rounded-full px-3 py-1 mr-2" style={{ backgroundColor: STATUS_COLOR[ot.work_status] + '30' }}>
          <Text className="text-xs font-semibold" style={{ color: STATUS_COLOR[ot.work_status] }}>
            {STATUS_OPTIONS.find(s => s.value === ot.work_status)?.label ?? ot.work_status}
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push(`/trabajos/editar?id=${ot.id}`)}>
          <Pencil size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-4">
        <View className="bg-white rounded-2xl p-4 border border-zinc-100">
          <Text className="text-sm font-semibold text-zinc-700 mb-2">Información</Text>
          <InfoRow label="Cliente" value={ot.client_name} />
          <InfoRow label="Equipo" value={ot.equipment_label} />
          <InfoRow label="Ingreso" value={formatDate(ot.intake_date)} />
          <InfoRow label="Descripción" value={ot.work_description} />
          {ot.notes && <InfoRow label="Notas" value={ot.notes} />}
        </View>

        {ot.lines && ot.lines.length > 0 && (
          <View className="bg-white rounded-2xl p-4 border border-zinc-100">
            <Text className="text-sm font-semibold text-zinc-700 mb-3">Líneas</Text>
            {ot.lines.map((line, i) => (
              <View key={i} className="flex-row justify-between py-2 border-b border-zinc-50">
                <Text className="flex-1 text-sm text-zinc-700 pr-2">{line.description}</Text>
                <Text className="text-sm font-semibold text-zinc-900">
                  {formatMoney(Number(line.unit_price) * line.quantity)}
                </Text>
              </View>
            ))}
            {ot.amount_charged && (
              <View className="flex-row justify-between pt-3">
                <Text className="text-sm font-bold text-zinc-700">Total cobrado</Text>
                <Text className="text-base font-bold" style={{ color: colors.orange }}>
                  {formatMoney(ot.amount_charged)}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <View className="p-4 bg-white border-t border-zinc-100">
        <TouchableOpacity
          onPress={handleChangeStatus}
          disabled={mutation.isPending}
          className="rounded-xl py-3.5 items-center"
          style={{ backgroundColor: colors.navy }}
          activeOpacity={0.8}
        >
          {mutation.isPending
            ? <ActivityIndicator color="#fff" />
            : <Text className="text-white font-bold">Cambiar estado</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
