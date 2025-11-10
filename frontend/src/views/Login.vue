<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors">
    <Card className="w-full max-w-md p-8">
      <div class="mb-8 text-center">
        <!-- Logo Minoil - se adapta al tema -->
        <div class="mb-6 flex justify-center">
          <img
            :src="logoPath"
            alt="Minoil S.A."
            class="h-40 w-auto max-w-xs"
          />
        </div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Iniciar Sesión</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">Ingresa tus credenciales para continuar</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Usuario
          </label>
          <Input
            id="username"
            v-model="username"
            type="text"
            placeholder="Ingresa tu usuario"
            required
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Contraseña
          </label>
          <Input
            id="password"
            v-model="password"
            type="password"
            placeholder="Ingresa tu contraseña"
            required
          />
        </div>

        <div v-if="error" class="text-red-600 dark:text-red-400 text-sm text-center">
          {{ error }}
        </div>

        <Button
          type="submit"
          className="w-full"
          :disabled="loading"
        >
          {{ loading ? 'Cargando...' : 'Iniciar Sesión' }}
        </Button>
      </form>

      <div class="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
        <p>Demo: usuario: <strong>admin</strong> / contraseña: <strong>admin123</strong></p>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import authService from '@/services/auth.service'
import { useTheme } from '@/composables/useTheme'

const router = useRouter()
const { theme } = useTheme()
const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const logoPath = computed(() => {
  return theme.value === 'dark' ? '/logo-minoil-black.png' : '/logo-minoil-white.png'
})

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    await authService.login({
      username: username.value,
      password: password.value
    })
    router.push('/dashboard')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.'
  } finally {
    loading.value = false
  }
}
</script>
