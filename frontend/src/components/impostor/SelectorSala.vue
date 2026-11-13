<template>
  <div class="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div class="border-b border-gray-200 p-4 dark:border-gray-700">
      <label for="buscar-sala" class="sr-only">Buscar sala</label>
      <div class="relative">
        <svg class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          id="buscar-sala"
          v-model="busqueda"
          type="search"
          autocomplete="off"
          placeholder="Buscar por nombre, alias o código"
          class="h-12 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:ring-blue-900"
        />
      </div>
      <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
        {{ filtradas.length }} de {{ salas.length }} salas
      </p>
    </div>

    <ul class="max-h-[60vh] divide-y divide-gray-100 overflow-y-auto dark:divide-gray-700">
      <li v-for="sala in filtradas" :key="sala.codigo">
        <button
          type="button"
          class="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none dark:hover:bg-gray-700 dark:focus:bg-gray-700"
          @click="$emit('select', sala)"
        >
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="truncate font-semibold text-gray-900 dark:text-gray-100">{{ sala.nombre || sala.codigo }}</span>
              <span v-if="sala.alias" class="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">{{ sala.alias }}</span>
            </div>
            <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {{ sala.codigo }}<span v-if="sala.glblLocNum"> · {{ sala.glblLocNum }}</span>
            </p>
          </div>
          <svg class="h-5 w-5 shrink-0 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </li>
      <li v-if="filtradas.length === 0" class="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
        No se encontraron salas con "{{ busqueda }}"
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Sala } from '@/services/salas.service'

const props = defineProps<{ salas: Sala[] }>()
defineEmits<{ (e: 'select', sala: Sala): void }>()

const busqueda = ref('')

const normalizar = (texto: string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const filtradas = computed(() => {
  const term = normalizar(busqueda.value.trim())
  if (!term) return props.salas
  return props.salas.filter((s) =>
    [s.nombre, s.alias, s.codigo].some((campo) => campo && normalizar(campo).includes(term)))
})
</script>
