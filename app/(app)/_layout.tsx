import { Tabs } from 'expo-router'
import { useAuthStore } from '@/auth/store'
import { colors } from '@/theme'
import {
  LayoutDashboard, Wrench, FileText, Users, Package, Wallet,
} from 'lucide-react-native'

export default function AppLayout() {
  const { user } = useAuthStore()
  const rol = user?.rol

  const showTrabajo = rol === 'TECNICO' || rol === 'ADMIN'
  const showCotizacion = rol === 'VENDEDOR' || rol === 'ADMIN'
  const showInventario = rol === 'VENDEDOR' || rol === 'ADMIN'
  const showFinanzas = rol === 'ADMIN'

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        headerStyle: { backgroundColor: colors.navy },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <LayoutDashboard size={22} color={color} />,
          headerTitle: 'VF Admin',
        }}
      />
      <Tabs.Screen
        name="trabajos"
        options={{
          title: 'Trabajos',
          tabBarIcon: ({ color }) => <Wrench size={22} color={color} />,
          href: showTrabajo ? '/trabajos' : null,
        }}
      />
      <Tabs.Screen
        name="cotizaciones"
        options={{
          title: 'Cotizaciones',
          tabBarIcon: ({ color }) => <FileText size={22} color={color} />,
          href: showCotizacion ? '/cotizaciones' : null,
        }}
      />
      <Tabs.Screen
        name="clientes"
        options={{
          title: 'Clientes',
          tabBarIcon: ({ color }) => <Users size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="inventario"
        options={{
          title: 'Inventario',
          tabBarIcon: ({ color }) => <Package size={22} color={color} />,
          href: showInventario ? '/inventario' : null,
        }}
      />
      <Tabs.Screen
        name="finanzas"
        options={{
          title: 'Finanzas',
          tabBarIcon: ({ color }) => <Wallet size={22} color={color} />,
          href: showFinanzas ? '/finanzas' : null,
        }}
      />
    </Tabs>
  )
}
