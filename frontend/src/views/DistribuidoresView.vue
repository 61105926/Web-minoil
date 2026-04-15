<template>
  <MainLayout>
    <div class="relative w-full" style="height:82vh;min-height:520px;">

      <!-- MAPA (fondo completo) -->
      <div ref="mapContainer" style="position:absolute;inset:0;border-radius:16px;overflow:hidden;" />

      <!-- TOP BAR compacto -->
      <div class="absolute top-3 left-3 right-3 flex items-center gap-2 pointer-events-none z-10">
        <!-- contador -->
        <div class="pointer-events-auto flex items-center gap-1.5 bg-white/90 backdrop-blur-sm shadow-md rounded-full px-3 py-1.5">
          <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
          <span class="text-xs font-semibold text-gray-800 whitespace-nowrap">{{ distribuidores.length }} activos</span>
        </div>
        <div class="flex-1" />

        <!-- estilos -->
        <div class="pointer-events-auto flex items-center bg-white/90 backdrop-blur-sm shadow-md rounded-full p-0.5 gap-0.5">
          <button
            v-for="s in mapStyles" :key="s.id" @click="changeStyle(s.id)" :title="s.label"
            class="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full transition-all"
            :class="currentStyle === s.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'"
          >
            <span>{{ s.icon }}</span>
            <span class="hidden md:inline">{{ s.label }}</span>
          </button>
        </div>

        <!-- tráfico -->
        <button @click="toggleTraffic"
          class="pointer-events-auto flex items-center gap-1.5 bg-white/90 backdrop-blur-sm hover:bg-white active:scale-95 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md transition-all"
          :class="trafficOn ? 'text-red-500' : 'text-gray-700'">
          🚦 <span class="hidden sm:inline">{{ trafficOn ? 'Sin tráfico' : 'Tráfico' }}</span>
        </button>

        <!-- agregar -->
        <button @click="showForm = true"
          class="pointer-events-auto flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md transition-all">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span class="hidden sm:inline">Agregar</span>
        </button>
      </div>

      <!-- TOGGLE SIDEBAR -->
      <button @click="sidebarOpen = !sidebarOpen"
        class="absolute top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-50 shadow-lg transition-all duration-300 flex items-center justify-center rounded-r-xl"
        style="width:18px;height:48px;"
        :style="sidebarOpen ? 'left:248px' : 'left:0'">
        <svg class="w-3 h-3 text-gray-400 transition-transform duration-300" :class="sidebarOpen ? '' : 'rotate-180'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- PANEL IZQUIERDO colapsable -->
      <transition name="slide-left">
        <div v-show="sidebarOpen" class="absolute left-3 top-14 bottom-3 w-56 z-10 pointer-events-none">
          <div class="pointer-events-auto h-full overflow-y-auto space-y-1.5 pr-0.5 pb-1">
            <div
              v-for="d in distribuidores" :key="d.ID" @click="selectDistribuidor(d)"
              class="bg-white/92 backdrop-blur-sm rounded-2xl shadow px-3 py-2.5 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
              :class="selected?.ID === d.ID ? 'ring-2 ring-blue-500' : ''"
            >
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  :class="selected?.ID === d.ID ? 'bg-blue-600' : 'bg-gray-100'">
                  <svg class="w-5 h-5" :class="selected?.ID === d.ID ? 'text-white' : 'text-gray-600'" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-5h14v5z"/>
                    <circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold text-gray-900 truncate">{{ d.NOMBRE }}</p>
                  <p v-if="d.LATITUD && d.LONGITUD" class="text-xs text-gray-400 truncate">
                    {{ Number(d.LATITUD).toFixed(3) }}, {{ Number(d.LONGITUD).toFixed(3) }}
                  </p>
                  <p v-else class="text-xs text-gray-400 italic">Sin GPS</p>
                </div>
              </div>
            </div>

            <div v-if="!distribuidores.length && !loading" class="bg-white/90 rounded-2xl shadow p-4 text-center">
              <p class="text-xs text-gray-500">Sin distribuidores</p>
            </div>
            <div v-if="loading" class="bg-white/90 rounded-2xl shadow p-3 text-center">
              <p class="text-xs text-gray-500">Cargando...</p>
            </div>
          </div>
        </div>
      </transition>

      <!-- CARD DETALLE + TRAYECTORIA (bottom-right) -->
      <transition name="slide-up">
        <div v-if="selected"
          class="absolute bottom-3 right-3 w-72 bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10"
          style="max-height: 62vh;">

          <!-- Header compacto -->
          <div class="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 flex-shrink-0">
            <div class="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-5h14v5z"/>
                <circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-bold text-gray-900 truncate">{{ selected.NOMBRE }}</h3>
              <p v-if="selected.LATITUD && selected.LONGITUD" class="text-xs text-gray-400 font-mono truncate">
                {{ Number(selected.LATITUD).toFixed(5) }}, {{ Number(selected.LONGITUD).toFixed(5) }}
              </p>
              <p v-else class="text-xs text-gray-400 italic">Sin coordenadas</p>
            </div>
            <button @click="closeCard" class="text-gray-400 hover:text-gray-600 p-1 flex-shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Body scrollable -->
          <div class="overflow-y-auto flex-1 px-3 py-3 space-y-2.5">

            <!-- Toggle modo ruta -->
            <div class="flex gap-1 bg-gray-100 rounded-xl p-1">
              <button @click="routeMode = 'calles'"
                class="flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all"
                :class="routeMode === 'calles' ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'">
                🛣️ Calles
              </button>
              <button @click="routeMode = 'velocidad'"
                class="flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all"
                :class="routeMode === 'velocidad' ? 'bg-white shadow text-orange-500' : 'text-gray-400 hover:text-gray-600'">
                🚀 Velocidad
              </button>
            </div>

            <!-- Selector fecha + botón -->
            <div class="bg-blue-50 rounded-2xl p-2.5">
              <p class="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1.5">Ver ruta del día</p>
              <div class="flex gap-1.5">
                <input v-model="fechaTrayectoria" type="date"
                  class="flex-1 px-2.5 py-1.5 text-xs border border-blue-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button @click="loadTrayectoria" :disabled="trayectoriaLoading"
                  class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1 whitespace-nowrap">
                  <span v-if="trayectoriaLoading" class="animate-spin text-xs">⏳</span>
                  <span v-else class="text-xs">🗺️</span>
                  {{ trayectoriaLoading ? '...' : 'Ver' }}
                </button>
              </div>
            </div>

            <!-- Stats -->
            <div v-if="trayectoria.length > 0" class="bg-green-50 rounded-2xl p-2.5">
              <p class="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1.5">Resumen</p>
              <div class="grid grid-cols-3 gap-1 text-center">
                <div class="bg-white rounded-xl py-1.5">
                  <p class="text-base font-bold text-gray-900">{{ trayectoria.length }}</p>
                  <p class="text-xs text-gray-500">puntos</p>
                </div>
                <div class="bg-white rounded-xl py-1.5">
                  <p class="text-xs font-bold text-gray-900">{{ formatTime(trayectoria[0].CREATED_AT) }}</p>
                  <p class="text-xs text-gray-500">inicio</p>
                </div>
                <div class="bg-white rounded-xl py-1.5">
                  <p class="text-xs font-bold text-gray-900">{{ formatTime(trayectoria[trayectoria.length - 1].CREATED_AT) }}</p>
                  <p class="text-xs text-gray-500">último</p>
                </div>
              </div>
            </div>

            <!-- Leyenda velocidad -->
            <div v-if="routeMode === 'velocidad' && trayectoria.length > 0" class="bg-orange-50 rounded-2xl p-2.5 space-y-1.5">
              <div class="flex justify-between text-xs">
                <span class="text-gray-500">Vel. máxima</span>
                <span class="font-bold text-gray-800">{{ speedStats.max }} km/h</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-gray-500">Vel. promedio</span>
                <span class="font-bold text-gray-800">{{ speedStats.avg }} km/h</span>
              </div>
              <div class="flex items-center justify-between pt-0.5">
                <div class="flex items-center gap-1 text-xs">
                  <span class="w-4 h-2 rounded-full bg-green-500 inline-block"></span>
                  <span class="text-gray-500">&lt;20</span>
                </div>
                <div class="flex items-center gap-1 text-xs">
                  <span class="w-4 h-2 rounded-full bg-amber-400 inline-block"></span>
                  <span class="text-gray-500">20–45</span>
                </div>
                <div class="flex items-center gap-1 text-xs">
                  <span class="w-4 h-2 rounded-full bg-red-500 inline-block"></span>
                  <span class="text-gray-500">&gt;45 km/h</span>
                </div>
              </div>
            </div>

            <!-- Sin datos -->
            <div v-else-if="trayectoriaLoaded && !trayectoria.length" class="bg-gray-50 rounded-2xl p-3 text-center">
              <p class="text-xs text-gray-500">Sin registros para esta fecha</p>
            </div>

            <!-- Paradas -->
            <div v-if="paradas.length > 0">
              <p class="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1.5">
                🅿 {{ paradas.length }} parada{{ paradas.length !== 1 ? 's' : '' }}
              </p>
              <div class="space-y-1">
                <div
                  v-for="(p, i) in paradas" :key="i" @click="flyToParada(p)"
                  class="bg-orange-50 hover:bg-orange-100 rounded-xl px-2.5 py-1.5 flex items-center justify-between cursor-pointer transition-colors">
                  <div>
                    <p class="text-xs font-semibold text-gray-800">Parada {{ i + 1 }}</p>
                    <p class="text-xs text-gray-500">{{ formatTime(p.inicio) }} → {{ formatTime(p.fin) }}</p>
                  </div>
                  <span class="text-xs font-bold text-orange-600 bg-orange-100 rounded-full px-2 py-0.5 flex-shrink-0 ml-2">
                    {{ p.duracion }}m
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </transition>

      <!-- MODAL NUEVO DISTRIBUIDOR -->
      <transition name="fade">
        <div v-if="showForm" class="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-base font-bold text-gray-900">Nuevo distribuidor</h2>
              <button @click="showForm = false" class="text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Nombre *</label>
                <input v-model="form.nombre" type="text" placeholder="Nombre del distribuidor"
                  class="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition" />
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Latitud</label>
                  <input v-model.number="form.latitud" type="number" step="any" placeholder="-17.7833"
                    class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Longitud</label>
                  <input v-model.number="form.longitud" type="number" step="any" placeholder="-63.1824"
                    class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition" />
                </div>
              </div>
              <p v-if="formError" class="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{{ formError }}</p>
            </div>
            <button @click="submitForm" :disabled="submitting || !form.nombre"
              class="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-2xl transition-colors active:scale-95">
              {{ submitting ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </transition>

    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import MainLayout from '@/components/layouts/MainLayout.vue'
import distribuidoresService, { type Distribuidor, type PuntoTrayectoria } from '@/services/distribuidores.service'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN ?? ''

const mapStyles = [
  { id: 'mapbox://styles/mapbox/light-v11',             label: 'Claro',    icon: '☀️' },
  { id: 'mapbox://styles/mapbox/dark-v11',              label: 'Oscuro',   icon: '🌙' },
  { id: 'mapbox://styles/mapbox/streets-v12',           label: 'Calles',   icon: '🗺️' },
  { id: 'mapbox://styles/mapbox/satellite-streets-v12', label: 'Satélite', icon: '🛰️' },
]

const mapContainer   = ref<HTMLElement | null>(null)
const distribuidores = ref<Distribuidor[]>([])
const selected       = ref<Distribuidor | null>(null)
const loading        = ref(false)
const showForm       = ref(false)
const submitting     = ref(false)
const formError      = ref('')
const trafficOn      = ref(false)
const currentStyle   = ref(mapStyles[0].id)
const sidebarOpen    = ref(true)
const form = ref({ nombre: '', latitud: undefined as number | undefined, longitud: undefined as number | undefined })

const trayectoria        = ref<PuntoTrayectoria[]>([])
const trayectoriaLoading = ref(false)
const trayectoriaLoaded  = ref(false)
const fechaTrayectoria   = ref(new Date().toISOString().split('T')[0])
const routeMode          = ref<'calles' | 'velocidad'>('calles')
const speedStats         = ref({ max: 0, avg: 0 })
const paradas = ref<{ lat: number; lng: number; inicio: string; fin: string; duracion: number }[]>([])

let map: mapboxgl.Map | null = null
const markerMap = new Map<number, { marker: mapboxgl.Marker; lng: number; lat: number }>()
let startMarker: mapboxgl.Marker | null = null
let endMarker: mapboxgl.Marker | null = null
let paradaMarkers: mapboxgl.Marker[] = []
let matchedRouteCoords: [number, number][] | null = null

function carMarkerEl(isSelected = false): HTMLElement {
  const el = document.createElement('div')
  el.style.cssText = `
    width:40px;height:40px;border-radius:50%;
    background:${isSelected ? '#2563EB' : '#fff'};
    box-shadow:0 4px 12px rgba(0,0,0,0.2);
    display:flex;align-items:center;justify-content:center;
    cursor:pointer;transition:transform 0.2s;
    border:2px solid ${isSelected ? '#1d4ed8' : '#e5e7eb'};`
  el.innerHTML = `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="${isSelected ? '#fff' : '#374151'}">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-5h14v5z"/>
      <circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/>
    </svg>`
  el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.15)' })
  el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)' })
  return el
}

