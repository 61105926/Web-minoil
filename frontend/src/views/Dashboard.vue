<template>
  <MainLayout>
    <div>
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">Vista general del sistema</p>
      </div>

      <!-- Estadísticas -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6">
          <div class="flex items-center">
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Empleados</p>
              <p class="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{{ empleados.length }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div class="flex items-center">
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Solicitudes</p>
              <p class="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">-</p>
            </div>
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div class="flex items-center">
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Reportes</p>
              <p class="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">-</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      <!-- Lista de Empleados -->
      <Card className="p-6">
        <div class="mb-6">
          <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">Últimos Empleados</h2>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Consulta de empleados desde SAP HANA</p>
        </div>

        <div v-if="loading" class="text-center py-12">
          <p class="text-gray-600 dark:text-gray-400">Cargando empleados...</p>
        </div>

        <div v-else-if="error" class="text-center py-12">
          <p class="text-red-600 dark:text-red-400">{{ error }}</p>
          <Button @click="fetchEmpleados" className="mt-4" size="sm">
            Reintentar
          </Button>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nombre
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Apellido
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Puesto
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="empleado in empleados.slice(0, 10)"
                :key="empleado.ID"
                class="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {{ empleado.ID }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {{ empleado.NOMBRE }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {{ empleado.APELLIDO }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {{ empleado.EMAIL }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {{ empleado.PUESTO }}
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="empleados.length === 0" class="text-center py-12">
            <p class="text-gray-600 dark:text-gray-400">No se encontraron empleados</p>
          </div>

          <div v-if="empleados.length > 10" class="mt-4 text-center">
            <router-link
              to="/empleados"
              class="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
            >
              Ver todos los empleados →
            </router-link>
          </div>
        </div>
      </Card>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MainLayout from '@/components/layouts/MainLayout.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import empleadosService, { type Empleado } from '@/services/empleados.service'

const empleados = ref<Empleado[]>([])
const loading = ref(false)
const error = ref('')

const fetchEmpleados = async () => {
  loading.value = true
  error.value = ''

  try {
    empleados.value = await empleadosService.getEmpleados()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al cargar empleados'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchEmpleados()
})
</script>
