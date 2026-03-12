<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors">
    <Card className="w-full max-w-md p-8 text-center">
      <div class="mb-8 flex justify-center">
        <img :src="logoPath" alt="Minoil S.A." class="h-40 w-auto max-w-xs" />
      </div>

      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Iniciar Sesión</h1>
      <p class="text-gray-600 dark:text-gray-400 mb-8">Accede con tu cuenta corporativa</p>

      <div v-if="error" class="text-red-600 dark:text-red-400 text-sm mb-4">{{ error }}</div>

      <Button className="w-full" :disabled="loading" @click="handleLogin">
        {{ loading ? 'Redirigiendo...' : 'Iniciar Sesión con Keycloak' }}
      </Button>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import authService from '@/services/auth.service'
import { useTheme } from '@/composables/useTheme'

const { theme } = useTheme()
const loading = ref(false)
const error = ref('')

const logoPath = computed(() =>
  theme.value === 'dark' ? '/logo-minoil-black.png' : '/logo-minoil-white.png'
)

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    await authService.startLogin()
  } catch {
    error.value = 'No se pudo conectar con el servidor de autenticación'
    loading.value = false
  }
}
</script>
