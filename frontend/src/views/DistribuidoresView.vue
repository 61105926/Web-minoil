<template>
  <MainLayout>
    <!-- Contenedor full-screen relativo al layout -->
    <div class="relative -m-4 sm:-m-6 lg:-m-8 overflow-hidden" style="height: calc(100vh - 64px);">

      <!-- MAPA -->
      <div ref="mapContainer" class="absolute inset-0" />

      <!-- TOP BAR -->
      <div class="absolute top-4 left-4 right-4 flex items-center gap-3 pointer-events-none">
        <!-- Stats pill -->
        <div class="pointer-events-auto flex items-center gap-2 bg-white/90 backdrop-blur-sm shadow-lg rounded-full px-4 py-2">
          <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span class="text-sm font-semibold text-gray-800">{{ distribuidores.length }} distribuidores activos</span>
        </div>
        <div class="flex-1" />
        <!-- Botón agregar -->
        <button
          @click="showForm = true"
          class="pointer-events-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg transition-all"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Agregar
        </button>
      </div>

      <!-- PANEL IZQUIERDO — lista de distribuidores -->
      <div class="absolute left-4 top-16 bottom-4 w-72 flex flex-col gap-2 pointer-events-none">
        <div class="pointer-events-auto flex-1 overflow-y-auto space-y-2 pb-2">
          <div
            v-for="d in distribuidores"
            :key="d.ID"
            @click="selectDistribuidor(d)"
            class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md px-4 py-3 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
            :class="selected?.ID === d.ID ? 'ring-2 ring-blue-500' : ''"
          >
            <div class="flex items-center gap-3">
              <!-- Ícono carro -->
              <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                :class="selected?.ID === d.ID ? 'bg-blue-600' : 'bg-gray-100'">
                <svg class="w-6 h-6" :class="selected?.ID === d.ID ? 'text-white' : 'text-gray-600'"
                  viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-5h14v5z"/>
                  <circle cx="7.5" cy="14.5" r="1.5"/>
                  <circle cx="16.5" cy="14.5" r="1.5"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900 truncate">{{ d.NOMBRE }}</p>
                <p v-if="d.LATITUD && d.LONGITUD" class="text-xs text-gray-500">
                  {{ d.LATITUD.toFixed(4) }}, {{ d.LONGITUD.toFixed(4) }}
                </p>
                <p v-else class="text-xs text-gray-400 italic">Sin coordenadas</p>
              </div>
              <svg v-if="d.LATITUD && d.LONGITUD" class="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          </div>

          <div v-if="!distribuidores.length && !loading" class="bg-white/90 backdrop-blur-sm rounded-2xl shadow p-6 text-center">
            <svg class="w-10 h-10 text-gray-300 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/>
            </svg>
            <p class="text-sm text-gray-500">Sin distribuidores aún</p>
          </div>

          <div v-if="loading" class="bg-white/90 backdrop-blur-sm rounded-2xl shadow p-4 text-center">
            <p class="text-sm text-gray-500">Cargando...</p>
          </div>
        </div>
      </div>

      <!-- CARD DETALLE — distribuidor seleccionado (bottom center) -->
      <transition name="slide-up">
        <div
          v-if="selected"
          class="absolute bottom-6 left-1/2 -translate-x-1/2 w-80 bg-white rounded-3xl shadow-2xl p-5"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                <svg class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-5h14v5z"/>
                  <circle cx="7.5" cy="14.5" r="1.5"/>
                  <circle cx="16.5" cy="14.5" r="1.5"/>
                </svg>
              </div>
              <div>
                <h3 class="font-bold text-gray-900 text-base">{{ selected.NOMBRE }}</h3>
                <p class="text-xs text-gray-500">Distribuidor Minoil</p>
              </div>
            </div>
            <button @click="selected = null" class="text-gray-400 hover:text-gray-600 p-1">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="bg-gray-50 rounded-2xl px-4 py-3 flex items-center gap-3">
            <svg class="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span class="text-sm text-gray-600">
              {{ selected.LATITUD?.toFixed(6) }}, {{ selected.LONGITUD?.toFixed(6) }}
            </span>
          </div>
        </div>
      </transition>

      <!-- MODAL NUEVO DISTRIBUIDOR -->
      <transition name="fade">
        <div v-if="showForm" class="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
            <div class="flex items-center justify-between mb-5">
              <h2 class="text-lg font-bold text-gray-900">Nuevo distribuidor</h2>
              <button @click="showForm = false" class="text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Nombre *</label>
                <input
                  v-model="form.nombre"
                  type="text"
                  placeholder="Nombre del distribuidor"
                  class="w-full px-4 py-3 text-sm border border-gray-200 rounded-2xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Latitud</label>
                  <input
                    v-model.number="form.latitud"
                    type="number" step="any"
                    placeholder="-17.7833"
                    class="w-full px-4 py-3 text-sm border border-gray-200 rounded-2xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Longitud</label>
                  <input
                    v-model.number="form.longitud"
                    type="number" step="any"
                    placeholder="-63.1824"
                    class="w-full px-4 py-3 text-sm border border-gray-200 rounded-2xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>
              <p v-if="formError" class="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">{{ formError }}</p>
            </div>
            <button
              @click="submitForm"
              :disabled="submitting || !form.nombre"
              class="mt-5 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-2xl transition-colors active:scale-95"
            >
              {{ submitting ? 'Guardando...' : 'Guardar distribuidor' }}
            </button>
          </div>
        </div>
      </transition>

    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import MainLayout from '@/components/layouts/MainLayout.vue'