function animateMarker(marker: mapboxgl.Marker, fromLng: number, fromLat: number, toLng: number, toLat: number, duration = 1200) {
  const start = performance.now()
  function frame(now: number) {
    const t = Math.min((now - start) / duration, 1)
    const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    marker.setLngLat([fromLng + (toLng - fromLng) * e, fromLat + (toLat - fromLat) * e])
    if (t < 1) requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

function syncMarkers() {
  if (!map) return
  const withCoords = distribuidores.value.filter(d => d.LATITUD != null && d.LONGITUD != null)
  for (const [id, entry] of markerMap.entries()) {
    if (!withCoords.find(d => d.ID === id)) { entry.marker.remove(); markerMap.delete(id) }
  }
  for (const d of withCoords) {
    const lng = d.LONGITUD!, lat = d.LATITUD!, sel = selected.value?.ID === d.ID
    if (markerMap.has(d.ID)) {
      const entry = markerMap.get(d.ID)!
      const el = entry.marker.getElement()
      el.style.background = sel ? '#2563EB' : '#fff'
      el.style.borderColor = sel ? '#1d4ed8' : '#e5e7eb'
      el.querySelector('svg')!.setAttribute('fill', sel ? '#fff' : '#374151')
      if (entry.lng !== lng || entry.lat !== lat) {
        animateMarker(entry.marker, entry.lng, entry.lat, lng, lat)
        entry.lng = lng; entry.lat = lat
      }
    } else {
      const el = carMarkerEl(sel)
      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' }).setLngLat([lng, lat]).addTo(map!)
      el.addEventListener('click', () => selectDistribuidor(d))
      markerMap.set(d.ID, { marker, lng, lat })
    }
  }
  if (withCoords.length > 1 && markerMap.size === withCoords.length) {
    const bounds = new mapboxgl.LngLatBounds()
    withCoords.forEach(d => bounds.extend([d.LONGITUD!, d.LATITUD!]))
    map!.fitBounds(bounds, { padding: 80, maxZoom: 14 })
  } else if (withCoords.length === 1) {
    map!.flyTo({ center: [withCoords[0].LONGITUD!, withCoords[0].LATITUD!], zoom: 14 })
  }
}

function applyTraffic() {
  if (!map || !trafficOn.value) return
  if (!map.getSource('mapbox-traffic')) {
    map.addSource('mapbox-traffic', { type: 'vector', url: 'mapbox://mapbox.mapbox-traffic-v1' })
    map.addLayer({ id: 'traffic-layer', type: 'line', source: 'mapbox-traffic', 'source-layer': 'traffic',
      paint: { 'line-width': 3, 'line-color': ['match', ['get', 'congestion'],
        'low', '#00c853', 'moderate', '#ff9800', 'heavy', '#f44336', 'severe', '#b71c1c', '#aaa'] } })
  }
}

function toggleTraffic() {
  if (!map) return
  trafficOn.value = !trafficOn.value
  if (trafficOn.value) { applyTraffic() }
  else if (map.getLayer('traffic-layer')) { map.setLayoutProperty('traffic-layer', 'visibility', 'none') }
}

function changeStyle(styleId: string) {
  if (!map || currentStyle.value === styleId) return
  currentStyle.value = styleId
  map.once('styledata', () => {
    syncMarkers()
    if (trafficOn.value) applyTraffic()
    if (trayectoria.value.length > 0) {
      if (routeMode.value === 'velocidad') drawSpeedRoute(trayectoria.value)
      else drawTrayectoria(trayectoria.value, matchedRouteCoords ?? undefined)
    }
  })
  for (const entry of markerMap.values()) entry.marker.remove()
  markerMap.clear()
  startMarker?.remove(); startMarker = null
  endMarker?.remove();   endMarker = null
  paradaMarkers.forEach(m => m.remove()); paradaMarkers = []
  map.setStyle(styleId)
}

function selectDistribuidor(d: Distribuidor) {
  if (selected.value?.ID !== d.ID) {
    clearTrayectoria(); trayectoria.value = []; paradas.value = []; trayectoriaLoaded.value = false; matchedRouteCoords = null
  }
  selected.value = d
  if (d.LATITUD && d.LONGITUD) map?.flyTo({ center: [d.LONGITUD, d.LATITUD], zoom: 15, speed: 1.2 })
  syncMarkers()
}

function closeCard() {
  clearTrayectoria(); trayectoria.value = []; paradas.value = []; trayectoriaLoaded.value = false
  matchedRouteCoords = null; selected.value = null; syncMarkers()
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const φ1 = lat1 * Math.PI / 180, φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180, Δλ = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

function detectParadas(puntos: PuntoTrayectoria[]) {
  const result: typeof paradas.value = []
  if (puntos.length < 2) return result
  let i = 0
  while (i < puntos.length - 1) {
    let j = i + 1
    while (j < puntos.length && haversine(+puntos[i].LATITUD, +puntos[i].LONGITUD, +puntos[j].LATITUD, +puntos[j].LONGITUD) < 50) j++
    if (j > i + 1) {
      const duracion = (parseHanaDate(puntos[j - 1].CREATED_AT).getTime() - parseHanaDate(puntos[i].CREATED_AT).getTime()) / 60000
      if (duracion >= 5) result.push({ lat: +puntos[i].LATITUD, lng: +puntos[i].LONGITUD, inicio: puntos[i].CREATED_AT, fin: puntos[j - 1].CREATED_AT, duracion: Math.round(duracion) })
    }
    i = j > i + 1 ? j : i + 1
  }
  return result
}

// ── Velocidad por segmento ────────────────────────────────────────────────────
function speedColor(kmh: number): string {
  if (kmh < 20)  return '#22c55e'  // verde  — lento
  if (kmh < 45)  return '#f59e0b'  // ámbar  — medio
  return '#ef4444'                  // rojo   — rápido
}

function calcSpeedStats(puntos: PuntoTrayectoria[]) {
  const speeds: number[] = []
  for (let i = 0; i < puntos.length - 1; i++) {
    const dist = haversine(+puntos[i].LATITUD, +puntos[i].LONGITUD, +puntos[i+1].LATITUD, +puntos[i+1].LONGITUD)
    const dt   = (parseHanaDate(puntos[i+1].CREATED_AT).getTime() - parseHanaDate(puntos[i].CREATED_AT).getTime()) / 1000
    if (dt > 0) speeds.push((dist / dt) * 3.6)
  }
  if (!speeds.length) return
  speedStats.value = {
    max: Math.round(Math.max(...speeds)),
    avg: Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length),
  }
}

function drawSpeedRoute(puntos: PuntoTrayectoria[]) {
  if (!map || puntos.length < 2) return
  clearTrayectoria()

  const features = puntos.slice(0, -1).map((p1, i) => {
    const p2   = puntos[i + 1]
    const dist = haversine(+p1.LATITUD, +p1.LONGITUD, +p2.LATITUD, +p2.LONGITUD)
    const dt   = (parseHanaDate(p2.CREATED_AT).getTime() - parseHanaDate(p1.CREATED_AT).getTime()) / 1000
    const kmh  = dt > 0 ? (dist / dt) * 3.6 : 0
    return {
      type: 'Feature' as const,
      properties: { color: speedColor(kmh), kmh: Math.round(kmh) },
      geometry: { type: 'LineString' as const, coordinates: [[+p1.LONGITUD, +p1.LATITUD], [+p2.LONGITUD, +p2.LATITUD]] },
    }
  })

  map.addSource('ruta', { type: 'geojson', data: { type: 'FeatureCollection', features } })
  map.addLayer({
    id: 'ruta-line', type: 'line', source: 'ruta',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': ['get', 'color'], 'line-width': 5 },
  })

  const rawCoords: [number, number][] = puntos.map(p => [+p.LONGITUD, +p.LATITUD])
  const sEl = document.createElement('div')
  sEl.style.cssText = 'width:12px;height:12px;border-radius:50%;background:#22c55e;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)'
  startMarker = new mapboxgl.Marker({ element: sEl }).setLngLat(rawCoords[0]).addTo(map!)
  const eEl = document.createElement('div')
  eEl.style.cssText = 'width:12px;height:12px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)'
  endMarker = new mapboxgl.Marker({ element: eEl }).setLngLat(rawCoords[rawCoords.length - 1]).addTo(map!)

  paradas.value.forEach((p, i) => {
    const size = Math.min(38, Math.max(22, 22 + Math.floor(p.duracion / 10) * 3))
    const pEl  = document.createElement('div')
    pEl.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;background:#f97316;border:2.5px solid white;box-shadow:0 2px 8px rgba(249,115,22,0.6);display:flex;align-items:center;justify-content:center;font-size:${size < 28 ? 9 : 11}px;font-weight:bold;color:white;cursor:pointer;`
    pEl.textContent = String(i + 1)
    const popup = new mapboxgl.Popup({ offset: size / 2 + 4, closeButton: false })
      .setHTML(`<div style="font-size:12px;line-height:1.5;padding:2px 4px"><b>Parada ${i + 1}</b><br>${formatTime(p.inicio)} → ${formatTime(p.fin)}<br><b>${p.duracion} min</b></div>`)
    paradaMarkers.push(new mapboxgl.Marker({ element: pEl }).setLngLat([p.lng, p.lat]).setPopup(popup).addTo(map!))
    pEl.addEventListener('click', () => popup.isOpen() ? popup.remove() : popup.addTo(map!))
  })

  const bounds = new mapboxgl.LngLatBounds()
  rawCoords.forEach(c => bounds.extend(c))
  map!.fitBounds(bounds, { padding: 80 })
}

// ── Map Matching API (snappea GPS a calles reales) ───────────────────────────
async function matchToRoads(puntos: PuntoTrayectoria[]): Promise<[number, number][] | null> {
  const MAX = 100
  const step = Math.ceil(puntos.length / MAX)
  const sampled: PuntoTrayectoria[] = []
  for (let i = 0; i < puntos.length; i += step) sampled.push(puntos[i])
  if (sampled[sampled.length - 1] !== puntos[puntos.length - 1]) sampled.push(puntos[puntos.length - 1])

  const coords   = sampled.map(p => `${+p.LONGITUD},${+p.LATITUD}`).join(';')
  const radiuses = sampled.map(() => '50').join(';')

  try {
    const res  = await fetch(
      `https://api.mapbox.com/matching/v5/mapbox/driving/${coords}` +
      `?access_token=${mapboxgl.accessToken}&geometries=geojson&radiuses=${radiuses}&overview=full&tidy=true`
    )
    const data = await res.json()
    if (data.code === 'Ok' && data.matchings?.length > 0) {
      const all: [number, number][] = []
      for (const m of data.matchings) all.push(...m.geometry.coordinates)
      return all
    }
    console.warn('[MapMatching] sin coincidencia, usando GPS crudo. Code:', data.code)
  } catch (err) {
    console.warn('[MapMatching] error API, usando GPS crudo:', err)
  }
  return null
}

function clearTrayectoria() {
  if (map?.getLayer('ruta-line')) map.removeLayer('ruta-line')
  if (map?.getSource('ruta')) map.removeSource('ruta')
  startMarker?.remove(); startMarker = null
  endMarker?.remove();   endMarker = null
  paradaMarkers.forEach(m => m.remove()); paradaMarkers = []
}

function drawTrayectoria(puntos: PuntoTrayectoria[], routeCoords?: [number, number][]) {
  if (!map || puntos.length === 0) return
  clearTrayectoria()
  const rawCoords: [number, number][] = puntos.map(p => [+p.LONGITUD, +p.LATITUD])
  const coords = routeCoords ?? rawCoords
  map.addSource('ruta', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } } })
  map.addLayer({ id: 'ruta-line', type: 'line', source: 'ruta', paint: { 'line-color': '#2563EB', 'line-width': 4, 'line-dasharray': [2, 1.5] } })
  // Marcadores inicio/fin sobre los puntos GPS reales (no el matched)
  const sEl = document.createElement('div')
  sEl.style.cssText = 'width:12px;height:12px;border-radius:50%;background:#22c55e;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)'
  startMarker = new mapboxgl.Marker({ element: sEl }).setLngLat(rawCoords[0]).addTo(map!)
  const eEl = document.createElement('div')
  eEl.style.cssText = 'width:12px;height:12px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)'
  endMarker = new mapboxgl.Marker({ element: eEl }).setLngLat(rawCoords[rawCoords.length - 1]).addTo(map!)
  paradas.value.forEach((p, i) => {
    // Tamaño proporcional a la duración (mín 22px, máx 38px)
    const size = Math.min(38, Math.max(22, 22 + Math.floor(p.duracion / 10) * 3))
    const pEl = document.createElement('div')
    pEl.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;background:#f97316;border:2.5px solid white;box-shadow:0 2px 8px rgba(249,115,22,0.6);display:flex;align-items:center;justify-content:center;font-size:${size < 28 ? 9 : 11}px;font-weight:bold;color:white;cursor:pointer;`
    pEl.textContent = String(i + 1)
    const popup = new mapboxgl.Popup({ offset: size / 2 + 4, closeButton: false, className: 'parada-popup' })
      .setHTML(`<div style="font-size:12px;line-height:1.5;padding:2px 4px"><b>Parada ${i + 1}</b><br>${formatTime(p.inicio)} → ${formatTime(p.fin)}<br><b>${p.duracion} min</b></div>`)
    paradaMarkers.push(new mapboxgl.Marker({ element: pEl }).setLngLat([p.lng, p.lat]).setPopup(popup).addTo(map!))
    pEl.addEventListener('click', () => popup.isOpen() ? popup.remove() : popup.addTo(map!))
  })
  const bounds = new mapboxgl.LngLatBounds()
  coords.forEach(c => bounds.extend(c))
  map!.fitBounds(bounds, { padding: 80 })
}

