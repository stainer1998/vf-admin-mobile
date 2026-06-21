import { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { Search, Plus } from 'lucide-react-native'
import { trabajosService } from '@/api/services/trabajos'
import { colors } from '@/theme'
import type { WorkOrderListItem } from '@/types'

const STATUS_LABEL: Record<string, string> = {
  RECEIVED: 'Recibido',
  IN_PROGRESS: 'En proceso',
  READY: 'Listo',
  DELIVERED: 'Entregado',
}

const STATUS_COLOR: Record<string, string> = {
  RECEIVED: '#d97706',
  IN_PROGRESS: '#2563eb',
  READY: '#16a34a',
  DELIVERED: '#6b7280',
}

function WorkOrderCard({ item }: { item: WorkOrderListItem }) {
  return (
    <TouchableOpacity
      onPress={() => router.push(`/trabajos/${item.id}`)}
      className="bg-white rounded-2xl p-4 mb-3 border border-zinc-100 shadow-sm"
      activeOpacity={0.7}
    >
      <View className="flex-row items-start justify-between mb-2">
        <Text className="font-bold text-zinc-900 text-base">{item.number}</Text>
        <View className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: STATUS_COLOR[item.work_status] + '20' }}>
          <Text className="text-xs font-semibold" style={{ color: STATUS_COLOR[item.work_status] }}>
            {STATUS_LABEL[item.work_status] ?? item.work_status}
          </Text>
        </View>
      </View>
      <Text className="text-sm text-zinc-600">{item.client_name}</Text>
    </TouchableOpacity>
  )
}

export default function TrabajosScreen() {
  const [search, setSearch] = useState('')

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['work-orders', search],
    queryFn: () => trabajosService.list(search ? { search } : undefined),
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
            placeholder="Buscar OT, cliente…"
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
          renderItem={({ item }) => <WorkOrderCard item={item} />}
          contentContainerClassName="px-4 pt-2 pb-8"
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.orange} />}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-zinc-400 text-sm">No hay órdenes de trabajo.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        onPress={() => router.push('/trabajos/nuevo')}
        className="absolute bottom-8 right-6 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        style={{ backgroundColor: colors.orange }}
        activeOpacity={0.8}
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  )
}
