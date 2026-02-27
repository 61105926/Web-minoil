<template>
  <MainLayout>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div class="min-h-screen flex items-center justify-center p-4">
        <div class="w-full max-w-md">
          <!-- Encabezado -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl shadow-blue-500/20 mb-4 transform transition hover:scale-105">
              <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 17v-6a2 2 0 012-2h4l2 3v5a2 2 0 01-2 2H11a2 2 0 01-2-2zM7 17h10M7 13h2M7 9h2"
                />
              </svg>
            </div>
            <h1 class="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Reemplazo de Cerveza
            </h1>
          </div>

          <!-- Tarjeta formulario -->
          <div class="bg-white/80 dark:bg-gray-800/90 backdrop-blur-md shadow-2xl rounded-3xl border border-white/20 dark:border-gray-700/50 p-6 space-y-5 flex-1">
            <!-- Sala -->
            <div class="space-y-1 z-50">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Sala
              </label>
              <VueMultiselect
                v-model="salaSeleccionada"
                :options="salas"
                :searchable="true"
                :loading="loadingSalas"
                placeholder="Busca o selecciona una sala..."
                track-by="codigo"
                label="displayName"
                class="custom-multiselect"
                selectLabel=""
                deselectLabel=""
                selectedLabel="Seleccionado"
              >
                <template #noResult>
                  <span>No se encontraron salas.</span>
                </template>
              </VueMultiselect>
              <p v-if="!loadingSalas && salas.length === 0" class="text-xs text-red-600 dark:text-red-400 mt-1">
                No se pudieron cargar las salas.
              </p>
            </div>

            <!-- Producto -->
            <div class="space-y-1 z-40 relative">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Producto
              </label>
              <VueMultiselect
                v-model="productoSeleccionado"
                :options="productos"
                :searchable="true"
                :loading="loadingProductos"
                :disabled="!salaSeleccionada || loadingProductos || productos.length === 0"
                :placeholder="!salaSeleccionada ? 'Selecciona una sala primero' : 'Busca una cerveza...'"
                track-by="codigoProducto"
                label="nombreProducto"
                class="custom-multiselect"
                selectLabel=""
                deselectLabel=""
                selectedLabel="Seleccionado"
              >
                <template #noResult>
                  <span>No se encontraron productos.</span>
                </template>
              </VueMultiselect>
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
            <div class="space-y-3 pt-2">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Estado / Observación
              </label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  v-for="opcion in opcionesObservacion"
                  :key="opcion.valor"
                  type="button"
                  class="h-11 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all duration-200 shadow-sm flex items-center justify-center"
                  :class="form.observacion === opcion.valor
                    ? opcion.claseActiva + ' ring-2 ring-offset-2 scale-[1.02] shadow-md dark:ring-offset-gray-800'
                    : opcion.claseNormal + ' hover:scale-[1.02] hover:shadow'"
                  @click="form.observacion = opcion.valor"
                >
                  {{ opcion.label }}
                </button>
              </div>
            </div>

            <!-- Botón enviar -->
            <button
              type="button"
              class="w-full h-14 mt-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-lg shadow-xl shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              :disabled="!esValido || enviando"
              @click="handleEnviar"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              {{ enviando ? 'Enviando...' : 'Guardar Registro' }}
            </button>
          </div>
        </div>

        <div v-if="salaSeleccionada?.codigo && registros.length > 0" class="w-full max-w-md mt-8 pb-12">
          <div class="flex justify-between items-end mb-6 px-1">
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                Registros
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">Total: {{ registros.length }} items</p>
            </div>
            <button
              @click="descargarPDF"
              class="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full text-sm font-bold shadow-lg shadow-red-500/30 transition-all flex items-center gap-2 active:scale-95"
              :disabled="generandoPDF"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="hidden sm:inline">{{ generandoPDF ? 'Creando...' : 'Descargar' }}</span>
              <span class="sm:hidden">PDF</span>
            </button>
          </div>

          <!-- Contenedor para el PDF (Oculto en pantalla normal pero se usa para capturar) -->
          <div style="display: none;">
            <div id="pdf-content" class="p-8 bg-white text-black w-[800px]">
              <div class="text-center mb-8 border-b-2 border-gray-200 pb-4">
                <h1 class="text-3xl font-bold text-gray-800 uppercase tracking-wide">
                  Reporte de Reemplazo de Cerveza
                </h1>
                <p class="text-gray-600 mt-2 font-medium text-lg">Sala: {{ salaSeleccionada?.glblLocNum }} - {{ salaSeleccionada?.alias || salaSeleccionada?.nombre }}</p>
                <p class="text-sm text-gray-500 mt-1">Generado: {{ new Date().toLocaleString() }}</p>
              </div>

              <table class="w-full text-sm text-left border-collapse border border-gray-300">
                <thead class="bg-gray-100 text-gray-800">
                  <tr>
                    <th class="px-4 py-3 border border-gray-300 font-bold">Producto</th>
                    <th class="px-4 py-3 border border-gray-300 font-bold text-center">Cant.</th>
                    <th class="px-4 py-3 border border-gray-300 font-bold">Vencimiento</th>
                    <th class="px-4 py-3 border border-gray-300 font-bold">Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="reg in registros" :key="reg.id" class="hover:bg-gray-50">
                    <td class="px-4 py-3 border border-gray-300 font-medium">{{ reg.ItemName }} <br><span class="text-xs text-gray-500">{{ reg.ItemCode }}</span></td>
                    <td class="px-4 py-3 border border-gray-300 text-center font-bold">{{ reg.stock }}</td>
                    <td class="px-4 py-3 border border-gray-300">{{ formatearFecha(reg.expiration_date) }}</td>
                    <td class="px-4 py-3 border border-gray-300">{{ formatearObservacion(reg.observations) }}</td>
                  </tr>
                </tbody>
              </table>
              <div class="mt-8 text-right text-xs text-gray-400">
                Documento autogenerado por Sistema MinOil
              </div>
            </div>
          </div>

          <!-- Vista de Tarjetas Móvil -->
          <div class="space-y-4">
            <div 
              v-for="reg in registros" 
              :key="reg.id" 
              class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <!-- Color de borde izquierdo indicador -->
              <div class="absolute left-0 top-0 bottom-0 w-1.5" :class="getColorByObs(reg.observations)"></div>

              <div class="p-5 pl-6 pr-12 text-left">
                <h3 class="font-extrabold text-gray-900 dark:text-white leading-tight mb-1">
                  {{ reg.ItemName || 'Producto sin nombre' }}
                </h3>
                <p class="text-xs font-mono text-gray-400 dark:text-gray-500 mb-4">{{ reg.ItemCode || 'Sin código' }}</p>
                
                <div class="flex flex-wrap gap-4 text-sm justify-between">
                  <div class="flex flex-col">
                    <span class="text-gray-400 dark:text-gray-500 text-[11px] uppercase font-bold tracking-wider mb-0.5">Cantidad</span>
                    <span class="font-black text-2xl text-blue-600 dark:text-blue-400">{{ reg.stock }}</span>
                  </div>
                  <div class="flex flex-col text-right">
                    <span class="text-gray-400 dark:text-gray-500 text-[11px] uppercase font-bold tracking-wider mb-0.5">Vencimiento</span>
                    <span class="font-semibold text-gray-700 dark:text-gray-200 mt-1">{{ formatearFecha(reg.expiration_date) }}</span>
                  </div>
                </div>

                <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                  <span class="inline-flex px-2.5 py-1 text-xs font-bold rounded-md bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600/50">
                    {{ formatearObservacion(reg.observations) }}
                  </span>
                </div>
              </div>

              <button
                @click="eliminarRegistro(reg.id)"
                class="absolute top-4 right-4 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 p-2.5 rounded-full transition-all disabled:opacity-50 group"
                title="Eliminar registro"
                :disabled="eliminando === reg.id"
              >
                <svg class="h-5 w-5 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            
            <div v-if="loadingRegistros" class="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
              <svg class="animate-spin h-5 w-5 mx-auto mb-2 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Cargando registros...
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style>
/* Estilos Customizados para Vue-Multiselect integrados a Tailwind */
.custom-multiselect .multiselect__tags {
  @apply rounded-xl border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 min-h-[44px] pt-2.5 px-3 text-sm;
}
.custom-multiselect .multiselect__input {
  @apply bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500;
}
.custom-multiselect .multiselect__single {
  @apply bg-transparent text-gray-900 dark:text-gray-100 overflow-hidden text-ellipsis whitespace-nowrap leading-6 font-medium;
}
.custom-multiselect .multiselect__content-wrapper {
  @apply rounded-xl border border-gray-200 dark:border-gray-600 shadow-xl bg-white dark:bg-gray-800 mt-1;
}
.custom-multiselect .multiselect__option {
  @apply px-4 py-2.5 text-sm;
}
.custom-multiselect .multiselect__option--highlight {
  @apply bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200;
}
.custom-multiselect .multiselect__option--selected {
  @apply font-bold bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white;
}
.custom-multiselect .multiselect__option--selected.multiselect__option--highlight {
  @apply bg-blue-100 text-blue-900 dark:bg-blue-800 dark:text-white;
}
.custom-multiselect .multiselect__select {
  @apply h-[44px] w-[44px];
}
.custom-multiselect .multiselect__spinner {
  @apply h-[40px] bg-transparent;
}
</style>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import MainLayout from '@/components/layouts/MainLayout.vue'
import salasService, { type Sala } from '@/services/salas.service'
import productosService, { type ProductoSimple } from '@/services/productos.service'
import reemplazoCervezaService, { type ReemplazoCervezaRecord } from '@/services/reemplazoCerveza.service'
import { useToast } from '@/composables/useToast'
import html2pdf from 'html2pdf.js'