async function loadTrayectoria() {
  if (!selected.value) return
  trayectoriaLoading.value = true; trayectoriaLoaded.value = false
  try {
    const data = await distribuidoresService.getTrayectoria(selected.value.NOMBRE, fechaTrayectoria.value)
    trayectoria.value = data
    paradas.value = detectParadas(data)
    calcSpeedStats(data)
    trayectoriaLoaded.value = true
    if (map && data.length > 0) {
      if (routeMode.value === 'velocidad') {
        drawSpeedRoute(data)
      } else {
        matchedRouteCoords = await matchToRoads(data)
        drawTrayectoria(data, matchedRouteCoords ?? undefined)
      }
    }
  } catch (err: any) {
    console.error('[Trayectoria] error:', err.response?.data ?? err.message)
  } finally { trayectoriaLoading.value = false }
}

watch(routeMode, () => {
  if (!map || !trayectoria.value.length) return
  if (routeMode.value === 'velocidad') {
    drawSpeedRoute(trayectoria.value)
  } else {
    drawTrayectoria(trayectoria.value, matchedRouteCoords ?? undefined)
  }
})

function parseHanaDate(dateStr: string): Date {
  return new Date(String(dateStr).replace(' ', 'T'))
}

function formatTime(dateStr: string): string {
  try { return parseHanaDate(dateStr).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }) }
  catch { return String(dateStr) }
}

