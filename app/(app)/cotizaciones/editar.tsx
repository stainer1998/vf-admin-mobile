import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react-native'
import { cotizacionesService } from '@/api/services/cotizaciones'
import { LineasEditor, type Linea } from '@/components/LineasEditor'
import { colors } from '@/theme'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <View className="gap-1.5">
      <Text className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
        {label}{required && <Text className="text-red-500"> *</Text>}
      </Text>
      {children}
    </View>
  )
}

const inputClass = "bg-white border border-zinc-200 rounded-xl px-4 py-3.5 text-sm text-zinc-800"

export default function EditarCotizacionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['quote', id],
    queryFn: () => cotizacionesService.get(Number(id)),
  })

  const quote = data?.data

  const [validityDays, setValidityDays] = useState('30')
  const [notes, setNotes] = useState('')
  const [lineas, setLineas] = useState<Linea[]>([])
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (quote && !initialized) {
      setValidityDays(String(quote.validity_days))
      setNotes(quote.notes ?? '')
      setLineas(
        (quote.lines ?? []).map((l) => ({
          line_type: l.line_type,
          service: l.service,
          product: l.product,
          description: l.description,
          unit_price: l.unit_price,
          unit_cost: l.unit_cost,
          quantity: l.quantity,
        }))
      )
      setInitialized(true)
    }
  }, [quote, initialized])

  const mutation = useMutation({
    mutationFn: () =>
      cotizacionesService.update(Number(id), {
        validity_days: parseInt(validityDays, 10) || 30,
        notes,
        lines: lineas.map((l) => ({
          line_type: l.line_type,
          service: l.service,
          product: l.product,
          description: l.description,
          unit_price: l.unit_price,
          unit_cost: l.unit_cost,
          quantity: l.quantity,
        })),
      } as Parameters<typeof cotizacionesService.update>[1]),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quote', id] })
      qc.invalidateQueries({ queryKey: ['quotes'] })
      router.back()
    },
    onError: () => Alert.alert('Error', 'No se pudo guardar los cambios.'),
  })

  if (isLoading || !initialized) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50 items-center justify-center">
        <ActivityIndicator color={colors.orange} />
      </SafeAreaView>
    )
  }

  if (quote?.status !== 'DRAFT') {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50" edges={['bottom']}>
        <View className="px-4 py-3 flex-row items-center gap-3" style={{ backgroundColor: colors.navy }}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">Editar cotización</Text>
        </View>
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-zinc-500 text-sm text-center">
            Solo se pueden editar cotizaciones en estado Borrador.
          </Text>
          <TouchableOpacity onPress={() => router.back()} className="mt-4">
            <Text className="text-sm font-semibold" style={{ color: colors.orange }}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['bottom']}>
      <View className="px-4 py-3 flex-row items-center gap-3" style={{ backgroundColor: colors.navy }}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg flex-1">Editar {quote?.folio}</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-5"
        keyboardShouldPersistTaps="handled"
      >
        {/* Cliente (solo lectura) */}
        <Field label="Cliente">
          <View className="bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-3.5">
            <Text className="text-sm text-zinc-500">{quote?.client_name}</Text>
          </View>
        </Field>

        {/* Validez */}
        <Field label="Días de validez">
          <TextInput
            value={validityDays}
            onChangeText={setValidityDays}
            keyboardType="number-pad"
            className={inputClass}
            placeholderTextColor={colors.muted}
          />
        </Field>

        {/* Notas */}
        <Field label="Notas">
          <TextInput
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className={`${inputClass} min-h-[80px]`}
            placeholderTextColor={colors.muted}
          />
        </Field>

        {/* Líneas */}
        <Field label="Servicios y repuestos">
          <LineasEditor value={lineas} onChange={setLineas} />
        </Field>
      </ScrollView>

      <View className="p-4 bg-white border-t border-zinc-100">
        <TouchableOpacity
          onPress={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="rounded-xl py-4 items-center"
          style={{ backgroundColor: colors.orange }}
          activeOpacity={0.8}
        >
          {mutation.isPending
            ? <ActivityIndicator color="#fff" />
            : <Text className="text-white font-bold text-base">Guardar cambios</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
