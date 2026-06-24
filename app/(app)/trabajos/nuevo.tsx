import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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

export default function NuevoTrabajoScreen() {
  const qc = useQueryClient()

  const [cliente, setCliente] = useState<Client | null>(null)
  const [equipo, setEquipo] = useState<Equipment | null>(null)
  const [faultType, setFaultType] = useState<FaultType | ''>('')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [lineas, setLineas] = useState<Linea[]>([])
  const [showCliente, setShowCliente] = useState(false)
  const [showEquipo, setShowEquipo] = useState(false)

  const mutation = useMutation({
    mutationFn: () =>
      trabajosService.create({
        client: cliente!.id,
        equipment: equipo?.id ?? undefined,
        fault_type: faultType || undefined,
        work_description: description,
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
      } as Parameters<typeof trabajosService.create>[0]),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['work-orders'] })
      router.replace(`/trabajos/${res.data.id}`)
    },
    onError: () => Alert.alert('Error', 'No se pudo crear la OT. Verifica los datos e intenta nuevamente.'),
  })

  const handleSubmit = () => {
    if (!cliente) {
      Alert.alert('Cliente requerido', 'Selecciona un cliente para continuar.')
      return
    }
    mutation.mutate()
  }

  const handleSelectCliente = (c: Client) => {
    setCliente(c)
    setEquipo(null)
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['bottom']}>
      <View className="px-4 py-3 flex-row items-center gap-3" style={{ backgroundColor: colors.navy }}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg flex-1">Nueva OT</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-5"
        keyboardShouldPersistTaps="handled"
      >
        {/* Cliente */}
        <Field label="Cliente" required>
          <TouchableOpacity
            onPress={() => setShowCliente(true)}
            className="bg-white border border-zinc-200 rounded-xl px-4 py-3.5 flex-row items-center justify-between"
            activeOpacity={0.7}
          >
            <Text className={`text-sm ${cliente ? 'text-zinc-800' : 'text-zinc-400'}`}>
              {cliente
                ? (cliente.type === 'COMPANY' ? cliente.company_name : `${cliente.first_name} ${cliente.last_name}`)
                : 'Seleccionar cliente…'}
            </Text>
            <ChevronDown size={16} color={colors.muted} />
          </TouchableOpacity>
        </Field>

        {/* Equipo */}
        <Field label="Equipo">
          <TouchableOpacity
            onPress={() => {
              if (!cliente) { Alert.alert('', 'Selecciona un cliente primero.'); return }
              setShowEquipo(true)
            }}
            className="bg-white border border-zinc-200 rounded-xl px-4 py-3.5 flex-row items-center justify-between"
            activeOpacity={0.7}
          >
            <Text className={`text-sm ${equipo ? 'text-zinc-800' : 'text-zinc-400'}`}>
              {equipo ? `${equipo.brand} ${equipo.model}` : 'Seleccionar equipo (opcional)…'}
            </Text>
            <ChevronDown size={16} color={colors.muted} />
          </TouchableOpacity>
        </Field>

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
            placeholder="Describe el trabajo a realizar…"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className={`${inputClass} min-h-[80px]`}
            placeholderTextColor={colors.muted}
          />
        </Field>

        {/* Notas internas */}
        <Field label="Notas internas">
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Notas internas (no visibles al cliente)…"
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
          onPress={handleSubmit}
          disabled={mutation.isPending}
          className="rounded-xl py-4 items-center"
          style={{ backgroundColor: colors.orange }}
          activeOpacity={0.8}
        >
          {mutation.isPending
            ? <ActivityIndicator color="#fff" />
            : <Text className="text-white font-bold text-base">Crear orden de trabajo</Text>
          }
        </TouchableOpacity>
      </View>

      <ClienteSearchModal
        visible={showCliente}
        onClose={() => setShowCliente(false)}
        onSelect={handleSelectCliente}
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
