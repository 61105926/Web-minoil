<template>
  <MainLayout>
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Boletas de pago</h1>
        <p class="mt-1 text-gray-600 dark:text-gray-400">Consulta y descarga tu boleta por período.</p>
      </div>
      <Card className="p-6">
        <form @submit.prevent="loadMonths" class="mb-4 flex flex-wrap items-end gap-4">
          <div>
            <label for="boleta-telefono" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Número de teléfono</label>
            <input id="boleta-telefono" v-model="numero" type="tel" autocomplete="tel" required
              :disabled="loadingMonths || loadingPdf" @input="resetConsultation"
              class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
          </div>
          <Button type="submit" :disabled="!numero.trim() || loadingMonths || loadingPdf">Consultar períodos</Button>
        </form>
        <p v-if="loadingMonths" class="text-gray-600 dark:text-gray-400" role="status">Consultando períodos disponibles...</p>
        <div v-else class="flex flex-wrap items-end gap-4">
          <div class="min-w-56">
            <label for="boleta-periodo" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Período</label>
            <select id="boleta-periodo" v-model="selected" :disabled="!months.length || loadingPdf" @change="clearPdf"
              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
              <option v-if="!months.length" value="">Sin períodos disponibles</option>
              <option v-for="period in months" :key="periodKey(period)" :value="periodKey(period)">{{ periodLabel(period) }}</option>
            </select>
          </div>
          <Button :disabled="!selected || loadingPdf" @click="loadPdf">{{ loadingPdf ? 'Generando PDF...' : 'Ver boleta' }}</Button>
        </div>
        <p v-if="error" role="alert" class="mt-4 text-sm text-red-600 dark:text-red-400">{{ error }}</p>
      </Card>
      <Card v-if="pdfUrl" className="overflow-hidden">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-4 dark:border-gray-700">
          <h2 class="font-semibold text-gray-900 dark:text-gray-100">Boleta de pago</h2>
          <a :href="pdfUrl" :download="`boleta-${selected}.pdf`" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Descargar PDF</a>
        </div>
        <iframe :src="pdfUrl" title="Vista previa de la boleta de pago" class="h-[75vh] min-h-96 w-full border-0"></iframe>
      </Card>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import MainLayout from '@/components/layouts/MainLayout.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import boletasService, { type BoletaMonth } from '@/services/boletas.service'

const months = ref<BoletaMonth[]>([])
const numero = ref('')
const selected = ref('')
const loadingMonths = ref(false)
const loadingPdf = ref(false)
const error = ref('')
const pdfUrl = ref('')
let active = true
const periodKey = (period: BoletaMonth) => `${period.year}${String(period.month).padStart(2, '0')}`
const periodLabel = (period: BoletaMonth) => new Intl.DateTimeFormat('es-BO', { month: 'long', year: 'numeric', timeZone: 'UTC' })
  .format(new Date(Date.UTC(period.year, period.month - 1, 1)))

function clearPdf() {
  if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value)
  pdfUrl.value = ''
}

function resetConsultation() {
  months.value = []
  selected.value = ''
  error.value = ''
  clearPdf()
}

async function errorMessage(cause: any): Promise<string> {
  let data = cause?.response?.data
  if (data instanceof Blob) {
    try { data = JSON.parse(await data.text()) } catch { data = null }
  }
  return typeof data?.message === 'string' ? data.message : 'No se pudo consultar la boleta. Inténtalo nuevamente.'
}

async function loadMonths() {
  if (!numero.value.trim() || loadingMonths.value || loadingPdf.value) return
  loadingMonths.value = true
  error.value = ''
  clearPdf()
  months.value = []
  selected.value = ''
  try {
    const result = await boletasService.getMonths(numero.value.trim())
    if (!active) return
    months.value = result
    selected.value = result.length ? periodKey(result[0]) : ''
  } catch (cause) {
    const message = await errorMessage(cause)
    if (active) error.value = message
  } finally {
    loadingMonths.value = false
  }
}

async function loadPdf() {
  if (!selected.value || loadingPdf.value) return
  loadingPdf.value = true
  error.value = ''
  clearPdf()
  try {
    const pdf = await boletasService.getPdf(numero.value.trim(), selected.value)
    if (!active) return
    if (!pdf.type.includes('application/pdf')) throw new Error('Respuesta PDF inválida')
    pdfUrl.value = URL.createObjectURL(pdf)
  } catch (cause) {
    const message = await errorMessage(cause)
    if (active) error.value = message
  } finally {
    loadingPdf.value = false
  }
}

onBeforeUnmount(() => { active = false; clearPdf() })
</script>
