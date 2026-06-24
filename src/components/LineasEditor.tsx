import { useState } from 'react'
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native'
import { Plus, Trash2, Wrench, Package } from 'lucide-react-native'
import { ItemSearchModal, type SearchItem } from './ItemSearchModal'
import { catalogoService } from '@/api/services/catalogo'
import { inventarioService } from '@/api/services/inventario'
import { colors } from '@/theme'
import { formatMoney } from '@/utils/format'

export interface Linea {
  line_type: 'SERVICE' | 'PRODUCT'
  service: number | null
  product: number | null
  description: string
  unit_price: string
  unit_cost: string
  quantity: number
}

interface Props {
  value: Linea[]
  onChange: (lines: Linea[]) => void
}

export function LineasEditor({ value, onChange }: Props) {
  const [showServicio, setShowServicio] = useState(false)
  const [showProducto, setShowProducto] = useState(false)

  const addServicio = (item: SearchItem) => {
    onChange([
      ...value,
      {
        line_type: 'SERVICE',
        service: item.id,
        product: null,
        description: item.name,
        unit_price: item.price,
        unit_cost: '0',
        quantity: 1,
      },
    ])
  }

  const addProducto = (item: SearchItem) => {
    onChange([
      ...value,
      {
        line_type: 'PRODUCT',
        service: null,
        product: item.id,
        description: item.name,
        unit_price: item.price,
        unit_cost: '0',
        quantity: 1,
      },
    ])
  }

  const remove = (index: number) => {
    Alert.alert('Eliminar línea', '¿Quitar esta línea?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: () => onChange(value.filter((_, i) => i !== index)),
      },
    ])
  }

  const updateQty = (index: number, qty: string) => {
    const n = parseInt(qty, 10)
    if (isNaN(n) || n < 1) return
    const updated = [...value]
    updated[index] = { ...updated[index], quantity: n }
    onChange(updated)
  }

  const total = value.reduce((sum, l) => sum + Number(l.unit_price) * l.quantity, 0)

  return (
    <View className="gap-3">
      {value.map((line, i) => (
        <View key={i} className="bg-white rounded-xl border border-zinc-100 p-3">
          <View className="flex-row items-start justify-between gap-2">
            <View className="flex-row items-center gap-1.5 flex-1">
              {line.line_type === 'SERVICE'
                ? <Wrench size={13} color={colors.navy} />
                : <Package size={13} color="#7c3aed" />
              }
              <Text className="text-sm text-zinc-800 flex-1" numberOfLines={2}>
                {line.description}
              </Text>
            </View>
            <TouchableOpacity onPress={() => remove(i)} hitSlop={8}>
              <Trash2 size={16} color={colors.red} />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-between mt-2">
            <View className="flex-row items-center gap-2">
              <Text className="text-xs text-zinc-400">Cant.</Text>
              <TextInput
                value={String(line.quantity)}
                onChangeText={(v) => updateQty(i, v)}
                keyboardType="number-pad"
                className="w-12 text-center text-sm font-semibold text-zinc-800 border border-zinc-200 rounded-lg py-1"
              />
            </View>
            <Text className="text-sm font-bold" style={{ color: colors.navy }}>
              {formatMoney(Number(line.unit_price) * line.quantity)}
            </Text>
          </View>
        </View>
      ))}

      {value.length > 0 && (
        <View className="flex-row justify-between px-1">
          <Text className="text-sm font-semibold text-zinc-600">Total</Text>
          <Text className="text-base font-bold" style={{ color: colors.orange }}>
            {formatMoney(total)}
          </Text>
        </View>
      )}

      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={() => setShowServicio(true)}
          className="flex-1 flex-row items-center justify-center gap-1.5 py-3 rounded-xl border border-dashed border-blue-300 bg-blue-50"
          activeOpacity={0.7}
        >
          <Plus size={14} color={colors.navy} />
          <Text className="text-xs font-semibold" style={{ color: colors.navy }}>Servicio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowProducto(true)}
          className="flex-1 flex-row items-center justify-center gap-1.5 py-3 rounded-xl border border-dashed border-purple-300 bg-purple-50"
          activeOpacity={0.7}
        >
          <Plus size={14} color="#7c3aed" />
          <Text className="text-xs font-semibold text-purple-700">Repuesto</Text>
        </TouchableOpacity>
      </View>

      <ItemSearchModal
        visible={showServicio}
        title="Servicio"
        queryKey="catalogo-search"
        queryFn={(search) =>
          catalogoService.list(search ? { search } : undefined).then((r) => ({
            data: {
              results: r.data.results
                .filter((s) => s.is_active)
                .map((s) => ({ id: s.id, name: s.name, price: s.sale_price })),
            },
          }))
        }
        onClose={() => setShowServicio(false)}
        onSelect={addServicio}
      />

      <ItemSearchModal
        visible={showProducto}
        title="Repuesto/Producto"
        queryKey="productos-search"
        queryFn={(search) =>
          inventarioService.listProducts(search ? { search } : undefined).then((r) => ({
            data: {
              results: r.data.results.map((p) => ({
                id: p.id,
                name: p.name,
                price: p.sale_price ?? '0',
              })),
            },
          }))
        }
        onClose={() => setShowProducto(false)}
        onSelect={addProducto}
      />
    </View>
  )
}
