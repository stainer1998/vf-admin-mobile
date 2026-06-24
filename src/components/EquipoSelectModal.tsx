import {
  Modal, View, Text, FlatList,
  TouchableOpacity, ActivityIndicator, Pressable,
} from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react-native'
import { equiposService } from '@/api/services/equipos'
import { colors } from '@/theme'
import type { Equipment } from '@/types'

interface Props {
  visible: boolean
  clientId: number | null
  onClose: () => void
  onSelect: (equipment: Equipment) => void
}

const TYPE_LABEL: Record<string, string> = {
  NOTEBOOK: 'Notebook', DESKTOP: 'Desktop', AIO: 'All-in-One', MINIPC: 'Mini PC',
}

export function EquipoSelectModal({ visible, clientId, onClose, onSelect }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['equipment-by-client', clientId],
    queryFn: () => equiposService.list({ client: String(clientId) }),
    enabled: visible && clientId != null,
  })

  const items = data?.data?.results ?? []

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 bg-zinc-50">
        <View className="px-4 pt-4 pb-3 bg-white border-b border-zinc-100 flex-row items-center justify-between">
          <Text className="font-bold text-zinc-900 text-base">Seleccionar equipo</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={20} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={colors.orange} />
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.id)}
            contentContainerClassName="p-4 gap-2"
            ListHeaderComponent={
              <Pressable
                onPress={() => onClose()}
                className="bg-white rounded-xl p-4 border border-dashed border-zinc-300 mb-2 active:bg-zinc-50"
              >
                <Text className="text-sm text-zinc-400 text-center">Sin equipo asociado</Text>
              </Pressable>
            }
            ListEmptyComponent={
              <View className="items-center py-8">
                <Text className="text-zinc-400 text-sm">Este cliente no tiene equipos registrados.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() => { onSelect(item); onClose() }}
                className="bg-white rounded-xl p-4 border border-zinc-100 active:bg-zinc-50"
              >
                <Text className="font-semibold text-zinc-900 text-sm">
                  {item.brand} {item.model}
                </Text>
                <Text className="text-xs text-zinc-400 mt-0.5">
                  {TYPE_LABEL[item.type] ?? item.type}
                  {item.serial_number ? ` · ${item.serial_number}` : ''}
                </Text>
              </Pressable>
            )}
          />
        )}
      </View>
    </Modal>
  )
}
