<template>
  <MainLayout>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div class="min-h-screen flex items-center justify-center p-4">
        <div class="w-full max-w-md">
          <!-- Encabezado -->
          <div class="text-center mb-6">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg mb-4">
              <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 17v-6a2 2 0 012-2h4l2 3v5a2 2 0 01-2 2H11a2 2 0 01-2-2zM7 17h10M7 13h2M7 9h2"
                />
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-blue-600 dark:text-blue-400 leading-tight">
              Reemplazo de cerveza
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Formulario pensado para usarlo desde el celular.
            </p>
          </div>

          <!-- Tarjeta formulario -->
          <div class="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl border border-gray-100 dark:border-gray-700 p-4 space-y-4">
            <!-- Sala -->
            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Sala
              </label>
              <div class="relative">
                <select
                  v-model="salaSeleccionadaCodigo"
                  class="w-full h-11 pl-3 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                >
                  <option value="" disabled>
                    {{ loadingSalas ? 'Cargando salas...' : 'Selecciona una sala' }}
                  </option>
                  <option
                    v-for="sala in salas"
                    :key="sala.codigo"
                    :value="sala.codigo"
                  >
                    {{ sala.glblLocNum }} - {{ sala.nombre }}
                  </option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p v-if="!loadingSalas && salas.length === 0" class="text-xs text-red-600 dark:text-red-400 mt-1">
                No se pudieron cargar las salas.
              </p>
            </div>

            <!-- Producto -->
            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Producto
              </label>
              <div class="relative">
                <select
                  v-model="productoSeleccionadoCodigo"
                  :disabled="!salaSeleccionadaCodigo || loadingProductos || productos.length === 0"
                  class="w-full h-11 pl-3 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none disabled:opacity-60"
                >
                  <option value="" disabled>
                    {{
                      !salaSeleccionadaCodigo
                        ? 'Selecciona una sala primero'
                        : loadingProductos
                          ? 'Cargando cervezas...'
                          : productos.length === 0
                            ? 'No hay cervezas'
                            : 'Selecciona una cerveza'
                    }}
                  </option>
                  <option
                    v-for="producto in productos"
                    :key="producto.codigoProducto"
                    :value="producto.codigoProducto"
                  >
                    {{ producto.nombreProducto }}
                  </option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Cantidad -->
            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cantidad
              </label>
              <input
                v-model.number="form.cantidad"
                type="number"
                min="0"
                inputmode="numeric"
                placeholder="Cantidad"
                class="w-full h-11 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-lg text-gray-900 dark:text-gray-100 text-center font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Fecha de vencimiento -->
            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Fecha de vencimiento
              </label>
              <input
                v-model="form.fechaVencimiento"
                type="date"
                class="w-full h-11 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Observaciones / Estado -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Observaciones
              </label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="opcion in opcionesObservacion"
                  :key="opcion.valor"
                  type="button"
                  class="h-10 px-3 rounded-lg text-xs font-semibold border transition-colors"
                  :class="form.observacion === opcion.valor
                    ? opcion.claseActiva
                    : opcion.claseNormal"
                  @click="form.observacion = opcion.valor"
                >
                  {{ opcion.label }}
                </button>
              </div>
            </div>

            <!-- Botón enviar -->
            <button
              type="button"
              class="w-full h-12 mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-base shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              :disabled="!esValido || enviando"
              @click="handleEnviar"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ enviando ? 'Enviando...' : 'Enviar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import MainLayout from '@/components/layouts/MainLayout.vue'
import salasService, { type Sala } from '@/services/salas.service'
import productosService, { type ProductoSimple } from '@/services/productos.service'
import reemplazoCervezaService from '@/services/reemplazoCerveza.service'
import { useToast } from '@/composables/useToast'

type ObservacionValor = 'pinchado' | 'abollado' | 'por_vencer' | 'vencido'

const form = reactive({
  cantidad: 0,
  fechaVencimiento: '',
  observacion: '' as ObservacionValor | ''
})

const salas = ref<Sala[]>([])
const productos = ref<ProductoSimple[]>([])
const salaSeleccionadaCodigo = ref('')
const productoSeleccionadoCodigo = ref('')
const loadingSalas = ref(false)
const loadingProductos = ref(false)
const enviando = ref(false)

