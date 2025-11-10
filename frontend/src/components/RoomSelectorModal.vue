<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    @click.self="$emit('close')"
  >
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden">
      <div class="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 pb-4">
        <h2 class="text-2xl font-bold text-center">Seleccionar Sala</h2>
        <p class="text-blue-100 text-sm mt-2 text-center">Elige la sala donde realizarás el conteo</p>
      </div>

      <div class="p-6 space-y-4">
        <div class="relative">
          <svg
            class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Buscar sala..."
            class="w-full pl-10 h-11 border-2 border-blue-200 dark:border-blue-700 rounded-lg focus:border-blue-500 focus:outline-none px-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            autofocus
          />
        </div>

        <div class="h-96 border-2 border-blue-100 dark:border-blue-800 rounded-xl overflow-y-auto">
          <div class="space-y-2 p-4">
            <button
              v-for="room in filteredRooms"
              :key="room.codigo"
              @click="handleSelect(room)"
              class="w-full flex items-center justify-start p-4 hover:bg-blue-50 dark:hover:bg-gray-700 text-left rounded-lg border border-transparent hover:border-blue-300 dark:hover:border-blue-600 transition-all group"
            >
              <svg
                class="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="font-semibold text-gray-900 dark:text-gray-100">{{ room.nombre || room.alias || room.codigo }}</span>
            </button>
            <div v-if="filteredRooms.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No se encontraron salas</p>
            </div>
          </div>
        </div>

        <p class="text-xs text-center text-gray-500 dark:text-gray-400">
          {{ filteredRooms.length }} de {{ rooms.length }} sala{{ rooms.length !== 1 ? 's' : '' }} disponible{{ rooms.length !== 1 ? 's' : '' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

export interface Sala {
  codigo: string
  nombre: string
  alias: string
  glblLocNum: string
}

interface Props {
  open: boolean
  rooms: Sala[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'select', room: Sala): void
  (e: 'close'): void
}>()

const searchTerm = ref('')

const filteredRooms = computed(() => {
  if (!searchTerm.value) return props.rooms
  const term = searchTerm.value.toLowerCase()
  return props.rooms.filter(room => 
    room.nombre.toLowerCase().includes(term) ||
    room.alias?.toLowerCase().includes(term) ||
    room.codigo.toLowerCase().includes(term)
  )
})

const handleSelect = (room: Sala) => {
  emit('select', room)
  searchTerm.value = ''
}
</script>

