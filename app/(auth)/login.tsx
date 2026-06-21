import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native'
import { useAuthStore } from '@/auth/store'

export default function LoginScreen() {
  const { login } = useAuthStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) return
    setLoading(true)
    try {
      await login(username.trim(), password)
    } catch {
      Alert.alert('Error', 'Usuario o contraseña incorrectos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-navy"
    >
      <View className="flex-1 justify-center px-8">
        {/* Logo */}
        <View className="mb-10">
          <Text className="text-3xl font-bold text-white">
            VF <Text className="text-orange-500">Digital</Text>
          </Text>
          <Text className="text-sm text-blue-200 mt-1">Solutions — Panel de gestión</Text>
        </View>

        {/* Form */}
        <View className="space-y-4">
          <View>
            <Text className="text-xs text-blue-200 mb-1.5 font-medium uppercase tracking-wide">
              Usuario
            </Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 text-white text-base"
              placeholderTextColor="rgba(255,255,255,0.4)"
              placeholder="nombre_usuario"
            />
          </View>

          <View>
            <Text className="text-xs text-blue-200 mb-1.5 font-medium uppercase tracking-wide">
              Contraseña
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 text-white text-base"
              placeholderTextColor="rgba(255,255,255,0.4)"
              placeholder="••••••••"
            />
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading || !username || !password}
            className="bg-orange-500 rounded-xl py-4 mt-2 items-center disabled:opacity-50"
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text className="text-white font-bold text-base">Iniciar sesión</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
