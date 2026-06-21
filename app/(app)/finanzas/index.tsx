import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { finanzasService } from '@/api/services/finanzas'
import { colors } from '@/theme'
import { formatMoney, formatDate } from '@/utils/format'

const TX_TYPE_LABEL: Record<string, string> = {
  INCOME: 'Ingreso',
  EXPENSE: 'Gasto',
  ADJUSTMENT: 'Ajuste',
}

const TX_TYPE_COLOR: Record<string, string> = {
  INCOME: colors.green,
  EXPENSE: colors.red,
  ADJUSTMENT: '#2563eb',
}

export default function FinanzasScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['transactions', 'recientes'],
    queryFn: () => finanzasService.listTransactions({ page_size: '20', ordering: '-date' }),
  })

  const transacciones = data?.data?.results ?? []

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-4"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.orange} />}
      >
        {isLoading ? (
          <View className="items-center py-16">
            <ActivityIndicator color={colors.orange} />
          </View>
        ) : (
          <View className="bg-white rounded-2xl border border-zinc-100">
            <View className="px-4 py-3 border-b border-zinc-50">
              <Text className="text-sm font-semibold text-zinc-700">Transacciones recientes</Text>
            </View>
            {transacciones.length === 0 ? (
              <View className="items-center py-10">
                <Text className="text-zinc-400 text-sm">Sin transacciones.</Text>
              </View>
            ) : (
              transacciones.map((tx: any, i: number) => (
                <View key={tx.id} className="flex-row items-center px-4 py-3 border-b border-zinc-50">
                  <View className="flex-1">
                    <Text className="text-sm text-zinc-700 font-medium">{tx.description}</Text>
                    <Text className="text-xs text-zinc-400 mt-0.5">
                      {TX_TYPE_LABEL[tx.transaction_type]} · {formatDate(tx.date)}
                    </Text>
                  </View>
                  <Text
                    className="text-sm font-bold"
                    style={{ color: TX_TYPE_COLOR[tx.transaction_type] }}
                  >
                    {tx.transaction_type === 'EXPENSE' ? '-' : ''}{formatMoney(tx.amount)}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
