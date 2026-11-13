<template>
  <MainLayout>
    <div class="mx-auto max-w-2xl pb-28">
      <!-- Encabezado -->
      <header class="mb-5">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Relevamiento Impostor</h1>
            <p v-if="sala" class="mt-0.5 truncate text-sm font-medium text-blue-600 dark:text-blue-400">{{ nombreSala }}</p>
            <p v-else class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Conteo de stock en sala y bodega</p>
          </div>
          <div v-if="enProgreso" class="shrink-0 text-right">
            <button
              v-if="!confirmarDescarte"
              type="button"
              class="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-gray-800"
              @click="confirmarDescarte = true"
            >Descartar</button>
            <div v-else class="flex items-center gap-2 text-sm">
              <span class="text-gray-600 dark:text-gray-300">¿Descartar el conteo?</span>
              <button type="button" class="rounded-lg bg-red-600 px-3 py-1.5 font-semibold text-white hover:bg-red-700" @click="reiniciar">Sí</button>
              <button type="button" class="rounded-lg px-3 py-1.5 font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800" @click="confirmarDescarte = false">No</button>
            </div>
          </div>
        </div>

        <!-- Pasos -->
        <ol v-if="pasoActual > 0" class="mt-4 grid grid-cols-4 gap-1.5" aria-label="Progreso">
          <li v-for="(paso, i) in PASOS" :key="paso">
            <div class="h-1.5 rounded-full" :class="i + 1 <= pasoActual ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'"></div>
            <p class="mt-1 truncate text-[11px] font-medium" :class="i + 1 === pasoActual ? 'text-blue-700 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'">{{ paso }}</p>
          </li>
        </ol>
      </header>

      <!-- 1. Seleccionar sala -->
      <section v-if="fase === 'seleccionar-sala'" class="space-y-4">
        <div
          v-if="borradorPendiente"
          class="rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/30"
        >
          <p class="font-semibold text-amber-900 dark:text-amber-200">Tienes un conteo sin terminar</p>
          <p class="mt-1 text-sm text-amber-800 dark:text-amber-300">
            {{ nombreDeSala(borradorPendiente.sala) }} · {{ resumenBorrador }} · {{ haceCuanto(borradorPendiente.actualizado) }}
          </p>
          <div class="mt-3 flex gap-2">
            <Button class="flex-1" @click="continuarBorrador">Continuar conteo</Button>
            <Button variant="outline" class="flex-1" @click="descartarBorrador">Descartar</Button>
          </div>
        </div>

        <div v-if="loadingSalas" class="flex flex-col items-center py-16 text-gray-500 dark:text-gray-400">
          <span class="mb-3 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></span>
          Cargando salas...
        </div>
        <div v-else-if="errorSalas" class="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/30">
          <p class="font-semibold text-red-700 dark:text-red-300">No se pudieron cargar las salas</p>
          <Button class="mt-3" @click="cargarSalas">Reintentar</Button>
        </div>
        <template v-else>
          <p class="text-sm text-gray-600 dark:text-gray-400">Elige la sala donde harás el conteo.</p>
          <SelectorSala :salas="salasDisponibles" @select="seleccionarSala" />
        </template>
      </section>

      <!-- Cargando productos -->
      <section v-else-if="fase === 'cargando-productos'" class="flex flex-col items-center py-20 text-gray-500 dark:text-gray-400">
        <span class="mb-3 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></span>
        Cargando productos de la sala...
      </section>

      <!-- 2. Seleccionar productos -->
      <section v-else-if="fase === 'seleccionar-productos'" class="space-y-3">
        <div class="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div class="space-y-3 border-b border-gray-200 p-4 dark:border-gray-700">
            <p class="text-sm text-gray-600 dark:text-gray-400">Marca los productos que vas a contar.</p>
            <input
              v-model="busquedaProducto"
              type="search"
              autocomplete="off"
              placeholder="Buscar producto"
              aria-label="Buscar producto"
              class="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:ring-blue-900"
            />
            <div class="flex items-center justify-between text-sm">
              <span class="font-medium text-gray-700 dark:text-gray-300">{{ seleccionados.length }} de {{ productosBase.length }} seleccionados</span>
              <div class="flex gap-1">
                <button type="button" class="rounded-lg px-2.5 py-1 font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700" @click="marcarFiltrados(true)">Todos</button>
                <button type="button" class="rounded-lg px-2.5 py-1 font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700" @click="marcarFiltrados(false)">Ninguno</button>
              </div>
            </div>
          </div>
          <ul class="max-h-[55vh] divide-y divide-gray-100 overflow-y-auto dark:divide-gray-700">
            <li v-for="producto in productosFiltrados" :key="producto.id">
              <label class="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <input
                  type="checkbox"
                  class="h-5 w-5 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  :checked="seleccionados.includes(producto.id)"
                  @change="toggleProducto(producto.id)"
                />
                <span class="min-w-0 flex-1">
                  <span class="block font-semibold text-gray-900 dark:text-gray-100">{{ producto.item }}</span>
                  <span class="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    {{ producto.lotes.length }} lote{{ producto.lotes.length === 1 ? '' : 's' }}
                    <span
                      v-if="alertaVencimiento(producto)"
                      class="rounded-full px-2 py-0.5 font-semibold"
                      :class="alertaVencimiento(producto) === 'vencido'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'"
                    >{{ alertaVencimiento(producto) === 'vencido' ? 'Lote vencido' : 'Vence pronto' }}</span>
                  </span>
                </span>
              </label>
            </li>
            <li v-if="productosFiltrados.length === 0" class="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              Ningún producto coincide con "{{ busquedaProducto }}"
            </li>
          </ul>
        </div>
      </section>

      <!-- 3. Conteo en sala / 5. Conteo en bodega -->
      <section v-else-if="(fase === 'sala' || fase === 'bodega') && productoActual" class="space-y-4">
        <div class="flex items-center justify-between text-sm">
          <span class="font-semibold text-gray-700 dark:text-gray-300">
            {{ fase === 'sala' ? 'Conteo en sala' : 'Conteo en bodega' }}
          </span>
          <span class="text-gray-500 dark:text-gray-400">Producto {{ indexActual + 1 }} de {{ productos.length }}</span>
        </div>
        <div class="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            class="h-full rounded-full bg-blue-600 transition-all dark:bg-blue-500"
            :style="{ width: `${((indexActual + (productoCompleto ? 1 : 0)) / productos.length) * 100}%` }"
          ></div>
        </div>

        <div class="rounded-2xl bg-blue-600 p-4 text-white shadow-sm dark:bg-blue-700">
          <p class="text-xs font-semibold uppercase tracking-wide text-blue-100">Producto</p>
          <p class="mt-0.5 text-lg font-bold leading-tight">{{ productoActual.item }}</p>
          <p class="mt-1 font-mono text-xs text-blue-100">{{ productoActual.codigoProducto }}</p>
        </div>

        <ConteoLotes
          :producto="productoActual"
          :modo="fase"
          :cantidades="(fase === 'sala' ? conteoSala : conteoBodega)[productoActual.id] ?? {}"
          :referencia="fase === 'bodega' ? { label: 'Contado en sala', valores: conteoSala[productoActual.id] ?? {} } : undefined"
          @update="(idx, valor) => setCantidad(fase === 'sala' ? conteoSala : conteoBodega, idx, valor)"
          @submit="siguiente"
        />
      </section>

      <!-- 4. ¿Tiene bodega? -->
      <section v-else-if="fase === 'pregunta-bodega'" class="space-y-4">
        <div class="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
            <svg class="h-7 w-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Conteo en sala completo · {{ productos.length }} productos</p>
          <h2 class="mt-2 text-xl font-bold text-gray-900 dark:text-gray-100">¿Esta sala tiene bodega?</h2>
          <div class="mt-5 grid gap-3">
            <Button class="h-14 text-base font-bold" @click="responderBodega(true)">Sí, contar bodega</Button>
            <Button variant="outline" class="h-14 text-base font-bold" @click="responderBodega(false)">No tiene bodega</Button>
          </div>
        </div>
      </section>

      <!-- 6. Resumen -->
      <section v-else-if="fase === 'resumen'" class="space-y-4">
        <div
          class="flex items-start gap-3 rounded-2xl border p-4"
          :class="{
            'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/30': estadoGuardado === 'pendiente' || estadoGuardado === 'guardando',
            'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/30': estadoGuardado === 'guardado',
            'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/30': estadoGuardado === 'error',
          }"
          role="status"
        >
          <span v-if="estadoGuardado === 'guardando'" class="mt-0.5 h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600"></span>
          <div class="min-w-0 flex-1 text-sm">
            <template v-if="estadoGuardado === 'pendiente'">
              <p class="font-semibold text-blue-900 dark:text-blue-200">Revisa el conteo antes de guardarlo</p>
              <p class="mt-0.5 text-blue-800 dark:text-blue-300">Todavía no se guardó en el sistema.</p>
            </template>
            <p v-else-if="estadoGuardado === 'guardando'" class="font-semibold text-blue-900 dark:text-blue-200">Guardando conteo...</p>
            <template v-else-if="estadoGuardado === 'guardado'">
              <p class="font-semibold text-green-800 dark:text-green-200">Conteo guardado</p>
              <p class="mt-0.5 text-green-700 dark:text-green-300">{{ registros.length }} registros registrados en el sistema.</p>
            </template>
            <template v-else>
              <p class="font-semibold text-red-800 dark:text-red-200">No se pudo guardar</p>
              <p class="mt-0.5 text-red-700 dark:text-red-300">{{ errorGuardado }} Tu conteo sigue guardado en este dispositivo.</p>
            </template>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Total sala</p>
            <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{{ totalSala }}</p>
          </div>
          <div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Total bodega</p>
            <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{{ tieneBodega ? totalBodega : '—' }}</p>
          </div>
          <div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Productos</p>
            <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{{ productos.length }}</p>
          </div>
        </div>

        <div
          v-for="grupo in productosInforme"
          :key="grupo.item"
          class="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
        >
          <p class="border-b border-gray-200 bg-gray-50 px-4 py-2.5 font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-100">{{ grupo.item }}</p>
          <table class="w-full text-sm">
            <thead>
              <tr class="text-xs text-gray-500 dark:text-gray-400">
                <th class="px-4 py-2 text-left font-medium">Lote</th>
                <th class="px-2 py-2 text-left font-medium">Vence</th>
                <th class="px-2 py-2 text-right font-medium">Sala</th>
                <th class="px-4 py-2 text-right font-medium">Bodega</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr v-for="lote in grupo.lotes" :key="lote.lote">
                <td class="px-4 py-2 font-mono text-xs text-gray-900 dark:text-gray-100">{{ lote.lote }}</td>
                <td class="px-2 py-2 text-xs text-gray-600 dark:text-gray-400">{{ fechaCorta(lote.fechaVencimiento) }}</td>
                <td class="px-2 py-2 text-right font-bold text-gray-900 dark:text-gray-100">{{ lote.cantidadSala }}</td>
                <td class="px-4 py-2 text-right">
                  <span v-if="lote.cantidadBodega === null" class="text-xs text-gray-400 dark:text-gray-500">Sin bodega</span>
                  <span v-else class="font-bold text-gray-900 dark:text-gray-100">{{ lote.cantidadBodega }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <!-- Barra de acciones fija -->
    <div
      v-if="hayBarraAcciones"
      class="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95 lg:left-64"
      style="padding-bottom: max(0.75rem, env(safe-area-inset-bottom))"
    >
      <div class="mx-auto flex max-w-2xl gap-3">
        <template v-if="fase === 'seleccionar-productos'">
          <Button variant="outline" class="h-12 flex-1" @click="cambiarSala">Cambiar sala</Button>
          <Button class="h-12 flex-[2] font-bold" :disabled="seleccionados.length === 0" @click="iniciarConteo">
            Contar {{ seleccionados.length || '' }} producto{{ seleccionados.length === 1 ? '' : 's' }}
          </Button>
        </template>

        <template v-else-if="fase === 'sala' || fase === 'bodega' || fase === 'pregunta-bodega'">
          <Button variant="outline" class="h-12 flex-1" @click="anterior">Anterior</Button>
          <Button v-if="fase !== 'pregunta-bodega'" class="h-12 flex-[2] font-bold" :disabled="!productoCompleto" @click="siguiente">
            {{ textoSiguiente }}
          </Button>
        </template>

        <template v-else-if="fase === 'resumen'">
          <template v-if="estadoGuardado === 'guardado'">
            <Button variant="outline" class="h-12 flex-1" :disabled="generandoPdf" @click="descargarPdf">
              {{ generandoPdf ? 'Generando...' : 'Descargar PDF' }}
            </Button>
            <Button class="h-12 flex-1 font-bold" @click="reiniciar">Nueva reposición</Button>
          </template>
          <template v-else>
            <Button variant="outline" class="h-12 flex-1" :disabled="estadoGuardado === 'guardando'" @click="editarConteo">Editar</Button>
            <Button class="h-12 flex-[2] font-bold" :disabled="estadoGuardado === 'guardando'" @click="guardar">
              {{ estadoGuardado === 'error' ? 'Reintentar guardado' : estadoGuardado === 'guardando' ? 'Guardando...' : 'Guardar conteo' }}
            </Button>
          </template>
        </template>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import MainLayout from '@/components/layouts/MainLayout.vue'
import Button from '@/components/ui/Button.vue'
import ConteoLotes from '@/components/impostor/ConteoLotes.vue'
import SelectorSala from '@/components/impostor/SelectorSala.vue'
import { estadoVencimiento, type Cantidades, type ProductoReposicion } from '@/components/impostor/types'
import salasService, { type Sala } from '@/services/salas.service'
import productosService from '@/services/productos.service'
import impostorService from '@/services/impostor.service'
import authService from '@/services/auth.service'
import { useToast } from '@/composables/useToast'
import { descargarInformeReposicion, fechaCorta, type ProductoInforme } from '@/utils/informe-reposicion-pdf'

type Fase = 'seleccionar-sala' | 'cargando-productos' | 'seleccionar-productos' | 'sala' | 'pregunta-bodega' | 'bodega' | 'resumen'
type EstadoGuardado = 'pendiente' | 'guardando' | 'guardado' | 'error'

const PASOS = ['Productos', 'Sala', 'Bodega', 'Guardar']
const BORRADOR_KEY = 'minoil:reposicion-impostor:borrador:v1'

interface Borrador {
  version: 1
  fase: Fase
  sala: Sala
  productosBase: ProductoReposicion[]
  seleccionados: string[]
  productos: ProductoReposicion[]
  conteoSala: Cantidades
  conteoBodega: Cantidades
  tieneBodega: boolean | null
  indexActual: number
  conteoId: string
  actualizado: string
}

const toast = useToast()

const fase = ref<Fase>('seleccionar-sala')
const sala = ref<Sala | null>(null)
const productosBase = ref<ProductoReposicion[]>([])
const seleccionados = ref<string[]>([])
const productos = ref<ProductoReposicion[]>([])
const conteoSala = ref<Cantidades>({})
const conteoBodega = ref<Cantidades>({})
const tieneBodega = ref<boolean | null>(null)
const indexActual = ref(0)
const conteoId = ref('')
const estadoGuardado = ref<EstadoGuardado>('pendiente')
const errorGuardado = ref('')

const salasDisponibles = ref<Sala[]>([])
const loadingSalas = ref(false)
const errorSalas = ref(false)
const busquedaProducto = ref('')
const borradorPendiente = ref<Borrador | null>(null)
const confirmarDescarte = ref(false)
const generandoPdf = ref(false)

// ---------- Derivados ----------

const nombreDeSala = (s: Sala) => (s.alias ? `${s.nombre || s.codigo} (${s.alias})` : s.nombre || s.codigo)
const nombreSala = computed(() => (sala.value ? nombreDeSala(sala.value) : ''))

const productoActual = computed(() => productos.value[indexActual.value])

const productoCompleto = computed(() => {
  const p = productoActual.value
  if (!p) return false
  const conteo = (fase.value === 'bodega' ? conteoBodega.value : conteoSala.value)[p.id] ?? {}
  return p.lotes.every((_, i) => conteo[i] !== undefined)
})

const enProgreso = computed(() => !['seleccionar-sala', 'cargando-productos'].includes(fase.value)
  && estadoGuardado.value !== 'guardado')

const pasoActual = computed(() => ({
  'seleccionar-sala': 0, 'cargando-productos': 0, 'seleccionar-productos': 1,
  sala: 2, 'pregunta-bodega': 3, bodega: 3, resumen: 4,
}[fase.value]))

const hayBarraAcciones = computed(() => ['seleccionar-productos', 'sala', 'bodega', 'pregunta-bodega', 'resumen'].includes(fase.value))

const textoSiguiente = computed(() => {
  if (indexActual.value < productos.value.length - 1) return 'Siguiente producto'
  return fase.value === 'sala' ? 'Terminar sala' : 'Ver resumen'
})

const productosFiltrados = computed(() => {
  const term = busquedaProducto.value.trim().toLowerCase()
  return term ? productosBase.value.filter((p) => p.item.toLowerCase().includes(term)) : productosBase.value
})

const productosInforme = computed<ProductoInforme[]>(() => productos.value.map((p) => ({
  item: p.item,
  lotes: p.lotes.map((lote, i) => ({
    lote: lote.lote,
    fechaVencimiento: lote.fechaVencimiento,
    cantidadSala: conteoSala.value[p.id]?.[i] ?? 0,
    cantidadBodega: tieneBodega.value ? conteoBodega.value[p.id]?.[i] ?? 0 : null,
  })),
})))

const registros = computed(() => productos.value.flatMap((p, pi) => productosInforme.value[pi].lotes.map((lote) => ({
  CardCode: sala.value!.codigo,
  ItemCode: p.codigoProducto,
  BatchNum: lote.lote,
  StockSala: lote.cantidadSala,
  StockBodega: lote.cantidadBodega ?? 0,
}))))

const totalSala = computed(() => registros.value.reduce((acc, r) => acc + r.StockSala, 0))
const totalBodega = computed(() => registros.value.reduce((acc, r) => acc + r.StockBodega, 0))

const alertaVencimiento = (p: ProductoReposicion) => {
  const estados = p.lotes.map((l) => estadoVencimiento(l.fechaVencimiento))
  return estados.includes('vencido') ? 'vencido' : estados.includes('pronto') ? 'pronto' : null
}

// ---------- Salas y productos ----------

const cargarSalas = async () => {
  loadingSalas.value = true
  errorSalas.value = false
  try {
    const salas = await salasService.getSalas()
    const unicas = new Map<string, Sala>()
    for (const s of salas ?? []) if (s.codigo && !unicas.has(s.codigo)) unicas.set(s.codigo, s)
    salasDisponibles.value = [...unicas.values()]
  } catch {
    errorSalas.value = true
  } finally {
    loadingSalas.value = false
  }
}

const seleccionarSala = async (s: Sala) => {
  sala.value = s
  fase.value = 'cargando-productos'
  try {
    const data = await productosService.getProductosPorSala(s.codigo)
    productosBase.value = (data ?? [])
      .filter((p) => p.nombreProducto?.trim())
      .map((p, index) => {
        const codigo = String(p.codigoProducto ?? '').trim() || String(index + 1)
        return {
          id: codigo,
          codigoProducto: codigo,
          item: p.nombreProducto.trim(),
          lotes: (p.lotes ?? [])
            .filter((l) => l.lote?.trim())
            .map((l) => ({ lote: l.lote.trim(), fechaVencimiento: l.fechaVencimiento || '', facturado: Number(l.cantidadVendida) || 0 })),
        }
      })
      .filter((p) => p.lotes.length > 0)

    if (!productosBase.value.length) {
      toast.warning('Sin productos', 'Esta sala no tiene productos Impostor con lotes facturados.')
      cambiarSala()
      return
    }
    seleccionados.value = []
    busquedaProducto.value = ''
    fase.value = 'seleccionar-productos'
  } catch (error: any) {
    toast.error('Error al cargar productos', error.response?.data?.message || error.message || 'Inténtalo nuevamente')
    cambiarSala()
  }
}

const cambiarSala = () => {
  sala.value = null
  productosBase.value = []
  seleccionados.value = []
  fase.value = 'seleccionar-sala'
}

const toggleProducto = (id: string) => {
  seleccionados.value = seleccionados.value.includes(id)
    ? seleccionados.value.filter((x) => x !== id)
    : [...seleccionados.value, id]
}

const marcarFiltrados = (marcar: boolean) => {
  const ids = new Set(productosFiltrados.value.map((p) => p.id))
  seleccionados.value = marcar
    ? [...new Set([...seleccionados.value, ...ids])]
    : seleccionados.value.filter((id) => !ids.has(id))
}

// ---------- Conteo ----------

const nuevoConteoId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto
  ? crypto.randomUUID()
  : `${Date.now()}-${Math.random().toString(36).slice(2)}`)

