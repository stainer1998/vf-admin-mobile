import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronDown } from 'lucide-react-native'
import { trabajosService } from '@/api/services/trabajos'
import { ClienteSearchModal } from '@/components/ClienteSearchModal'
import { EquipoSelectModal } from '@/components/EquipoSelectModal'
import { LineasEditor, type Linea } from '@/components/LineasEditor'
import { colors } from '@/theme'
import type { Client, Equipment, FaultType } from '@/types'
import { FAULT_TYPE_LABELS } from '@/types'

const FAULT_OPTIONS = Object.entries(FAULT_TYPE_LABELS) as [FaultType, string][]

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

export default function EditarTrabajoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['work-order', id],
    queryFn: () => trabajosService.get(Number(id)),
  })

  const ot = data?.data

  const [cliente, setCliente] = useState<Client | null>(null)
  const [equipo, setEquipo] = useState<Equipment | null>(null)
  const [faultType, setFaultType] = useState<FaultType | ''>('')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [lineas, setLineas] = useState<Linea[]>([])
  const [showCliente, setShowCliente] = useState(false)
  const [showEquipo, setShowEquipo] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (ot && !initialized) {
      setCliente({ id: ot.client, first_name: ot.client_name, last_name: '', type: 'PERSON' } as Client)
      if (ot.equipment) {
        const [brand, ...rest] = (ot.equipment_label ?? '').split(' ')
        setEquipo({ id: ot.equipment, brand, model: rest.join(' ') } as Equipment)
      }
      setFaultType(ot.fault_type ?? '')
      setDescription(ot.work_description ?? '')
      setNotes(ot.notes ?? '')
      setLineas(
        (ot.lines ?? []).map((l) => ({
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
  }, [ot, initialized])

  const mutation = useMutation({
    mutationFn: () =>
      trabajosService.update(Number(id), {
        work_description: description,
        notes,
        fault_type: faultType || undefined,
        lines: lineas.map((l) => ({
          line_type: l.line_type,
          service: l.service,
          product: l.product,
          description: l.description,
          unit_price: l.unit_price,
          unit_cost: l.unit_cost,
          quantity: l.quantity,
        })),
      } as Parameters<typeof trabajosService.update>[1]),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['work-order', id] })
      qc.invalidateQueries({ queryKey: ['work-orders'] })
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

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['bottom']}>
      <View className="px-4 py-3 flex-row items-center gap-3" style={{ backgroundColor: colors.navy }}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg flex-1">Editar OT {ot?.number}</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-5"
        keyboardShouldPersistTaps="handled"
      >
        {/* Cliente (solo lectura en edición) */}
        <Field label="Cliente">
          <View className="bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-3.5">
            <Text className="text-sm text-zinc-500">{ot?.client_name}</Text>
          </View>
        </Field>

        {/* Equipo (solo lectura en edición) */}
        {equipo && (
          <Field label="Equipo">
            <View className="bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-3.5">
              <Text className="text-sm text-zinc-500">{ot?.equipment_label}</Text>
            </View>
          </Field>
        )}

        {/* Tipo de falla */}
        <Field label="Tipo de falla">
          <TouchableOpacity
            onPress={() =>
              Alert.alert('Tipo de falla', undefined, [
                ...FAULT_OPTIONS.map(([value, label]) => ({
                  text: label,
                  onPress: () => setFaultType(value),
                })),
                { text: 'Sin especificar', onPress: () => setFaultType('') },
                { text: 'Cancelar', style: 'cancel' as const },
              ])
            }
            className="bg-white border border-zinc-200 rounded-xl px-4 py-3.5 flex-row items-center justify-between"
            activeOpacity={0.7}
          >
            <Text className={`text-sm ${faultType ? 'text-zinc-800' : 'text-zinc-400'}`}>
              {faultType ? FAULT_TYPE_LABELS[faultType] : 'Sin especificar'}
            </Text>
            <ChevronDown size={16} color={colors.muted} />
          </TouchableOpacity>
        </Field>

        {/* Descripción */}
        <Field label="Descripción del trabajo">
          <TextInput
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className={`${inputClass} min-h-[80px]`}
            placeholderTextColor={colors.muted}
          />
        </Field>

        {/* Notas */}
        <Field label="Notas internas">
          <TextInput
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
            textAlignVertical="top"
            className={`${inputClass} min-h-[60px]`}
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

      <ClienteSearchModal
        visible={showCliente}
        onClose={() => setShowCliente(false)}
        onSelect={(c) => setCliente(c)}
      />
      <EquipoSelectModal
        visible={showEquipo}
        clientId={cliente?.id ?? null}
        onClose={() => setShowEquipo(false)}
        onSelect={(e) => setEquipo(e)}
      />
    </SafeAreaView>
  )
}