// Importando vue-multiselect
import VueMultiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'

// Interfaces extendidas para UI
interface SalaUI extends Sala {
  displayName: string
}

type ObservacionValor = 'pinchado' | 'abollado' | 'por_vencer' | 'vencido'

const form = reactive({
  cantidad: 0,
  fechaVencimiento: '',
  observacion: '' as ObservacionValor | ''
})

const salas = ref<SalaUI[]>([])
const productos = ref<ProductoSimple[]>([])
const salaSeleccionada = ref<SalaUI | null>(null)
const productoSeleccionado = ref<ProductoSimple | null>(null)
const loadingSalas = ref(false)
const loadingProductos = ref(false)
const loadingRegistros = ref(false)
const enviando = ref(false)
const eliminando = ref<number | null>(null)
const generandoPDF = ref(false)

const registros = ref<ReemplazoCervezaRecord[]>([])

const toast = useToast()

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
  productoSeleccionado.value = null
  // No vaciamos los productos, ya que las cervezas se cargan una sola vez
}

const formatearFecha = (fechaStr: string | null) => {
  if (!fechaStr || fechaStr === 'null' || fechaStr.trim() === '') return 'N/A'
  
  // Limpiar formato ISO backend a YYYY-MM-DD
  const dateStr = String(fechaStr).split('T')[0]
  const [year, month, day] = dateStr.split('-')
  if (day && month && year) {
    return `${day}/${month}/${year}`
  }
  return dateStr
}

