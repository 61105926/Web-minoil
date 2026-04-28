<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
    <p class="text-gray-600 dark:text-gray-400">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import authService from '@/services/auth.service'

const router = useRouter()
const message = ref('Autenticando...')

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const code   = params.get('code')
  const state  = params.get('state')
  const error  = params.get('error')

  if (error) {
    message.value = 'Error de autenticación. Redirigiendo...'
    setTimeout(() => router.push('/'), 2000)
    return
  }

  if (!code || !state) {
    router.push('/')
    return
  }

  try {
    await authService.handleCallback(code, state)
    router.push('/dashboard')
  } catch (err) {
    console.error('Error en callback:', err)
    message.value = 'Error al procesar la autenticación. Redirigiendo...'
    setTimeout(() => router.push('/'), 2000)
  }
})
</script>
