/**
 * Modal genérico de búsqueda para servicios o productos.
 * Recibe una queryFn y renderiza los resultados.
 */
import { useState } from 'react'
import {
  Modal, View, Text, TextInput, FlatList,
  TouchableOpacity, ActivityIndicator, Pressable,
} from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { Search, X } from 'lucide-react-native'
import { colors } from '@/theme'

export interface SearchItem {
  id: number
  name: string
  price: string
}

interface Props {
  visible: boolean
  title: string
  queryKey: string
  queryFn: (search: string) => Promise<{ data: { results: SearchItem[] } }>
  onClose: () => void
  onSelect: (item: SearchItem) => void
}

export function ItemSearchModal({ visible, title, queryKey, queryFn, onClose, onSelect }: Props) {
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: [queryKey, search],
    queryFn: () => queryFn(search),
    enabled: visible,
  })

  const items = data?.data?.results ?? []

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 bg-zinc-50">
        <View className="px-4 pt-4 pb-3 bg-white border-b border-zinc-100 flex-row items-center gap-3">
          <View className="flex-1 flex-row items-center bg-zinc-100 rounded-xl px-3 gap-2">
            <Search size={15} color={colors.muted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={`Buscar ${title.toLowerCase()}…`}
              autoFocus
              className="flex-1 py-3 text-sm text-zinc-800"
              placeholderTextColor={colors.muted}
            />
          </View>
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
            ListEmptyComponent={
              <View className="items-center py-12">
                <Text className="text-zinc-400 text-sm">Sin resultados</Text>
              </View>
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() => { onSelect(item); onClose() }}
                className="bg-white rounded-xl p-4 border border-zinc-100 active:bg-zinc-50 flex-row items-center justify-between"
              >
                <Text className="font-semibold text-zinc-900 text-sm flex-1 pr-4">{item.name}</Text>
                <Text className="text-sm font-bold" style={{ color: colors.orange }}>
                  ${Number(item.price).toLocaleString('es-CL')}
                </Text>
              </Pressable>
            )}
          />
        )}
      </View>
    </Modal>
  )
}