const toast = useToast()

const salaSeleccionada = computed(() =>
  salas.value.find((s) => s.codigo === salaSeleccionadaCodigo.value) || null
)

const productoSeleccionado = computed(() => {
  if (!Array.isArray(productos.value)) return null
  return productos.value.find((p) => p.codigoProducto === productoSeleccionadoCodigo.value) || null
})

const opcionesObservacion: Array<{
  valor: ObservacionValor
  label: string
  claseActiva: string
  claseNormal: string
}> = [
  {
    valor: 'pinchado',
    label: 'Pinchado',
    claseActiva: 'bg-red-600 text-white border-red-700',
    claseNormal: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700'
  },
  {
    valor: 'abollado',
    label: 'Abollado',
    claseActiva: 'bg-amber-600 text-white border-amber-700',
    claseNormal: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700'
  },
  {
    valor: 'por_vencer',
    label: 'Por vencer',
    claseActiva: 'bg-blue-600 text-white border-blue-700',
    claseNormal: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700'
  },
  {
    valor: 'vencido',
    label: 'Vencido',
    claseActiva: 'bg-gray-800 text-white border-gray-900',
    claseNormal: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600'
  }
]

const mensaje = ref('')
const mensajeTipo = ref<'ok' | 'error'>('ok')

const esValido = computed(() => {
  return (
    !!salaSeleccionada.value &&
    !!productoSeleccionado.value &&
    form.cantidad > 0 &&
    form.fechaVencimiento !== '' &&
    form.observacion !== ''
  )
})

const limpiarForm = () => {
  form.cantidad = 0
  form.fechaVencimiento = ''
  form.observacion = ''
  productoSeleccionadoCodigo.value = ''
  // No vaciamos los productos, ya que las cervezas se cargan una sola vez
}

const cargarSalas = async () => {
  loadingSalas.value = true
  salas.value = []
  try {
    salas.value = await salasService.getSalas()
  } catch (error: any) {
    console.error('Error cargando salas:', error)
    toast.error('Error al cargar salas', error.message || 'No se pudieron cargar las salas')
  } finally {
    loadingSalas.value = false
  }
}

const cargarProductos = async () => {
  loadingProductos.value = true
  try {
    productos.value = await productosService.getCervezas()
  } catch (error: any) {
    console.error('Error cargando cervezas:', error)
    toast.error('Error al cargar cervezas', error.message || 'No se pudieron cargar las cervezas')
  } finally {
    loadingProductos.value = false
  }
}

// Ya no observamos cambio de sala para recargar,
// porque las cervezas son generales y no dependen de un CardCode
watch(salaSeleccionadaCodigo, (nuevo) => {
  if (!nuevo) {
    productoSeleccionadoCodigo.value = ''
  }
})

const handleEnviar = async () => {
  if (!esValido.value || !salaSeleccionada.value || !productoSeleccionado.value) {
    mensaje.value = 'Completa todos los campos antes de enviar.'
    mensajeTipo.value = 'error'
    return
  }

  try {
    enviando.value = true
    const payload = {
      cardCode: salaSeleccionada.value.codigo,
      itemCode: productoSeleccionado.value.codigoProducto,
      stock: form.cantidad,
      expirationDate: form.fechaVencimiento || null,
      observations: form.observacion || null
    }

    const resultado = await reemplazoCervezaService.crearReemplazo(payload)
    console.log('Reemplazo de cerveza insertado:', resultado)

    mensaje.value = 'Registro enviado correctamente.'
    mensajeTipo.value = 'ok'
    toast.success('Reemplazo guardado', 'El registro se guardó correctamente')
    limpiarForm()
  } catch (error: any) {
    console.error('Error enviando reemplazo de cerveza:', error)
    mensaje.value = 'Ocurrió un error al enviar el registro.'
    mensajeTipo.value = 'error'
    toast.error(
      'Error al guardar reemplazo',
      error.response?.data?.message || error.message || 'No se pudo guardar el reemplazo'
    )
  } finally {
    enviando.value = false
  }
}

onMounted(async () => {
  await cargarSalas()
  await cargarProductos()
})
</script>