const iniciarConteo = () => {
  if (!seleccionados.value.length) return
  // Respetar el orden de la lista; conservar lo ya contado si se vuelve a esta pantalla.
  productos.value = productosBase.value.filter((p) => seleccionados.value.includes(p.id))
  if (!conteoId.value) conteoId.value = nuevoConteoId()
  indexActual.value = 0
  fase.value = 'sala'
}

const setCantidad = (destino: Cantidades, loteIdx: number, valor: number | undefined) => {
  const id = productoActual.value.id
  destino[id] = { ...(destino[id] ?? {}), [loteIdx]: valor }
}

const siguiente = () => {
  if (!productoCompleto.value) return
  if (indexActual.value < productos.value.length - 1) {
    indexActual.value++
  } else if (fase.value === 'sala') {
    fase.value = 'pregunta-bodega'
  } else {
    fase.value = 'resumen'
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const anterior = () => {
  if ((fase.value === 'sala' || fase.value === 'bodega') && indexActual.value > 0) {
    indexActual.value--
  } else if (fase.value === 'sala') {
    fase.value = 'seleccionar-productos'
  } else if (fase.value === 'pregunta-bodega') {
    indexActual.value = productos.value.length - 1
    fase.value = 'sala'
  } else if (fase.value === 'bodega') {
    fase.value = 'pregunta-bodega'
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const responderBodega = (respuesta: boolean) => {
  tieneBodega.value = respuesta
  indexActual.value = 0
  fase.value = respuesta ? 'bodega' : 'resumen'
}

const editarConteo = () => {
  indexActual.value = 0
  fase.value = 'sala'
}

// ---------- Guardado ----------

const guardar = async () => {
  if (!sala.value || !registros.value.length || estadoGuardado.value === 'guardando') return
  estadoGuardado.value = 'guardando'
  errorGuardado.value = ''
  try {
    await impostorService.insertarStock(registros.value, conteoId.value)
    estadoGuardado.value = 'guardado'
    borrarBorrador()
    toast.success('Conteo guardado', `${registros.value.length} registros de ${nombreSala.value}`)
  } catch (error: any) {
    estadoGuardado.value = 'error'
    errorGuardado.value = error.response?.data?.message || (error.message === 'Network Error'
      ? 'Sin conexión con el servidor.'
      : 'Ocurrió un error al guardar.')
  }
}

const descargarPdf = async () => {
  generandoPdf.value = true
  try {
    const user = authService.getUser()
    await descargarInformeReposicion({
      sala: nombreSala.value,
      empleado: user?.fullName || user?.username || '-',
      tieneBodega: !!tieneBodega.value,
      productos: productosInforme.value,
      totalSala: totalSala.value,
      totalBodega: totalBodega.value,
      guardado: estadoGuardado.value === 'guardado',
    })
  } catch {
    toast.error('No se pudo generar el PDF')
  } finally {
    generandoPdf.value = false
  }
}

const reiniciar = () => {
  borrarBorrador()
  confirmarDescarte.value = false
  conteoSala.value = {}
  conteoBodega.value = {}
  productos.value = []
  tieneBodega.value = null
  indexActual.value = 0
  conteoId.value = ''
  estadoGuardado.value = 'pendiente'
  errorGuardado.value = ''
  cambiarSala()
}

// ---------- Borrador local (sobrevive a recargas y cierres del navegador) ----------

function leerBorrador(): Borrador | null {
  try {
    const raw = localStorage.getItem(BORRADOR_KEY)
    const data = raw ? JSON.parse(raw) as Borrador : null
    return data?.version === 1 && data.sala && Array.isArray(data.productosBase) ? data : null
  } catch {
    return null
  }
}

function borrarBorrador() {
  borradorPendiente.value = null
  try { localStorage.removeItem(BORRADOR_KEY) } catch { /* almacenamiento no disponible */ }
}

const resumenBorrador = computed(() => {
  const b = borradorPendiente.value
  if (!b) return ''
  if (!b.productos.length) return `${b.productosBase.length} productos por elegir`
  const contados = b.productos.filter((p) => p.lotes.every((_, i) => b.conteoSala[p.id]?.[i] !== undefined)).length
  return `${contados} de ${b.productos.length} productos contados en sala`
})

const haceCuanto = (iso: string) => {
  const minutos = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (!Number.isFinite(minutos) || minutos < 1) return 'hace un momento'
  if (minutos < 60) return `hace ${minutos} min`
  const horas = Math.round(minutos / 60)
  return horas < 24 ? `hace ${horas} h` : `hace ${Math.round(horas / 24)} d`
}

const continuarBorrador = () => {
  const b = borradorPendiente.value
  if (!b) return
  sala.value = b.sala
  productosBase.value = b.productosBase
  seleccionados.value = b.seleccionados
  productos.value = b.productos
  conteoSala.value = b.conteoSala
  conteoBodega.value = b.conteoBodega
  tieneBodega.value = b.tieneBodega
  conteoId.value = b.conteoId
  estadoGuardado.value = 'pendiente'
  indexActual.value = Math.min(b.indexActual, Math.max(b.productos.length - 1, 0))
  fase.value = b.fase === 'cargando-productos' || b.fase === 'seleccionar-sala' ? 'seleccionar-productos' : b.fase
  borradorPendiente.value = null
}

const descartarBorrador = () => borrarBorrador()

watch(
  [fase, sala, seleccionados, productos, conteoSala, conteoBodega, tieneBodega, indexActual],
  () => {
    if (!enProgreso.value || !sala.value) return
    const borrador: Borrador = {
      version: 1,
      fase: fase.value,
      sala: sala.value,
      productosBase: productosBase.value,
      seleccionados: seleccionados.value,
      productos: productos.value,
      conteoSala: conteoSala.value,
      conteoBodega: conteoBodega.value,
      tieneBodega: tieneBodega.value,
      indexActual: indexActual.value,
      conteoId: conteoId.value,
      actualizado: new Date().toISOString(),
    }
    try { localStorage.setItem(BORRADOR_KEY, JSON.stringify(borrador)) } catch { /* almacenamiento lleno o bloqueado */ }
  },
  { deep: true },
)

onMounted(() => {
  borradorPendiente.value = leerBorrador()
  cargarSalas()
})
</script>
