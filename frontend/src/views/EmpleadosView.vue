<template>
  <MainLayout>
    <div>
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Empleados</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">Gestión de empleados</p>
      </div>

      <Card className="p-6">
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
                v-for="empleado in empleados"
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