import distribuidoresService, { type Distribuidor } from '@/services/distribuidores.service'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

const mapContainer = ref<HTMLElement | null>(null)
const distribuidores = ref<Distribuidor[]>([])
const selected = ref<Distribuidor | null>(null)
const loading = ref(false)
const showForm = ref(false)
const submitting = ref(false)
const formError = ref('')
const form = ref({ nombre: '', latitud: undefined as number | undefined, longitud: undefined as number | undefined })

let map: mapboxgl.Map | null = null
const markers: mapboxgl.Marker[] = []

function carMarkerEl(isSelected = false): HTMLElement {
  const el = document.createElement('div')
  el.style.cssText = `
    width:44px; height:44px; border-radius:50%;
    background:${isSelected ? '#2563EB' : '#fff'};
    box-shadow: 0 4px 15px rgba(0,0,0,0.25);
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; transition:transform 0.2s;
    border: 2px solid ${isSelected ? '#1d4ed8' : '#e5e7eb'};
  `
  el.innerHTML = `
    <svg width="26" height="26" viewBox="0 0 24 24" fill="${isSelected ? '#fff' : '#374151'}">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-5h14v5z"/>
      <circle cx="7.5" cy="14.5" r="1.5"/>
      <circle cx="16.5" cy="14.5" r="1.5"/>
    </svg>
  `
  el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.15)' })
  el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)' })
  return el
}

function clearMarkers() {
  markers.forEach(m => m.remove())
  markers.length = 0
}

function addMarkers() {
  clearMarkers()
  const withCoords = distribuidores.value.filter(d => d.LATITUD != null && d.LONGITUD != null)

  withCoords.forEach(d => {
    const el = carMarkerEl(selected.value?.ID === d.ID)
    const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
      .setLngLat([d.LONGITUD!, d.LATITUD!])
      .addTo(map!)

    el.addEventListener('click', () => selectDistribuidor(d))
    markers.push(marker)
  })

  // Fit bounds para mostrar todos
  if (withCoords.length > 1) {
    const bounds = new mapboxgl.LngLatBounds()
    withCoords.forEach(d => bounds.extend([d.LONGITUD!, d.LATITUD!]))
    map!.fitBounds(bounds, { padding: 80, maxZoom: 14 })
  } else if (withCoords.length === 1) {
    map!.flyTo({ center: [withCoords[0].LONGITUD!, withCoords[0].LATITUD!], zoom: 14 })
  }
}

function selectDistribuidor(d: Distribuidor) {
  selected.value = d
  if (d.LATITUD && d.LONGITUD) {
    map?.flyTo({ center: [d.LONGITUD, d.LATITUD], zoom: 15, speed: 1.2 })
  }
  addMarkers() // re-renderiza marcadores para actualizar color seleccionado
}

async function loadDistribuidores() {
  loading.value = true
  try {
    const data = await distribuidoresService.getAll()
    console.log('[Distribuidores] respuesta:', data)
    distribuidores.value = Array.isArray(data) ? data : (data as any).distribuidores ?? []
    if (map) addMarkers()
  } catch (err: any) {
    console.error('[Distribuidores] error:', err.response?.data ?? err.message)
  } finally {
    loading.value = false
  }
}

async function submitForm() {
  formError.value = ''
  submitting.value = true
  try {
    await distribuidoresService.create({
      nombre: form.value.nombre,
      latitud: form.value.latitud,
      longitud: form.value.longitud,
    })
    form.value = { nombre: '', latitud: undefined, longitud: undefined }
    showForm.value = false
    await loadDistribuidores()
  } catch (err: any) {
    formError.value = err.response?.data?.hanaError ?? err.response?.data?.message ?? 'Error al guardar'
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await loadDistribuidores()
  await nextTick()

  map = new mapboxgl.Map({
    container: mapContainer.value!,
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-63.1824, -17.7833],
    zoom: 12,
  })

  map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right')
  map.on('load', () => addMarkers())
})

onUnmounted(() => {
  clearMarkers()
  map?.remove()
})
</script>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
