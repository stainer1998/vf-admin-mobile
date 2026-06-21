import { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react-native'
import { inventarioService } from '@/api/services/inventario'
import { colors } from '@/theme'
import { formatMoney } from '@/utils/format'
import type { Product } from '@/types'

function ProductCard({ item }: { item: Product }) {
  const stock = item.stock ?? 0
  const isLow = stock === 0

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-zinc-100 shadow-sm flex-row items-center gap-3">
      <View className="flex-1">
        <Text className="font-semibold text-zinc-900 text-sm">{item.name}</Text>
        {item.code && <Text className="text-xs text-zinc-400 mt-0.5">Cód: {item.code}</Text>}
        {item.sale_price && (
          <Text className="text-xs text-zinc-500 mt-1">{formatMoney(item.sale_price)}</Text>
        )}
      </View>
      <View
        className="rounded-full px-3 py-1"
        style={{ backgroundColor: isLow ? '#fef2f2' : '#f0fdf4' }}
      >
        <Text
          className="text-sm font-bold"
          style={{ color: isLow ? colors.red : colors.green }}
        >
          {stock}
        </Text>
      </View>
    </View>
  )
}

export default function InventarioScreen() {
  const [search, setSearch] = useState('')

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['products', search],
    queryFn: () => inventarioService.listProducts(search ? { search } : undefined),
  })

  const items = data?.data?.results ?? []

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['bottom']}>
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center bg-white rounded-xl border border-zinc-200 px-3 gap-2">
          <Search size={16} color={colors.muted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar producto…"
            className="flex-1 py-3 text-sm text-zinc-800"
            placeholderTextColor={colors.muted}
            returnKeyType="search"
          />
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.orange} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <ProductCard item={item} />}
          contentContainerClassName="px-4 pt-2 pb-8"
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.orange} />}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-zinc-400 text-sm">No hay productos.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}
