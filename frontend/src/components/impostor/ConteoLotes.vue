<template>
  <div class="space-y-3">
    <div
      v-for="(lote, idx) in producto.lotes"
      :key="`${producto.id}-${idx}`"
      class="rounded-xl border bg-white p-4 transition-colors dark:bg-gray-800"
      :class="valor(idx) === undefined
        ? 'border-gray-200 dark:border-gray-700'
        : 'border-green-300 dark:border-green-700'"
    >
      <div class="mb-3 flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Lote</p>
          <p class="truncate font-mono text-sm font-bold text-gray-900 dark:text-gray-100">{{ lote.lote }}</p>
        </div>
        <div class="shrink-0 text-right">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Vence</p>
          <span
            class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
            :class="badgeVence[estadoVencimiento(lote.fechaVencimiento)]"
          >
            {{ fechaCorta(lote.fechaVencimiento) }}
            <span v-if="estadoVencimiento(lote.fechaVencimiento) === 'vencido'">· vencido</span>
            <span v-else-if="estadoVencimiento(lote.fechaVencimiento) === 'pronto'">· {{ diasParaVencer(lote.fechaVencimiento) }} d</span>
          </span>
        </div>
      </div>

      <div class="flex items-stretch gap-2">
        <button
          type="button"
          class="h-14 w-14 shrink-0 rounded-lg border border-gray-300 text-2xl font-bold text-gray-700 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-40 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          :disabled="!valor(idx)"
          :aria-label="`Restar uno al lote ${lote.lote}`"
          @click="cambiar(idx, (valor(idx) ?? 0) - 1)"
        >−</button>
        <input
          :ref="(el) => { inputs[idx] = el as HTMLInputElement | null }"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          autocomplete="off"
          enterkeyhint="next"
          :value="valor(idx) ?? ''"
          :aria-label="`Cantidad en ${modo} del lote ${lote.lote}`"
          placeholder="0"
          class="h-14 min-w-0 flex-1 rounded-lg border-2 border-blue-500 bg-white text-center text-2xl font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-200 dark:border-blue-400 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-600 dark:focus:ring-blue-900"
          @input="onInput(idx, $event)"
          @focus="($event.target as HTMLInputElement).select()"
          @keydown.enter.prevent="siguiente(idx)"
        />
        <button
          type="button"
          class="h-14 w-14 shrink-0 rounded-lg border border-gray-300 text-2xl font-bold text-gray-700 hover:bg-gray-100 active:bg-gray-200 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          :aria-label="`Sumar uno al lote ${lote.lote}`"
          @click="cambiar(idx, (valor(idx) ?? 0) + 1)"
        >+</button>
      </div>

      <div class="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
        <span v-if="referencia" class="text-gray-500 dark:text-gray-400">
          {{ referencia.label }}: <strong class="text-gray-700 dark:text-gray-300">{{ referencia.valores[idx] ?? '-' }}</strong>
        </span>
        <span v-else-if="lote.facturado > 0" class="text-gray-500 dark:text-gray-400">
          Último facturado: <strong class="text-gray-700 dark:text-gray-300">{{ lote.facturado }}</strong>
        </span>
        <span
          v-if="sospechoso(idx)"
          class="font-medium text-amber-600 dark:text-amber-400"
        >Verifica: es mucho más de lo facturado</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { fechaCorta } from '@/utils/informe-reposicion-pdf'
import { diasParaVencer, estadoVencimiento, type EstadoVencimiento, type ProductoReposicion } from './types'

const props = defineProps<{
  producto: ProductoReposicion
  cantidades: Record<number, number | undefined>
  modo: 'sala' | 'bodega'
  /** Valores a mostrar como referencia bajo cada lote (p. ej. lo contado en sala al contar bodega). */
  referencia?: { label: string; valores: Record<number, number | undefined> }
}>()

const emit = defineEmits<{
  (e: 'update', loteIdx: number, value: number | undefined): void
  /** Enter en el último lote: el padre decide si avanza. */
  (e: 'submit'): void
}>()

const inputs = ref<(HTMLInputElement | null)[]>([])

const badgeVence: Record<EstadoVencimiento, string> = {
  vencido: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  pronto: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
  ok: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
  'sin-fecha': 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
}

const valor = (idx: number) => props.cantidades[idx]

const cambiar = (idx: number, value: number | undefined) => {
  emit('update', idx, value === undefined ? undefined : Math.max(0, Math.floor(value)))
}

const onInput = (idx: number, event: Event) => {
  const input = event.target as HTMLInputElement
  const digits = input.value.replace(/\D/g, '').slice(0, 6)
  if (digits !== input.value) input.value = digits
  cambiar(idx, digits === '' ? undefined : Number(digits))
}

/** Más de 3 veces lo facturado (y al menos 10 unidades de diferencia): probable error de tipeo. */
const sospechoso = (idx: number) => {
  const v = valor(idx)
  const facturado = props.producto.lotes[idx]?.facturado ?? 0
  return props.modo === 'sala' && v !== undefined && facturado > 0 && v > facturado * 3 && v - facturado >= 10
}

const siguiente = (idx: number) => {
  const next = inputs.value[idx + 1]
  if (next) next.focus()
  else emit('submit')
}

const enfocarPrimero = async () => {
  await nextTick()
  const vacio = props.producto.lotes.findIndex((_, i) => valor(i) === undefined)
  inputs.value[vacio >= 0 ? vacio : 0]?.focus()
}

onMounted(enfocarPrimero)
watch(() => `${props.modo}-${props.producto.id}`, () => {
  inputs.value = []
  enfocarPrimero()
})
</script>
