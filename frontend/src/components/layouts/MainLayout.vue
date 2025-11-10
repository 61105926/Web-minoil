<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:translate-x-0'
      ]"
    >
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <img
            :src="theme === 'light' ? '/logo-minoil-white.png' : '/logo-minoil-black.png'"
            alt="Minoil S.A."
            class="h-12 w-auto"
          />
          <button
            @click="isSidebarOpen = false"
            class="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <router-link
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors"
            :class="[
              route.path === item.path
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            <Icon :name="item.icon" class="w-5 h-5 mr-3" />
            <span>{{ item.label }}</span>
          </router-link>
        </nav>

        <!-- User Section -->
        <div class="p-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {{ userInitials }}
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ user?.username }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Usuario</p>
              </div>
            </div>
          </div>
          <Button @click="handleLogout" variant="outline" size="sm" class="w-full">
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </aside>

    <!-- Overlay para mobile -->
    <div
      v-if="isSidebarOpen"
      @click="isSidebarOpen = false"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
    ></div>

    <!-- Main Content -->
    <div class="lg:pl-64">
      <!-- Top Bar -->
      <header class="sticky top-0 z-30 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <button
            @click="isSidebarOpen = !isSidebarOpen"
            class="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div class="flex-1 flex items-center justify-end space-x-4">
            <!-- Theme Toggle -->
            <button
              @click="toggleTheme"
              class="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              :title="theme === 'light' ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro'"
            >
              <svg v-if="theme === 'light'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="p-4 sm:p-6 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Button from '@/components/ui/Button.vue'
import authService from '@/services/auth.service'
import Icon from '@/components/ui/Icon.vue'
import { useTheme } from '@/composables/useTheme'

const router = useRouter()
const route = useRoute()
const { theme, toggleTheme } = useTheme()
const isSidebarOpen = ref(false)

const user = computed(() => authService.getUser())
const userInitials = computed(() => {
  const username = user.value?.username || 'U'
  return username.charAt(0).toUpperCase()
})

type IconName = 'home' | 'users' | 'calendar' | 'chart' | 'cog' | 'document'

const menuItems: Array<{ label: string; path: string; icon: IconName }> = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'home'
  },
  {
    label: 'Empleados',
    path: '/empleados',
    icon: 'users'
  },
  {
    label: 'Vacaciones',
    path: '/vacaciones',
    icon: 'calendar'
  },
  {
    label: 'Reportes',
    path: '/reportes',
    icon: 'chart'
  },
  {
    label: 'Configuración',
    path: '/configuracion',
    icon: 'cog'
  }
]

const handleLogout = () => {
  authService.logout()
  router.push('/login')
}
</script>