function flyToParada(p: { lat: number; lng: number }) {
  map?.flyTo({ center: [p.lng, p.lat], zoom: 16, speed: 1.5 })
}

async function loadDistribuidores() {
  loading.value = true
  try {
    const data = await distribuidoresService.getAll()
    const raw = Array.isArray(data) ? data : (data as any).distribuidores ?? []
    distribuidores.value = raw.map((d: any) => ({
      ...d,
      LATITUD:  d.LATITUD  != null ? parseFloat(d.LATITUD)  : null,
      LONGITUD: d.LONGITUD != null ? parseFloat(d.LONGITUD) : null,
    }))
    syncMarkers()
  } catch (err: any) {
    console.error('[Distribuidores] error:', err.response?.data ?? err.message)
  } finally { loading.value = false }
}

async function submitForm() {
  formError.value = ''; submitting.value = true
  try {
    await distribuidoresService.create({ nombre: form.value.nombre, latitud: form.value.latitud, longitud: form.value.longitud })
    form.value = { nombre: '', latitud: undefined, longitud: undefined }
    showForm.value = false; await loadDistribuidores()
  } catch (err: any) {
    formError.value = err.response?.data?.hanaError ?? err.response?.data?.message ?? 'Error al guardar'
  } finally { submitting.value = false }
}

onMounted(async () => {
  loadDistribuidores()
  await nextTick()
  if (!mapContainer.value) return
  map = new mapboxgl.Map({ container: mapContainer.value, style: currentStyle.value, center: [-63.1824, -17.7833], zoom: 12 })
  map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right')
  map.on('load', () => syncMarkers())
})

onUnmounted(() => {
  clearTrayectoria()
  for (const entry of markerMap.values()) entry.marker.remove()
  markerMap.clear(); map?.remove()
})
</script>

<style scoped>
.slide-left-enter-active, .slide-left-leave-active { transition: all 0.25s ease; }
.slide-left-enter-from, .slide-left-leave-to { opacity: 0; transform: translateX(-16px); }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(12px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