const formatearObservacion = (obs: string | null) => {
  if (!obs || obs === 'null' || obs.trim() === '') return 'Ninguna'
  const found = opcionesObservacion.find(o => o.valor === obs)
  return found ? found.label : obs
}

const getColorByObs = (obs: string | null) => {
  if (obs === 'pinchado') return 'bg-red-500'
  if (obs === 'abollado') return 'bg-amber-500'
  if (obs === 'por_vencer') return 'bg-blue-500'
  if (obs === 'vencido') return 'bg-gray-800 dark:bg-gray-400'
  return 'bg-green-500'
}

const cargarRegistros = async (cardCode: string) => {
  if (!cardCode) return
  loadingRegistros.value = true
  try {
    registros.value = await reemplazoCervezaService.getRegistrosPorSala(cardCode)
  } catch (error: any) {
    console.error('Error cargando registros:', error)
  } finally {
    loadingRegistros.value = false
  }
}

const eliminarRegistro = async (id: number) => {
  if (!confirm('¿Seguro que deseas eliminar este registro?')) return
  
  eliminando.value = id
  try {
    await reemplazoCervezaService.eliminarRegistro(id)
    toast.success('Eliminado', 'Registro eliminado correctamente')
    if (salaSeleccionada.value?.codigo) {
      await cargarRegistros(salaSeleccionada.value.codigo)
    }
  } catch (error: any) {
    console.error('Error eliminando registro:', error)
    toast.error('Error', 'No se pudo eliminar el registro')
  } finally {
    eliminando.value = null
  }
}

const descargarPDF = () => {
  generandoPDF.value = true
  const element = document.getElementById('pdf-content')
  
  if (!element) {
    generandoPDF.value = false
    return
  }

  // Clón del elemento con temporal block
  const clone = element.cloneNode(true) as HTMLElement
  clone.style.display = 'block'
  document.body.appendChild(clone)

  const nombreSala = (salaSeleccionada.value?.alias || salaSeleccionada.value?.nombre)?.replace(/\s+/g, '_') || 'SALA'
  const opt = {
    margin:       10,
    filename:     `ReemplazoCerveza_${nombreSala}.pdf`,
    image:        { type: 'jpeg' as const, quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
  }

  // Generar y remover
  html2pdf().from(clone).set(opt).save().then(() => {
    document.body.removeChild(clone)
    generandoPDF.value = false
    toast.success('Descargado', 'El PDF ha sido generado y descargado.')
  }).catch((err: any) => {
    console.error('Error generando PDF', err)
    document.body.removeChild(clone)
    generandoPDF.value = false
    toast.error('Error', 'No se pudo generar el PDF.')
  })
}

const cargarSalas = async () => {
  loadingSalas.value = true
  salas.value = []
  try {
    const rawSalas = await salasService.getSalas()
    salas.value = rawSalas.map(s => ({
      ...s,
      displayName: `${s.glblLocNum} - ${s.alias || s.nombre}`
    }))
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

// Observar cambio de sala para recargar registros
watch(() => salaSeleccionada.value?.codigo, async (nuevoCodigo, viejoCodigo) => {
  if (nuevoCodigo !== viejoCodigo) {
    productoSeleccionado.value = null
    registros.value = []
    
    if (nuevoCodigo) {
      await cargarRegistros(nuevoCodigo)
    }
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
    
    // Recargar tabla de registros automáticamente
    if (salaSeleccionada.value?.codigo) {
      await cargarRegistros(salaSeleccionada.value.codigo)
    }
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

