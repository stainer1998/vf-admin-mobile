import { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { Search, Plus, User, Building2 } from 'lucide-react-native'
import { clientesService } from '@/api/services/clientes'
import { colors } from '@/theme'
import type { Client } from '@/types'

function clientDisplayName(c: Client): string {
  if (c.type === 'COMPANY') return c.company_name
  return [c.first_name, c.last_name, c.second_last_name].filter(Boolean).join(' ')
}

function ClientCard({ item }: { item: Client }) {
  const isEmpresa = item.type === 'COMPANY'
  return (
    <TouchableOpacity
      onPress={() => router.push(`/clientes/${item.id}`)}
      className="bg-white rounded-2xl p-4 mb-3 border border-zinc-100 shadow-sm flex-row items-center gap-3"
      activeOpacity={0.7}
    >
      <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: colors.navyLight }}>
        {isEmpresa
          ? <Building2 size={18} color={colors.navy} />
          : <User size={18} color={colors.navy} />
        }
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-zinc-900 text-sm">{clientDisplayName(item)}</Text>
        {item.email && <Text className="text-xs text-zinc-400 mt-0.5">{item.email}</Text>}
        {item.phone && <Text className="text-xs text-zinc-400">{item.phone}</Text>}
      </View>
      <Text className="text-xs text-zinc-300">{isEmpresa ? 'Empresa' : 'Persona'}</Text>
    </TouchableOpacity>
  )
}

export default function ClientesScreen() {
  const [search, setSearch] = useState('')

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['clients', search],
    queryFn: () => clientesService.list(search ? { search } : undefined),
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
            placeholder="Buscar cliente…"
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
          renderItem={({ item }) => <ClientCard item={item} />}
          contentContainerClassName="px-4 pt-2 pb-8"
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.orange} />}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-zinc-400 text-sm">No hay clientes.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        onPress={() => router.push('/clientes/nuevo')}
        className="absolute bottom-8 right-6 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        style={{ backgroundColor: colors.orange }}
        activeOpacity={0.8}
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  )
}
