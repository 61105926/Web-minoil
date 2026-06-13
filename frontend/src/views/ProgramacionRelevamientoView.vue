<template>
  <MainLayout>
    <div class="max-w-7xl mx-auto space-y-5">

      <!-- ── Header branded ─────────────────────────────────────────────────── -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#012F9D] to-[#1D4ED8] px-8 py-6 shadow-lg">
        <div class="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-white/5 pointer-events-none"></div>
        <div class="absolute right-16 bottom-0 w-32 h-32 rounded-full bg-[#FFCE00]/10 pointer-events-none"></div>
        <div class="relative flex flex-col sm:flex-row sm:items-center gap-5">
          <div class="flex items-center gap-4 flex-1 min-w-0">
            <div class="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-extrabold text-white leading-tight">Relevamiento Comercial</h1>
              <p class="text-blue-200 text-sm mt-0.5">Competidores · Asignaciones · Programación de campo</p>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <div class="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
              <span class="text-2xl font-black text-white">{{ asignaciones.length }}</span>
              <span class="text-xs text-blue-200 font-medium leading-tight">asig-<br>naciones</span>
            </div>
            <div class="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
              <span class="text-2xl font-black text-white">{{ tareas.length }}</span>
              <span class="text-xs text-blue-200 font-medium leading-tight">progra-<br>maciones</span>
            </div>
            <div class="flex items-center gap-2 bg-[#FFCE00]/20 rounded-xl px-4 py-2 border border-[#FFCE00]/30">
              <span class="text-2xl font-black text-[#FFCE00]">{{ tradeItems.length }}</span>
              <span class="text-xs text-yellow-200 font-medium leading-tight">competi-<br>dores</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Tabs segmented ─────────────────────────────────────────────────── -->
      <div class="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
        <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
          :class="activeTab === tab.id
            ? 'bg-[#012F9D] text-white shadow-md'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/60 dark:hover:bg-gray-700'"
          class="flex items-center gap-2 flex-1 justify-center px-4 py-2.5 text-sm font-bold rounded-xl transition-all whitespace-nowrap">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon" />
          </svg>
          {{ tab.label }}
          <span v-if="tab.count !== undefined"
            :class="activeTab === tab.id
              ? 'bg-white/20 text-white'
              : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'"
            class="text-xs font-black px-2 py-0.5 rounded-full">{{ tab.count }}</span>
        </button>
      </div>

      <!-- ══════════════════════ TAB: ASIGNACIÓN ════════════════════════════════ -->
      <template v-if="activeTab === 'asignacion'">

        <!-- Barra de búsqueda + botones -->
        <div class="flex gap-2 items-center flex-wrap">
          <div class="relative flex-1 min-w-[200px]">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input v-model="asigFilter" type="text" placeholder="Buscar producto por código o nombre..."
              class="w-full h-10 pl-9 pr-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
          </div>
          <button @click="descargarPlantillaAsig"
            class="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-bold px-3 py-2.5 rounded-xl transition-colors border border-gray-200 dark:border-gray-600 whitespace-nowrap">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Plantilla
          </button>
          <label class="flex items-center gap-1.5 cursor-pointer bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-2.5 rounded-xl transition-colors whitespace-nowrap shadow-sm">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
            </svg>
            Importar Excel
            <input type="file" accept=".xlsx,.xls,.csv" class="hidden" @change="onAsigExcelFile" />
          </label>
          <button @click="openAsigModal(null)"
            class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm whitespace-nowrap">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nueva asignación
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loadingAsig" class="flex items-center justify-center py-16">
          <div class="flex flex-col items-center gap-3 text-gray-400">
            <svg class="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            <p class="text-sm">Cargando asignaciones...</p>
          </div>
        </div>

        <!-- Grid de tarjetas -->
        <div v-else-if="filteredAsig.length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="a in pagedAsig" :key="`${a.itemCode}-${a.canal}`"
            class="bg-white dark:bg-gray-800 rounded-xl border border-l-4 border-gray-200 dark:border-gray-700 border-l-[#012F9D] shadow-sm hover:shadow-md transition-all overflow-hidden group">
            <!-- Card header -->
            <div class="flex items-start justify-between px-4 pt-4 pb-3">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span class="font-mono text-[10px] font-black text-[#012F9D] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">{{ a.itemCode }}</span>
                  <span :class="a.canal==='moderno'?'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400':a.canal==='tradicional'?'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400':'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'"
                    class="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                    {{ a.canal }}
                  </span>
                </div>
                <p class="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight" :title="a.itemName">
                  {{ a.itemName || '—' }}
                </p>
              </div>
              <div class="flex gap-1 ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="openAsigModal(a)" title="Editar"
                  class="p-1.5 text-gray-400 hover:text-[#012F9D] hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button @click="confirmDeleteAsig(a)" title="Eliminar"
                  class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
            <!-- Divider -->
            <div class="mx-4 border-t border-gray-100 dark:border-gray-700 mb-3"></div>
            <!-- Competitors -->
            <div class="px-4 pb-4 space-y-2">
              <template v-for="n in [1,2,3]">
                <div v-if="getAsigPlayer(a, n)" :key="`p${n}`" class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0"
                    :class="n===1?'bg-orange-500 text-white':n===2?'bg-amber-500 text-white':'bg-yellow-500 text-white'">
                    P{{ n }}
                  </span>
                  <span class="text-[10px] font-mono font-bold text-gray-400 dark:text-gray-500 w-12 flex-shrink-0">{{ getAsigPlayer(a, n) }}</span>
                  <span class="text-xs text-gray-700 dark:text-gray-300 truncate font-medium">{{ getAsigPlayerName(a, n) }}</span>
                </div>
                <div v-else :key="`e${n}`" class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600 flex items-center justify-center text-[10px] font-black text-gray-300 dark:text-gray-600">P{{ n }}</span>
                  <span class="text-xs text-gray-300 dark:text-gray-600 italic">Sin asignar</span>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Paginador Asignación -->
        <div v-if="filteredAsig.length > PAGE_SIZE" class="flex items-center justify-between mt-4">
          <p class="text-xs text-gray-400 dark:text-gray-500">
            {{ (asigPage-1)*PAGE_SIZE+1 }}–{{ Math.min(asigPage*PAGE_SIZE, filteredAsig.length) }} de {{ filteredAsig.length }}
          </p>
          <div class="flex gap-1">
            <button @click="asigPage--" :disabled="asigPage===1"
              class="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">‹ Ant.</button>
            <span class="px-3 py-1.5 text-xs rounded-lg bg-[#012F9D] text-white font-bold">{{ asigPage }} / {{ asigPages }}</span>
            <button @click="asigPage++" :disabled="asigPage===asigPages"
              class="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Sig. ›</button>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else-if="filteredAsig.length===0" class="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
          <svg class="w-14 h-14 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <p class="text-base font-semibold">{{ asigFilter ? 'Sin resultados' : 'No hay asignaciones' }}</p>
          <p class="text-sm mt-1">{{ asigFilter ? 'Probá otro término' : 'Creá la primera asignación de competidores' }}</p>
          <button v-if="!asigFilter" @click="openAsigModal(null)"
            class="mt-5 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Agregar asignación
          </button>
        </div>

        <!-- Modal asignación -->
        <Teleport to="body">
          <div v-if="asigModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <!-- Modal header -->
              <div class="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
                <h2 class="text-white font-bold text-lg">{{ asigEditing ? 'Editar asignación' : 'Nueva asignación' }}</h2>
                <p class="text-blue-100 text-sm mt-0.5">Vinculá tu producto con sus competidores directos</p>
              </div>

              <div class="p-6 space-y-5">
                <!-- Producto -->
                <div>
                  <label class="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Producto Minoil</label>
                  <div v-if="asigEditing" class="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-100 dark:border-blue-800">
                    <div class="w-9 h-9 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                      </svg>
                    </div>
                    <div>
                      <p class="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{{ asigForm.itemCode }}</p>
                      <p class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ asigForm.itemName }}</p>
                    </div>
                  </div>
                  <div v-else class="relative">
                    <input v-model="asigProductSearch" @focus="showAsigDropdown=true" @blur="hideAsigDropdown" type="text"
                      placeholder="Buscar producto SAP..." autocomplete="off"
                      class="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-xl px-3 pr-9 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <div v-if="showAsigDropdown && filteredAsigProductos.length > 0"
                      class="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl max-h-52 overflow-y-auto">
                      <button v-for="p in filteredAsigProductos.slice(0,40)" :key="p.itemCode"
                        @mousedown.prevent="selectAsigProducto(p)"
                        class="w-full text-left px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-gray-700 border-b border-gray-50 dark:border-gray-700 last:border-0">
                        <span class="text-xs font-bold text-blue-600 dark:text-blue-400 mr-2">{{ p.itemCode }}</span>
                        <span class="text-sm text-gray-700 dark:text-gray-300">{{ p.itemName }}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Canal -->
                <div>
                  <label class="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Canal</label>
                  <div class="flex gap-2">
                    <button v-for="opt in [{v:'ambos',l:'Ambos',cls:'bg-purple-100 text-purple-700 border-purple-300'},{v:'moderno',l:'Moderno',cls:'bg-emerald-100 text-emerald-700 border-emerald-300'},{v:'tradicional',l:'Tradicional',cls:'bg-amber-100 text-amber-700 border-amber-300'}]"
                      :key="opt.v"
                      @click="asigForm.canal = opt.v"
                      :class="asigForm.canal===opt.v ? opt.cls+' border-2 font-black shadow-sm' : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600'"
                      class="flex-1 py-2 px-3 text-xs rounded-lg border transition-all">
                      {{ opt.l }}
                    </button>
                  </div>
                </div>

                <!-- Competidores -->
                <div>
                  <label class="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">Competidores asignados</label>
                  <div class="space-y-2">
                    <div v-for="n in [1,2,3]" :key="n" class="flex items-center gap-2">
                      <!-- Badge P1/P2/P3 -->
                      <span class="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0 shadow-sm"
                        :class="n===1?'bg-orange-500 text-white':n===2?'bg-amber-500 text-white':'bg-yellow-500 text-white'">
                        P{{ n }}
                      </span>

                      <!-- Chip de seleccionado -->
                      <div v-if="getAsigFormPlayer(n)" class="flex-1 flex items-center gap-2 h-9 px-3 rounded-lg border"
                        :class="n===1?'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800':n===2?'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800':'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'">
                        <span class="font-mono text-[11px] font-black flex-shrink-0"
                          :class="n===1?'text-orange-600 dark:text-orange-400':n===2?'text-amber-600 dark:text-amber-400':'text-yellow-700 dark:text-yellow-400'">
                          {{ getAsigFormPlayer(n) }}
                        </span>
                        <span class="text-xs text-gray-700 dark:text-gray-300 truncate flex-1 font-medium">{{ resolvePlayerName(getAsigFormPlayer(n)) }}</span>
                        <button @click="clearAsigPlayer(n)" class="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors ml-1">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>

                      <!-- Input de búsqueda (cuando no hay selección) -->
                      <div v-else class="relative flex-1">
                        <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        <input :value="playerSearch[n-1]" @input="onAsigPlayerSearch(n, $event)"
                          @focus="asigPlayerFocus=n; showAsigPlayerDrop=true"
                          @blur="hideAsigPlayerDrop"
                          :placeholder="`Buscar competidor P${n}...`"
                          class="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-lg pl-8 pr-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400"/>
                        <div v-if="showAsigPlayerDrop && asigPlayerFocus===n"
                          class="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl max-h-52 overflow-y-auto">
                          <p v-if="filteredAsigPlayers.length===0" class="text-xs text-gray-400 text-center py-4">Sin resultados</p>
                          <button v-for="ti in filteredAsigPlayers" :key="ti.codigo"
                            @mousedown.prevent="selectAsigPlayer(n, ti)"
                            class="w-full text-left px-3 py-2.5 hover:bg-orange-50 dark:hover:bg-gray-700 border-b border-gray-50 dark:border-gray-700 last:border-0 flex items-center gap-2">
                            <span class="font-mono text-[10px] font-black px-1.5 py-0.5 rounded flex-shrink-0"
                              :class="n===1?'bg-orange-100 text-orange-600':n===2?'bg-amber-100 text-amber-600':'bg-yellow-100 text-yellow-700'">
                              {{ ti.codigo }}
                            </span>
                            <span class="text-sm text-gray-800 dark:text-gray-200 truncate">{{ ti.nombre }}</span>
                            <span v-if="ti.mercado" class="text-[10px] text-gray-400 ml-auto flex-shrink-0">{{ ti.mercado }}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <p v-if="asigError" class="text-sm text-red-500">{{ asigError }}</p>
              </div>

              <div class="flex gap-3 justify-end px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700">
                <button @click="asigModal=false" class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cancelar</button>
                <button @click="saveAsig" :disabled="asigSaving"
                  class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
                  <svg v-if="asigSaving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  {{ asigSaving ? 'Guardando...' : asigEditing ? 'Actualizar' : 'Guardar asignación' }}
                </button>
              </div>
            </div>
          </div>
        </Teleport>

        <!-- Confirm delete asignación -->
        <Teleport to="body">
          <div v-if="deleteAsigTarget" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-bold text-gray-900 dark:text-gray-100">Eliminar asignación</h3>
                  <p class="text-xs text-gray-500 mt-0.5">Los competidores serán desvinculados del producto</p>
                </div>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-5">
                ¿Eliminar la asignación de <strong class="text-gray-900 dark:text-gray-100">{{ deleteAsigTarget.itemName || deleteAsigTarget.itemCode }}</strong>?
              </p>
              <div class="flex gap-3 justify-end">
                <button @click="deleteAsigTarget=null" class="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancelar</button>
                <button @click="doDeleteAsig" :disabled="deletingAsig" class="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-lg">
                  {{ deletingAsig ? 'Eliminando...' : 'Eliminar' }}
                </button>
              </div>
            </div>
          </div>
        </Teleport>

        <!-- Modal importar asignaciones Excel -->
        <Teleport to="body">
          <div v-if="asigXlsxModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
              <div class="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5 flex-shrink-0">
                <h2 class="text-white font-bold text-lg">Importar asignaciones desde Excel</h2>
                <p class="text-green-100 text-sm mt-0.5">{{ asigXlsxRows.length }} filas detectadas — revisá antes de confirmar</p>
              </div>
              <div class="overflow-auto flex-1 p-4">
                <table class="w-full text-xs border-collapse">
                  <thead>
                    <tr class="bg-gray-50 dark:bg-gray-700">
                      <th v-for="h in Object.keys(asigXlsxRows[0] ?? {})" :key="h"
                        class="border border-gray-200 dark:border-gray-600 px-2 py-1.5 text-left font-bold text-gray-600 dark:text-gray-300">{{ h }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, i) in asigXlsxRows.slice(0, 50)" :key="i" class="hover:bg-blue-50 dark:hover:bg-gray-700">
                      <td v-for="h in Object.keys(asigXlsxRows[0] ?? {})" :key="h"
                        class="border border-gray-100 dark:border-gray-700 px-2 py-1 text-gray-700 dark:text-gray-300 truncate max-w-[140px]">{{ row[h] ?? '' }}</td>
                    </tr>
                  </tbody>
                </table>
                <p v-if="asigXlsxRows.length > 50" class="text-xs text-gray-400 mt-2 text-center">Mostrando 50 de {{ asigXlsxRows.length }} filas</p>
              </div>
              <p v-if="asigXlsxError" class="text-sm text-red-500 px-6 py-2 flex-shrink-0">{{ asigXlsxError }}</p>
              <div class="flex gap-3 justify-end px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 flex-shrink-0">
                <button @click="asigXlsxModal=false" class="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Cancelar</button>
                <button @click="confirmAsigXlsxImport" :disabled="asigXlsxImporting"
                  class="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors">
                  <svg v-if="asigXlsxImporting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  {{ asigXlsxImporting ? 'Importando...' : `Importar ${asigXlsxRows.length} asignaciones` }}
                </button>
              </div>
            </div>
          </div>
        </Teleport>

      </template><!-- fin tab asignacion -->

      <!-- ══════════════════════ TAB: PROGRAMACIÓN ══════════════════════════════ -->
      <template v-if="activeTab === 'programacion'">

        <!-- Stats metric cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div v-for="chip in statsChips" :key="chip.label"
            class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm px-5 py-4 flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" :class="chip.iconBg">
              <span class="w-3 h-3 rounded-full" :class="chip.dot"></span>
            </div>
            <div>
              <p class="text-2xl font-black text-gray-900 dark:text-gray-100 leading-none">{{ chip.count }}</p>
              <p class="text-xs font-semibold mt-0.5 capitalize" :class="chip.textCls">{{ chip.label }}</p>
            </div>
          </div>
        </div>

        <!-- Form crear programación -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button @click="formOpen=!formOpen"
            class="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
            <div class="text-left">
              <p class="font-bold text-base leading-tight">Nueva Programación</p>
              <p class="text-indigo-100 text-sm mt-0.5">Los competidores se cargan automáticamente desde la asignación</p>
            </div>
            <svg :class="formOpen?'rotate-180':''" class="w-5 h-5 text-indigo-200 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <div v-show="formOpen" class="p-6 space-y-5">
            <!-- Producto picker -->
            <div>
              <label class="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Producto <span class="text-red-500">*</span></label>
              <div v-if="!progForm.itemCode" class="relative">
                <input v-model="progProductSearch" @focus="showProgDrop=true" @blur="hideProgDrop" type="text"
                  placeholder="Buscar producto SAP..." autocomplete="off"
                  class="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-xl px-3 pr-9 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <div v-if="showProgDrop && filteredProgProductos.length > 0"
                  class="absolute z-30 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl max-h-56 overflow-y-auto">
                  <button v-for="p in filteredProgProductos.slice(0,50)" :key="p.itemCode"
                    @mousedown.prevent="selectProgProducto(p)"
                    class="w-full text-left px-4 py-2.5 hover:bg-indigo-50 dark:hover:bg-gray-700 border-b border-gray-50 dark:border-gray-700 last:border-0">
                    <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 mr-2">{{ p.itemCode }}</span>
                    <span class="text-sm text-gray-700 dark:text-gray-300">{{ p.itemName }}</span>
                  </button>
                </div>
              </div>

              <!-- Producto seleccionado -->
              <div v-else class="space-y-3">
                <div class="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800">
                  <div class="w-9 h-9 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{{ progForm.itemCode }}</p>
                    <p class="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{{ progForm.itemName }}</p>
                  </div>
                  <button @click="clearProgProducto" class="text-indigo-400 hover:text-indigo-600 flex-shrink-0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>

                <!-- Competidores auto-cargados -->
                <div class="px-1">
                  <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Competidores asignados:</p>
                  <div v-if="progPlayers.length > 0" class="flex flex-wrap gap-2">
                    <div v-for="(pl, i) in progPlayers" :key="i"
                      class="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
                      :class="i===0?'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300':i===1?'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300':'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'">
                      <span class="font-mono opacity-70">{{ pl.codigo }}</span>
                      {{ pl.nombre }}
                    </div>
                  </div>
                  <div v-else class="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg border border-amber-100 dark:border-amber-800">
                    <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                    Este producto no tiene competidores asignados. Configurá la asignación primero.
                  </div>
                </div>
              </div>
            </div>

            <!-- Período -->
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Fecha registro</label>
                <input v-model="progForm.fecha" type="date"
                  class="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Inicio <span class="text-red-500">*</span></label>
                <input v-model="progForm.fechaini" type="date"
                  class="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Fin <span class="text-red-500">*</span></label>
                <input v-model="progForm.fechafin" type="date"
                  class="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>
            </div>

            <!-- Alcance -->
            <div class="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/30 space-y-3">
              <p class="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Alcance de la programación</p>
              <!-- Nivel buttons -->
              <div class="grid grid-cols-4 gap-1.5">
                <button v-for="n in NIVELES" :key="n.id" type="button"
                  @click="progSelectNivel(n.id)"
                  :class="progNivel === n.id ? n.activeCls : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'"
                  class="flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl text-xs font-bold transition-all shadow-sm">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="n.iconPath"/>
                  </svg>
                  {{ n.label }}
                </button>
              </div>

              <!-- Nacional: solo mensaje -->
              <div v-if="progNivel === 'nacional'" class="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Aplica a todo el territorio — sin restricción geográfica
              </div>

              <!-- Ciudad / Ruta: search + chips -->
              <template v-if="progNivel === 'ciudad' || progNivel === 'ruta'">
                <div class="relative">
                  <input v-model="progAlcanceSearch"
                    :placeholder="progNivel === 'ciudad' ? 'Buscar ciudad...' : 'Buscar ruta...'"
                    class="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                  <div v-if="progAlcanceSearch && progAlcanceOpts.length"
                    class="absolute z-30 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl max-h-44 overflow-y-auto">
                    <button v-for="opt in progAlcanceOpts.slice(0,30)" :key="opt.code"
                      type="button" @mousedown.prevent="progAddItem(opt.name)"
                      class="w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-50 dark:border-gray-700 last:border-0">
                      <span class="font-mono text-xs text-indigo-500 mr-2">{{ opt.code }}</span>{{ opt.name }}
                    </button>
                  </div>
                </div>
                <p v-if="!progAlcanceOpts.length && progAlcanceSearch" class="text-xs text-gray-400 italic px-1">Sin resultados</p>
                <div v-if="progAlcanceItems.length" class="flex flex-wrap gap-1.5 mt-1">
                  <span v-for="item in progAlcanceItems" :key="item"
                    :class="nivelInfo(progNivel).chipCls"
                    class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {{ item }}
                    <button type="button" @click="progRemoveItem(item)" class="opacity-60 hover:opacity-100 ml-0.5 leading-none">×</button>
                  </span>
                </div>
                <p v-else class="text-xs text-gray-400 italic">Ninguna seleccionada todavía</p>
              </template>

              <!-- Cliente: búsqueda async -->
              <template v-if="progNivel === 'cliente'">
                <div class="relative">
                  <input v-model="progAlcanceSearch" placeholder="Buscar cliente por código o nombre..."
                    class="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-lg px-3 pr-9 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                  <svg v-if="progClienteLoading" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                </div>
                <div v-if="progClienteResults.length"
                  class="border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 max-h-44 overflow-y-auto">
                  <button v-for="c in progClienteResults" :key="c.code"
                    type="button" @mousedown.prevent="progAddItem(c.code)"
                    class="w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors">
                    <p class="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{{ c.code }}</p>
                    <p class="text-sm text-gray-700 dark:text-gray-300 truncate">{{ c.name }}</p>
                    <p v-if="c.city" class="text-[10px] text-gray-400">{{ c.city }}</p>
                  </button>
                </div>
                <div v-if="progAlcanceItems.length" class="flex flex-wrap gap-1.5 mt-1">
                  <span v-for="item in progAlcanceItems" :key="item"
                    class="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-1 rounded-full font-mono">
                    {{ item }}
                    <button type="button" @click="progRemoveItem(item)" class="opacity-60 hover:opacity-100 ml-0.5 leading-none">×</button>
                  </span>
                </div>
                <p v-if="!progAlcanceItems.length" class="text-xs text-gray-400 italic">Ningún cliente seleccionado — hacé clic en uno de la lista</p>
              </template>
            </div>

            <p v-if="progError" class="flex items-center gap-1.5 text-sm text-red-500">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {{ progError }}
            </p>

            <div class="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-700">
              <button @click="submitProg" :disabled="progSaving"
                class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors shadow-sm">
                <svg v-if="progSaving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                {{ progSaving ? 'Guardando...' : 'Crear programación' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Filtros -->
        <div class="flex flex-wrap gap-3 items-center">
          <div class="relative flex-1 min-w-[180px]">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input v-model="filterText" type="text" placeholder="Buscar producto..."
              class="w-full h-9 pl-9 pr-3 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"/>
          </div>
          <select v-model="filterNivel"
            class="h-9 border border-gray-200 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm">
            <option value="">Todos los niveles</option>
            <option v-for="n in NIVELES" :key="n.id" :value="n.id">{{ n.label }}</option>
          </select>
          <select v-model="filterEstado"
            class="h-9 border border-gray-200 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm">
            <option value="">Todos los estados</option>
            <option value="vigente">Vigente</option>
            <option value="pendiente">Pendiente</option>
            <option value="vencido">Vencido</option>
            <option value="inactivo">Inactivo</option>
          </select>
          <button v-if="filterText||filterNivel||filterEstado" @click="clearFilters"
            class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline">Limpiar</button>
          <span class="text-xs text-gray-400 ml-auto">{{ filteredTareas.length }} resultado{{ filteredTareas.length!==1?'s':'' }}</span>
        </div>

        <!-- Lista de programaciones como tarjetas -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h2 class="font-bold text-gray-900 dark:text-gray-100 text-sm">
              {{ filteredTareas.length }} programación{{ filteredTareas.length!==1?'es':'' }}
            </h2>
            <div v-if="loadingTable" class="flex items-center gap-2 text-xs text-gray-400">
              <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Actualizando...
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="filteredTareas.length===0" class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 py-16 flex flex-col items-center gap-3 text-gray-400 dark:text-gray-500">
            <svg class="w-12 h-12 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <p class="text-sm font-semibold">Sin programaciones</p>
            <p class="text-xs">{{ filterText||filterNivel||filterEstado?'Ajustá los filtros':'Creá la primera programación arriba' }}</p>
          </div>

          <!-- Grid de tarjetas -->
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="t in pagedTareas" :key="`${t.itemCode}-${t.fecha}`"
              class="bg-white dark:bg-gray-800 rounded-xl border border-l-4 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group flex flex-col"
              :class="estadoKey(t)==='vigente'?'border-l-green-500':estadoKey(t)==='pendiente'?'border-l-amber-400':estadoKey(t)==='vencido'?'border-l-red-500':'border-l-gray-300'">

              <!-- Header: código + estado + toggle -->
              <div class="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5 flex-wrap mb-1.5">
                    <span class="font-mono text-[10px] font-black text-[#012F9D] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">{{ t.itemCode }}</span>
                    <span :class="estadoBadgeClass(t)" class="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">{{ estadoLabel(t) }}</span>
                    <span v-if="daysLeft(t)!==null"
                      class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      :class="(daysLeft(t)??99)<=3?'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400':'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'">
                      {{ daysLeft(t)===0?'Vence hoy':`${daysLeft(t)}d` }}
                    </span>
                  </div>
                  <p class="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight line-clamp-2" :title="itemName(t)">{{ itemName(t)||'—' }}</p>
                </div>
                <button @click="toggleActivo(t)"
                  :class="t.activo?'bg-[#012F9D]':'bg-gray-200 dark:bg-gray-600'"
                  class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 mt-0.5 focus:outline-none">
                  <span :class="t.activo?'translate-x-5':'translate-x-1'"
                    class="inline-block h-3 w-3 transform rounded-full bg-white transition-transform shadow-sm"></span>
                </button>
              </div>

              <!-- Período -->
              <div class="px-4 pb-2 flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span class="font-medium text-gray-600 dark:text-gray-300">{{ t.fechaini }}</span>
                <span>→</span>
                <span class="font-medium text-gray-600 dark:text-gray-300">{{ t.fechafin }}</span>
              </div>
              <!-- Alcance badge -->
              <div class="px-4 pb-3">
                <span :class="nivelInfo(t.nivel).chipCls"
                  class="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                  <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="nivelInfo(t.nivel).iconPath"/>
                  </svg>
                  {{ nivelInfo(t.nivel).label }}
                  <span v-if="alcanceSummary(t)" class="normal-case font-semibold tracking-normal ml-0.5">· {{ alcanceSummary(t) }}</span>
                </span>
              </div>

              <!-- Competidores -->
              <div class="px-4 pb-3 border-t border-gray-100 dark:border-gray-700 pt-3 space-y-1.5 flex-1">
                <div v-for="(pl,i) in playersOf(t)" :key="i" class="flex items-center gap-2">
                  <span class="w-6 h-5 rounded flex items-center justify-center text-[9px] font-black text-white flex-shrink-0"
                    :class="i===0?'bg-orange-500':i===1?'bg-amber-500':'bg-yellow-600'">P{{ i+1 }}</span>
                  <span class="text-xs font-medium text-gray-700 dark:text-gray-300 truncate" :title="pl">{{ pl }}</span>
                </div>
                <div v-if="playersOf(t).length===0" class="flex items-center gap-2">
                  <span class="w-6 h-5 rounded border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-[9px] text-gray-400">?</span>
                  <span class="text-xs text-gray-400 italic">Sin competidores</span>
                </div>
              </div>

              <!-- Acciones (hover) -->
              <div class="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="openEditProg(t)"
                  class="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#012F9D] hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2.5 py-1.5 rounded-lg transition-colors">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Editar
                </button>
                <button @click="confirmDeleteProg(t)"
                  class="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2.5 py-1.5 rounded-lg transition-colors">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  Eliminar
                </button>
              </div>

            </div>
          </div>
        </div>

        <!-- Paginador Programación -->
        <div v-if="filteredTareas.length > PAGE_SIZE" class="flex items-center justify-between mt-4">
          <p class="text-xs text-gray-400 dark:text-gray-500">
            {{ (progPage-1)*PAGE_SIZE+1 }}–{{ Math.min(progPage*PAGE_SIZE, filteredTareas.length) }} de {{ filteredTareas.length }}
          </p>
          <div class="flex gap-1">
            <button @click="progPage--" :disabled="progPage===1"
              class="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">‹ Ant.</button>
            <span class="px-3 py-1.5 text-xs rounded-lg bg-indigo-600 text-white font-bold">{{ progPage }} / {{ progPages }}</span>
            <button @click="progPage++" :disabled="progPage===progPages"
              class="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Sig. ›</button>
          </div>
        </div>

        <!-- Modal editar período -->
        <Teleport to="body">
          <div v-if="editProgTarget" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md">
              <h3 class="font-bold text-gray-900 dark:text-gray-100 text-lg mb-1">Editar programación</h3>
              <p class="text-xs text-gray-500 mb-5">
                <span class="font-mono font-bold text-indigo-600 dark:text-indigo-400">{{ editProgTarget.itemCode }}</span> · {{ editProgTarget.itemName }}
              </p>
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Fecha inicio</label>
                  <input v-model="editProgForm.fechaini" type="date"
                    class="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Fecha fin</label>
                  <input v-model="editProgForm.fechafin" type="date"
                    class="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                </div>
              </div>
              <!-- Alcance selector (edit) -->
              <div class="mb-5 rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/30 space-y-3">
                <p class="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Alcance</p>
                <div class="grid grid-cols-4 gap-1.5">
                  <button v-for="n in NIVELES" :key="n.id" type="button"
                    @click="editSelectNivel(n.id)"
                    :class="editNivel === n.id ? n.activeCls : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'"
                    class="flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs font-bold transition-all shadow-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="n.iconPath"/>
                    </svg>
                    {{ n.label }}
                  </button>
                </div>

                <div v-if="editNivel === 'nacional'" class="text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
                  Todo el territorio nacional
                </div>

                <template v-if="editNivel === 'ciudad' || editNivel === 'ruta'">
                  <div class="relative">
                    <input v-model="editAlcanceSearch"
                      :placeholder="editNivel === 'ciudad' ? 'Buscar ciudad...' : 'Buscar ruta...'"
                      class="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                    <div v-if="editAlcanceSearch && editAlcanceOpts.length"
                      class="absolute z-30 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl max-h-40 overflow-y-auto">
                      <button v-for="opt in editAlcanceOpts.slice(0,30)" :key="opt.code"
                        type="button" @mousedown.prevent="editAddItem(opt.name)"
                        class="w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-50 dark:border-gray-700 last:border-0">
                        <span class="font-mono text-xs text-indigo-500 mr-2">{{ opt.code }}</span>{{ opt.name }}
                      </button>
                    </div>
                  </div>
                  <div v-if="editAlcanceItems.length" class="flex flex-wrap gap-1.5">
                    <span v-for="item in editAlcanceItems" :key="item"
                      :class="nivelInfo(editNivel).chipCls"
                      class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {{ item }}
                      <button type="button" @click="editRemoveItem(item)" class="opacity-60 hover:opacity-100 ml-0.5 leading-none">×</button>
                    </span>
                  </div>
                  <p v-else class="text-xs text-gray-400 italic">Ninguna seleccionada</p>
                </template>

                <template v-if="editNivel === 'cliente'">
                  <div class="relative">
                    <input v-model="editAlcanceSearch" placeholder="Buscar cliente..."
                      class="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-lg px-3 pr-9 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                    <svg v-if="editClienteLoading" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                  </div>
                  <div v-if="editClienteResults.length"
                    class="border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 max-h-40 overflow-y-auto">
                    <button v-for="c in editClienteResults" :key="c.code"
                      type="button" @mousedown.prevent="editAddItem(c.code)"
                      class="w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors">
                      <p class="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{{ c.code }}</p>
                      <p class="text-sm text-gray-700 dark:text-gray-300 truncate">{{ c.name }}</p>
                    </button>
                  </div>
                  <div v-if="editAlcanceItems.length" class="flex flex-wrap gap-1.5">
                    <span v-for="item in editAlcanceItems" :key="item"
                      class="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-mono">
                      {{ item }}
                      <button type="button" @click="editRemoveItem(item)" class="opacity-60 hover:opacity-100 ml-0.5 leading-none">×</button>
                    </span>
                  </div>
                  <p v-else class="text-xs text-gray-400 italic">Ningún cliente seleccionado</p>
                </template>
              </div>
              <div class="flex gap-3 justify-end">
                <button @click="editProgTarget=null" class="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancelar</button>
                <button @click="doEditProg" :disabled="editProgSaving"
                  class="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg flex items-center gap-2">
                  <svg v-if="editProgSaving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  {{ editProgSaving?'Guardando...':'Guardar cambios' }}
                </button>
              </div>
            </div>
          </div>
        </Teleport>

        <!-- Confirm delete programación -->
        <Teleport to="body">
          <div v-if="deleteProgTarget" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-bold text-gray-900 dark:text-gray-100">Eliminar programación</h3>
                  <p class="text-xs text-gray-500 mt-0.5">Esta acción no se puede deshacer</p>
                </div>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-5">
                ¿Eliminar la programación de <strong class="text-gray-900 dark:text-gray-100">{{ deleteProgTarget.itemCode }}</strong> del {{ deleteProgTarget.fecha }}?
              </p>
              <div class="flex gap-3 justify-end">
                <button @click="deleteProgTarget=null" class="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancelar</button>
                <button @click="doDeleteProg" :disabled="deletingProg" class="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-lg">
                  {{ deletingProg?'Eliminando...':'Eliminar' }}
                </button>
              </div>
            </div>
          </div>
        </Teleport>

      </template><!-- fin tab programacion -->

      <!-- ══════════════════════ TAB: CATÁLOGO ══════════════════════════════════ -->
      <template v-if="activeTab === 'catalogo'">

        <!-- ── Formulario ──────────────────────────────────────────────────────── -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">

          <!-- Header con gradiente indigo -->
          <div class="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-5">
            <div class="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none"></div>
            <div class="relative flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
              </div>
              <div>
                <h2 class="text-white font-extrabold text-base leading-tight">{{ editingItem ? 'Editar competidor' : 'Nuevo competidor' }}</h2>
                <p class="text-indigo-100 text-xs mt-0.5">Código único · Nombre · Clasificación de producto</p>
              </div>
              <div v-if="editingItem" class="ml-auto">
                <span class="font-mono text-xs font-black text-white bg-white/20 px-3 py-1.5 rounded-lg">{{ editingItem.codigo }}</span>
              </div>
            </div>
          </div>

          <div class="p-6 space-y-5">
            <!-- Sección 1: identidad (campos obligatorios) -->
            <div>
              <p class="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span class="w-4 h-px bg-gray-300 dark:bg-gray-600 inline-block"></span>
                Identidad
                <span class="w-4 h-px bg-gray-300 dark:bg-gray-600 inline-block"></span>
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <!-- Código -->
                <div>
                  <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                    Código <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
                      </svg>
                    </span>
                    <input :value="getCatField('codigo')" @input="onCatFieldInput('codigo', $event)"
                      placeholder="Ej: ABC01"
                      class="w-full h-10 border border-gray-200 dark:border-gray-600 rounded-xl pl-9 pr-3 text-sm font-mono font-bold bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                  </div>
                </div>
                <!-- ID Producto -->
                <div>
                  <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">ID Producto</label>
                  <input :value="getCatField('idProducto')" @input="onCatFieldInput('idProducto', $event)"
                    placeholder="Ej: A00001"
                    class="w-full h-10 border border-gray-200 dark:border-gray-600 rounded-xl px-3 text-sm font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
                <!-- Nombre -->
                <div class="sm:col-span-2">
                  <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                    Nombre <span class="text-red-500">*</span>
                  </label>
                  <input :value="getCatField('nombre')" @input="onCatFieldInput('nombre', $event)"
                    placeholder="Nombre del producto competidor"
                    class="w-full h-10 border border-gray-200 dark:border-gray-600 rounded-xl px-3 text-sm font-semibold bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
              </div>
            </div>

            <!-- Sección 2: clasificación (opcionales) -->
            <div>
              <p class="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span class="w-4 h-px bg-gray-300 dark:bg-gray-600 inline-block"></span>
                Clasificación
                <span class="text-gray-300 dark:text-gray-600 font-normal normal-case tracking-normal">(opcional)</span>
                <span class="w-4 h-px bg-gray-300 dark:bg-gray-600 inline-block"></span>
              </p>
              <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div v-for="f in catFields.filter(f => ['rubro','grupo','subgrupo','clase','subclase'].includes(f.key))" :key="f.key">
                  <label class="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5">{{ f.label }}</label>
                  <input :value="getCatField(f.key)" @input="onCatFieldInput(f.key, $event)" :placeholder="f.ph||''"
                    class="w-full h-9 border border-gray-200 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
                </div>
              </div>
            </div>

            <!-- Sección 3: detalles (mercado, estado, peso) -->
            <div>
              <p class="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span class="w-4 h-px bg-gray-300 dark:bg-gray-600 inline-block"></span>
                Detalles
                <span class="text-gray-300 dark:text-gray-600 font-normal normal-case tracking-normal">(opcional)</span>
                <span class="w-4 h-px bg-gray-300 dark:bg-gray-600 inline-block"></span>
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label class="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5">Mercado</label>
                  <input :value="getCatField('mercado')" @input="onCatFieldInput('mercado', $event)" placeholder="Ej: Nacional"
                    class="w-full h-9 border border-gray-200 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5">Estado</label>
                  <input :value="getCatField('estado')" @input="onCatFieldInput('estado', $event)" placeholder="Activo / Inactivo"
                    class="w-full h-9 border border-gray-200 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5">Peso Neto (kg)</label>
                  <input :value="getCatField('pesoNeto')" @input="onCatFieldInput('pesoNeto', $event)" placeholder="0.00" type="number" step="0.01"
                    class="w-full h-9 border border-gray-200 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
                </div>
              </div>
            </div>

            <!-- Error + acciones -->
            <div>
              <p v-if="itemFormError" class="flex items-center gap-1.5 text-sm text-red-500 mb-3">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {{ itemFormError }}
              </p>
              <div class="flex gap-2 justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                <button v-if="editingItem" @click="cancelEditItem"
                  class="px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-colors">
                  Cancelar
                </button>
                <button @click="submitItem" :disabled="savingItem"
                  class="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 disabled:opacity-50 text-white text-sm font-bold px-6 py-2 rounded-xl transition-all shadow-sm">
                  <svg v-if="savingItem" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  {{ savingItem ? 'Guardando...' : editingItem ? 'Actualizar competidor' : 'Agregar competidor' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Lista de competidores ────────────────────────────────────────────── -->
        <div>
          <!-- Header de sección -->
          <div class="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <div class="flex items-center gap-3">
              <h2 class="font-extrabold text-gray-900 dark:text-gray-100">Competidores registrados</h2>
              <span class="text-xs font-black bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full">{{ filteredCat.length }}</span>
            </div>
            <!-- Buscador + importar Excel -->
            <div class="flex items-center gap-2">
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input v-model="catFilter" placeholder="Buscar competidor..." class="h-9 pl-9 pr-3 w-44 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
              </div>
              <button @click="descargarPlantilla"
                class="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-bold px-3 py-2 rounded-xl transition-colors whitespace-nowrap border border-gray-200 dark:border-gray-600">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                Plantilla
              </button>
              <label class="flex items-center gap-1.5 cursor-pointer bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors whitespace-nowrap shadow-sm">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
                </svg>
                Importar Excel
                <input type="file" accept=".xlsx,.xls,.csv" class="hidden" @change="onExcelFile" />
              </label>
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="filteredCat.length===0"
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 py-16 flex flex-col items-center gap-3 text-gray-400 dark:text-gray-500">
            <div class="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
              <svg class="w-8 h-8 text-indigo-300 dark:text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
            </div>
            <p class="text-sm font-semibold">Sin competidores registrados</p>
            <p class="text-xs">Agregá el primer competidor usando el formulario de arriba</p>
          </div>

          <!-- Grid de tarjetas -->
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="ti in pagedCat" :key="ti.id"
              class="bg-white dark:bg-gray-800 rounded-xl border border-l-4 border-l-indigo-500 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group">

              <!-- Header de tarjeta -->
              <div class="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span class="font-mono text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">{{ ti.codigo }}</span>
                    <!-- Estado chip -->
                    <span v-if="ti.estado"
                      :class="String(ti.estado).toLowerCase().includes('activ') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'"
                      class="text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {{ ti.estado }}
                    </span>
                    <!-- Mercado chip -->
                    <span v-if="ti.mercado" class="text-[10px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                      {{ ti.mercado }}
                    </span>
                  </div>
                  <p class="text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight">{{ ti.nombre }}</p>
                  <p v-if="ti.idProducto" class="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-mono">ID: {{ ti.idProducto }}</p>
                </div>
                <div class="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="editItem(ti)" title="Editar"
                    class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button @click="confirmDeleteItem(ti)" title="Eliminar"
                    class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Clasificación + peso -->
              <div class="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3 space-y-2">
                <!-- Breadcrumb rubro › grupo › subgrupo -->
                <div v-if="ti.rubro||ti.grupo||ti.subgrupo" class="flex items-center gap-1 flex-wrap text-xs text-gray-500 dark:text-gray-400">
                  <span v-if="ti.rubro" class="font-semibold text-indigo-600 dark:text-indigo-400">{{ ti.rubro }}</span>
                  <span v-if="ti.rubro && ti.grupo" class="text-gray-300 dark:text-gray-600">›</span>
                  <span v-if="ti.grupo">{{ ti.grupo }}</span>
                  <span v-if="ti.grupo && ti.subgrupo" class="text-gray-300 dark:text-gray-600">›</span>
                  <span v-if="ti.subgrupo">{{ ti.subgrupo }}</span>
                </div>
                <div v-else class="text-xs text-gray-300 dark:text-gray-600 italic">Sin clasificación</div>

                <!-- Chips clase + subclase + peso neto -->
                <div class="flex gap-1.5 flex-wrap items-center">
                  <span v-if="ti.clase"
                    class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                    {{ ti.clase }}
                  </span>
                  <span v-if="ti.subclase"
                    class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                    {{ ti.subclase }}
                  </span>
                  <span v-if="ti.pesoNeto != null" class="text-[10px] text-gray-400 dark:text-gray-500 ml-auto font-mono">
                    {{ ti.pesoNeto }} kg
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Paginador Catálogo -->
          <div v-if="filteredCat.length > PAGE_SIZE" class="flex items-center justify-between mt-4">
            <p class="text-xs text-gray-400 dark:text-gray-500">
              {{ (catPage-1)*PAGE_SIZE+1 }}–{{ Math.min(catPage*PAGE_SIZE, filteredCat.length) }} de {{ filteredCat.length }}
            </p>
            <div class="flex gap-1">
              <button @click="catPage--" :disabled="catPage===1"
                class="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">‹ Ant.</button>
              <span class="px-3 py-1.5 text-xs rounded-lg bg-indigo-600 text-white font-bold">{{ catPage }} / {{ catPages }}</span>
              <button @click="catPage++" :disabled="catPage===catPages"
                class="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Sig. ›</button>
            </div>
          </div>
        </div>

        <!-- Modal eliminar competidor -->
        <Teleport to="body">
          <div v-if="deleteItemTarget" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-bold text-gray-900 dark:text-gray-100">Eliminar competidor</h3>
                  <p class="text-xs text-gray-500 mt-0.5">Esta acción no se puede deshacer</p>
                </div>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-5">
                ¿Eliminar <strong class="text-gray-900 dark:text-gray-100">{{ deleteItemTarget.nombre }}</strong>
                <span class="font-mono text-xs text-indigo-500 ml-1">({{ deleteItemTarget.codigo }})</span>?
              </p>
              <div class="flex gap-3 justify-end">
                <button @click="deleteItemTarget=null"
                  class="px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold">
                  Cancelar
                </button>
                <button @click="doDeleteItem" :disabled="deletingItem"
                  class="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-2">
                  <svg v-if="deletingItem" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  {{ deletingItem ? 'Eliminando...' : 'Eliminar' }}
                </button>
              </div>
            </div>
          </div>
        </Teleport>

        <!-- Modal importar Excel -->
        <Teleport to="body">
          <div v-if="xlsxModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
              <div class="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5 flex-shrink-0">
                <h2 class="text-white font-bold text-lg">Importar competidores desde Excel</h2>
                <p class="text-green-100 text-sm mt-0.5">{{ xlsxRows.length }} filas detectadas — revisá antes de confirmar</p>
              </div>
              <div class="overflow-auto flex-1 p-4">
                <table class="w-full text-xs border-collapse">
                  <thead>
                    <tr class="bg-gray-50 dark:bg-gray-700">
                      <th v-for="h in xlsxHeaders" :key="h" class="border border-gray-200 dark:border-gray-600 px-2 py-1.5 text-left font-bold text-gray-600 dark:text-gray-300">{{ h }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, i) in xlsxRows.slice(0, 50)" :key="i" class="hover:bg-blue-50 dark:hover:bg-gray-700">
                      <td v-for="h in xlsxHeaders" :key="h" class="border border-gray-100 dark:border-gray-700 px-2 py-1 text-gray-700 dark:text-gray-300 truncate max-w-[120px]">{{ row[h] ?? '' }}</td>
                    </tr>
                  </tbody>
                </table>
                <p v-if="xlsxRows.length > 50" class="text-xs text-gray-400 mt-2 text-center">Mostrando 50 de {{ xlsxRows.length }} filas</p>
              </div>
              <p v-if="xlsxError" class="text-sm text-red-500 px-6 py-2 flex-shrink-0">{{ xlsxError }}</p>
              <div class="flex gap-3 justify-end px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 flex-shrink-0">
                <button @click="xlsxModal=false" class="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Cancelar</button>
                <button @click="confirmXlsxImport" :disabled="xlsxImporting"
                  class="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors">
                  <svg v-if="xlsxImporting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  {{ xlsxImporting ? 'Importando...' : `Importar ${xlsxRows.length} registros` }}
                </button>
              </div>
            </div>
          </div>
        </Teleport>

      </template><!-- fin tab catalogo -->

    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import * as XLSX from 'xlsx'
import MainLayout from '@/components/layouts/MainLayout.vue'
import svc, { type ProductoSAP, type TradeItem, type PlayerSap, type PlayersTask, type Ruta, type Cliente } from '@/services/categoria-relevamiento.service'

const today = new Date().toISOString().split('T')[0]

// ── Tabs ──────────────────────────────────────────────────────────────────────
const activeTab = ref('asignacion')
const tabs = computed(() => [
  { id: 'asignacion',   label: 'Asignación',    icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1', count: asignaciones.value.length },
  { id: 'programacion', label: 'Programación',  icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', count: tareas.value.length },
  { id: 'catalogo',     label: 'Catálogo',      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', count: tradeItems.value.length },
])

// ── Shared data ───────────────────────────────────────────────────────────────
const productos    = ref<ProductoSAP[]>([])
const tradeItems   = ref<TradeItem[]>([])
const asignaciones = ref<PlayerSap[]>([])
const tareas       = ref<PlayersTask[]>([])
const ciudades     = ref<{ code: string; name: string }[]>([])
const rutas        = ref<Ruta[]>([])
const loadingTable = ref(false)
const loadingAsig  = ref(false)

// ── Alcance helpers ───────────────────────────────────────────────────────────
const NIVELES = [
  { id: 'nacional',  label: 'Nacional',  iconPath: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', activeCls: 'bg-[#012F9D] text-white', chipCls: 'bg-blue-100 text-[#012F9D]' },
  { id: 'ciudad',    label: 'Ciudad',    iconPath: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z', activeCls: 'bg-indigo-600 text-white', chipCls: 'bg-indigo-100 text-indigo-700' },
  { id: 'ruta',      label: 'Ruta',      iconPath: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7', activeCls: 'bg-purple-600 text-white', chipCls: 'bg-purple-100 text-purple-700' },
  { id: 'cliente',   label: 'Cliente',   iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', activeCls: 'bg-emerald-600 text-white', chipCls: 'bg-emerald-100 text-emerald-700' },
]

function alcanceFromString(s: string | null | undefined): string[] {
  if (!s) return []
  try { return JSON.parse(s) } catch { return [] }
}
function alcanceToString(items: string[]): string | null {
  return items.length ? JSON.stringify(items) : null
}
function nivelInfo(id?: string | null) {
  return NIVELES.find(n => n.id === (id ?? 'nacional')) ?? NIVELES[0]
}
function alcanceSummary(t: PlayersTask): string {
  const items = alcanceFromString(t.alcance)
  if (!items.length) return ''
  if (items.length <= 3) return items.join(' · ')
  return `${items.slice(0, 3).join(' · ')} +${items.length - 3}`
}

// Alcance selector state — CREATE form
const progNivel        = ref('nacional')
const progAlcanceItems = ref<string[]>([])
const progAlcanceSearch = ref('')
const progClienteResults = ref<Cliente[]>([])
const progClienteLoading = ref(false)
let progClienteTimer: ReturnType<typeof setTimeout> | undefined

watch(progAlcanceSearch, async (q) => {
  if (progNivel.value !== 'cliente') return
  clearTimeout(progClienteTimer)
  progClienteLoading.value = true
  progClienteTimer = setTimeout(async () => {
    try { progClienteResults.value = await svc.getClientes(q || undefined) }
    finally { progClienteLoading.value = false }
  }, 300)
})

const progAlcanceOpts = computed(() => {
  const q = progAlcanceSearch.value.toLowerCase()
  if (progNivel.value === 'ciudad') return ciudades.value.filter(c => String(c.name ?? '').toLowerCase().includes(q) || String(c.code ?? '').toLowerCase().includes(q))
  if (progNivel.value === 'ruta')   return rutas.value.filter(r => String(r.name ?? '').toLowerCase().includes(q) || String(r.code ?? '').toLowerCase().includes(q))
  return [] as { code: string; name: string }[]
})

function progAddItem(val: string) {
  if (!progAlcanceItems.value.includes(val)) progAlcanceItems.value.push(val)
  progAlcanceSearch.value = ''
}
function progRemoveItem(val: string) {
  progAlcanceItems.value = progAlcanceItems.value.filter(v => v !== val)
}
async function progSelectNivel(id: string) {
  progNivel.value = id
  progAlcanceItems.value = []
  progAlcanceSearch.value = ''
  progClienteResults.value = []
  if (id === 'cliente') {
    progClienteLoading.value = true
    try { progClienteResults.value = await svc.getClientes() }
    finally { progClienteLoading.value = false }
  }
}

// Alcance selector state — EDIT modal
const editNivel         = ref('nacional')
const editAlcanceItems  = ref<string[]>([])
const editAlcanceSearch = ref('')
const editClienteResults = ref<Cliente[]>([])
const editClienteLoading = ref(false)
let editClienteTimer: ReturnType<typeof setTimeout> | undefined

watch(editAlcanceSearch, async (q) => {
  if (editNivel.value !== 'cliente') return
  clearTimeout(editClienteTimer)
  editClienteLoading.value = true
  editClienteTimer = setTimeout(async () => {
    try { editClienteResults.value = await svc.getClientes(q || undefined) }
    finally { editClienteLoading.value = false }
  }, 300)
})

const editAlcanceOpts = computed(() => {
  const q = editAlcanceSearch.value.toLowerCase()
  if (editNivel.value === 'ciudad') return ciudades.value.filter(c => String(c.name ?? '').toLowerCase().includes(q) || String(c.code ?? '').toLowerCase().includes(q))
  if (editNivel.value === 'ruta')   return rutas.value.filter(r => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q))
  return []
})

function editAddItem(val: string) {
  if (!editAlcanceItems.value.includes(val)) editAlcanceItems.value.push(val)
  editAlcanceSearch.value = ''
}
function editRemoveItem(val: string) {
  editAlcanceItems.value = editAlcanceItems.value.filter(v => v !== val)
}
async function editSelectNivel(id: string) {
  editNivel.value = id
  editAlcanceItems.value = []
  editAlcanceSearch.value = ''
  editClienteResults.value = []
  if (id === 'cliente') {
    editClienteLoading.value = true
    try { editClienteResults.value = await svc.getClientes() }
    finally { editClienteLoading.value = false }
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function resolvePlayerName(codigo: string | null | undefined): string {
  if (!codigo) return ''
  const c = String(codigo).trim()
  return tradeItems.value.find(t => String(t.codigo).trim() === c)?.nombre ?? c
}

function getAsigPlayer(a: PlayerSap, n: number): string | null {
  return (n===1 ? a.players1 : n===2 ? a.players2 : a.players3) ?? null
}

function getAsigPlayerName(a: PlayerSap, n: number): string {
  const np = n===1 ? a.nombrePlayer1 : n===2 ? a.nombrePlayer2 : a.nombrePlayer3
  return np ?? resolvePlayerName(getAsigPlayer(a, n)) ?? ''
}

// ══════════════════════════ ASIGNACIÓN ════════════════════════════════════════

const asigFilter       = ref('')
const asigModal        = ref(false)
const asigEditing      = ref<PlayerSap | null>(null)
const asigSaving       = ref(false)
const asigError        = ref('')
const deleteAsigTarget = ref<PlayerSap | null>(null)
const deletingAsig     = ref(false)
const showAsigDropdown = ref(false)
const showAsigPlayerDrop = ref(false)
const asigPlayerFocus  = ref(0)
const playerSearch     = ref<[string, string, string]>(['', '', ''])
const asigProductSearch = ref('')

const asigForm = ref<PlayerSap>({
  itemCode: '', canal: 'ambos', itemName: '', players1: null, players2: null, players3: null
})

const filteredAsig = computed(() => {
  const q = asigFilter.value.toLowerCase()
  if (!q) return asignaciones.value
  return asignaciones.value.filter(a =>
    a.itemCode.toLowerCase().includes(q) || (a.itemName ?? '').toLowerCase().includes(q)
  )
})

const filteredAsigProductos = computed(() => {
  const q = asigProductSearch.value.toLowerCase()
  if (!q) return productos.value
  return productos.value.filter(p =>
    p.itemCode.toLowerCase().includes(q) || p.itemName.toLowerCase().includes(q)
  )
})

const filteredAsigPlayers = computed(() => {
  const idx = asigPlayerFocus.value - 1
  const val = (idx >= 0 ? playerSearch.value[idx as 0|1|2] : '').toLowerCase()
  if (!val) return tradeItems.value.slice(0, 50)
  return tradeItems.value.filter(t =>
    t.codigo.toLowerCase().includes(val) || t.nombre.toLowerCase().includes(val)
  ).slice(0, 50)
})

function getAsigFormPlayer(n: number): string {
  return (n===1 ? asigForm.value.players1 : n===2 ? asigForm.value.players2 : asigForm.value.players3) ?? ''
}

function setAsigFormPlayer(n: number, val: string) {
  if (n===1) asigForm.value.players1 = val || null
  else if (n===2) asigForm.value.players2 = val || null
  else asigForm.value.players3 = val || null
}

function onAsigPlayerSearch(n: number, e: Event) {
  playerSearch.value[n-1 as 0|1|2] = (e.target as HTMLInputElement).value
}

function clearAsigPlayer(n: number) {
  setAsigFormPlayer(n, '')
  playerSearch.value[n-1 as 0|1|2] = ''
}

function selectAsigPlayer(n: number, ti: TradeItem) {
  setAsigFormPlayer(n, ti.codigo)
  playerSearch.value[n-1 as 0|1|2] = ''
  showAsigPlayerDrop.value = false
}

function hideAsigDropdown()       { setTimeout(() => { showAsigDropdown.value    = false }, 150) }
function hideAsigPlayerDrop()     { setTimeout(() => { showAsigPlayerDrop.value  = false }, 150) }

function selectAsigProducto(p: ProductoSAP) {
  asigForm.value.itemCode = p.itemCode
  asigForm.value.itemName = p.itemName
  asigProductSearch.value = `${p.itemCode} — ${p.itemName}`
  showAsigDropdown.value  = false
}

function openAsigModal(a: PlayerSap | null) {
  asigEditing.value       = a
  asigError.value         = ''
  asigProductSearch.value = ''
  playerSearch.value      = ['', '', '']
  asigForm.value = a
    ? { ...a }
    : { itemCode: '', canal: 'ambos', itemName: '', players1: null, players2: null, players3: null }
  asigModal.value = true
}

async function saveAsig() {
  asigError.value = ''
  if (!asigForm.value.itemCode) { asigError.value = 'Seleccioná un producto'; return }
  asigSaving.value = true
  try {
    await svc.upsertPlayerSap(asigForm.value)
    asigModal.value = false
    asignaciones.value = await svc.getAllPlayerSap()
  } catch (e: any) {
    const msg = e?.response?.data?.message ?? e?.message ?? 'Error al guardar'
    console.error('[saveAsig]', e)
    asigError.value = msg
  } finally {
    asigSaving.value = false
  }
}

function confirmDeleteAsig(a: PlayerSap) { deleteAsigTarget.value = a }

async function doDeleteAsig() {
  if (!deleteAsigTarget.value) return
  deletingAsig.value = true
  try {
    await svc.deletePlayerSap(deleteAsigTarget.value.itemCode, deleteAsigTarget.value.canal)
    deleteAsigTarget.value = null
    asignaciones.value = await svc.getAllPlayerSap()
  } finally {
    deletingAsig.value = false
  }
}

// ══════════════════════════ PROGRAMACIÓN ══════════════════════════════════════

const formOpen          = ref(true)
const progProductSearch = ref('')
const showProgDrop      = ref(false)
const progError         = ref('')
const progSaving        = ref(false)
const progPlayers       = ref<{ codigo: string; nombre: string }[]>([])

const progForm = ref({
  itemCode: '', itemName: '',
  fecha: today, fechaini: today, fechafin: today, cartera: 0
})

const filteredProgProductos = computed(() => {
  const q = progProductSearch.value.toLowerCase()
  if (!q) return productos.value
  return productos.value.filter(p =>
    p.itemCode.toLowerCase().includes(q) || p.itemName.toLowerCase().includes(q)
  )
})

function hideProgDrop() { setTimeout(() => { showProgDrop.value = false }, 150) }

async function selectProgProducto(p: ProductoSAP) {
  progForm.value.itemCode = p.itemCode
  progForm.value.itemName = p.itemName
  showProgDrop.value      = false
  progProductSearch.value = ''
  // Cargar competidores automáticamente
  const asig = await svc.getPlayerSap(p.itemCode)
  progPlayers.value = [
    asig?.players1 ? { codigo: asig.players1, nombre: resolvePlayerName(asig.players1) } : null,
    asig?.players2 ? { codigo: asig.players2, nombre: resolvePlayerName(asig.players2) } : null,
    asig?.players3 ? { codigo: asig.players3, nombre: resolvePlayerName(asig.players3) } : null,
  ].filter(Boolean) as { codigo: string; nombre: string }[]
}

function clearProgProducto() {
  progForm.value = { ...progForm.value, itemCode: '', itemName: '' }
  progPlayers.value = []
}

async function submitProg() {
  progError.value = ''
  if (!progForm.value.itemCode) { progError.value = 'Seleccioná un producto'; return }
  if (!progForm.value.fechaini || !progForm.value.fechafin) { progError.value = 'Las fechas inicio y fin son obligatorias'; return }
  if (progForm.value.fechafin < progForm.value.fechaini) { progError.value = 'La fecha fin no puede ser anterior al inicio'; return }
  if (progNivel.value !== 'nacional' && progAlcanceItems.value.length === 0) {
    progError.value = `Seleccioná al menos un elemento de ${nivelInfo(progNivel.value).label}`; return
  }
  progSaving.value = true
  try {
    await svc.createTarea({
      itemCode: progForm.value.itemCode,
      fecha:    progForm.value.fecha,
      fechaini: progForm.value.fechaini,
      fechafin: progForm.value.fechafin,
      cartera:  progForm.value.cartera,
      nivel:    progNivel.value,
      alcance:  alcanceToString(progAlcanceItems.value),
    })
    await loadTareas()
    clearProgProducto()
    progForm.value = { itemCode: '', itemName: '', fecha: today, fechaini: today, fechafin: today, cartera: 0 }
    progSelectNivel('nacional')
    formOpen.value = false
  } catch (e: any) {
    progError.value = e?.response?.data?.message ?? 'Error al guardar'
  } finally {
    progSaving.value = false
  }
}

// Filtros tabla
const filterText   = ref('')
const filterNivel  = ref('')
const filterEstado = ref('')

function estadoKey(t: PlayersTask): 'vigente' | 'pendiente' | 'vencido' | 'inactivo' {
  if (!t.activo) return 'inactivo'
  if (t.fechafin < today)   return 'vencido'
  if (t.fechaini > today)   return 'pendiente'
  return 'vigente'
}

const filteredTareas = computed(() =>
  tareas.value.filter(t => {
    const q = filterText.value.toLowerCase()
    if (q && !t.itemCode.toLowerCase().includes(q) && !itemName(t).toLowerCase().includes(q)) return false
    if (filterNivel.value && (t.nivel ?? 'nacional') !== filterNivel.value) return false
    if (filterEstado.value && estadoKey(t) !== filterEstado.value) return false
    return true
  })
)

function clearFilters() { filterText.value = ''; filterNivel.value = ''; filterEstado.value = '' }

// ── Paginación ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 12

const asigPage = ref(1)
const progPage = ref(1)
const catPage  = ref(1)
const catFilter = ref('')

const filteredCat = computed(() => {
  const q = catFilter.value.toLowerCase()
  if (!q) return tradeItems.value
  return tradeItems.value.filter(t =>
    t.codigo.toLowerCase().includes(q) || t.nombre.toLowerCase().includes(q) ||
    (t.rubro ?? '').toLowerCase().includes(q) || (t.mercado ?? '').toLowerCase().includes(q)
  )
})

watch(filteredAsig,  () => { asigPage.value = 1 })
watch(filteredTareas,() => { progPage.value = 1 })
watch(filteredCat,   () => { catPage.value  = 1 })

const pagedAsig   = computed(() => filteredAsig.value.slice((asigPage.value-1)*PAGE_SIZE, asigPage.value*PAGE_SIZE))
const pagedTareas = computed(() => filteredTareas.value.slice((progPage.value-1)*PAGE_SIZE, progPage.value*PAGE_SIZE))
const pagedCat    = computed(() => filteredCat.value.slice((catPage.value-1)*PAGE_SIZE, catPage.value*PAGE_SIZE))

const asigPages = computed(() => Math.max(1, Math.ceil(filteredAsig.value.length / PAGE_SIZE)))
const progPages = computed(() => Math.max(1, Math.ceil(filteredTareas.value.length / PAGE_SIZE)))
const catPages  = computed(() => Math.max(1, Math.ceil(filteredCat.value.length / PAGE_SIZE)))

const statsChips = computed(() => [
  { label: 'total',      count: tareas.value.length,                                          cls: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',            dot: 'bg-gray-400',  iconBg: 'bg-gray-100 dark:bg-gray-700',            textCls: 'text-gray-500 dark:text-gray-400' },
  { label: 'vigentes',   count: tareas.value.filter(t => estadoKey(t)==='vigente').length,    cls: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',     dot: 'bg-green-500', iconBg: 'bg-green-100 dark:bg-green-900/40',       textCls: 'text-green-600 dark:text-green-400' },
  { label: 'pendientes', count: tareas.value.filter(t => estadoKey(t)==='pendiente').length,  cls: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300', dot: 'bg-amber-400', iconBg: 'bg-amber-100 dark:bg-amber-900/40',       textCls: 'text-amber-600 dark:text-amber-400' },
  { label: 'vencidas',   count: tareas.value.filter(t => estadoKey(t)==='vencido').length,    cls: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',            dot: 'bg-red-500',   iconBg: 'bg-red-100 dark:bg-red-900/40',           textCls: 'text-red-600 dark:text-red-400' },
])

function estadoLabel(t: PlayersTask): string {
  return { vigente:'Vigente', pendiente:'Pendiente', vencido:'Vencido', inactivo:'Inactivo' }[estadoKey(t)]
}
function estadoBadgeClass(t: PlayersTask): string {
  return {
    vigente:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    pendiente: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    vencido:   'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    inactivo:  'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  }[estadoKey(t)]
}
function daysLeft(t: PlayersTask): number | null {
  if (estadoKey(t) !== 'vigente') return null
  return Math.round((new Date(t.fechafin).getTime() - new Date(today).getTime()) / 86400000)
}
function itemName(t: PlayersTask): string { return (t as any).itemName ?? '' }
function playersOf(t: PlayersTask): string[] {
  return [t.players1, t.players2, t.players3]
    .filter(Boolean)
    .map(c => resolvePlayerName(c)) as string[]
}

async function toggleActivo(t: PlayersTask) {
  const next = t.activo ? 0 : 1
  t.activo = next
  try { await svc.updateTarea(t.itemCode, t.fecha, { activo: next }) }
  catch { t.activo = next ? 0 : 1 }
}

// Edit programación
const editProgTarget = ref<PlayersTask | null>(null)
const editProgSaving = ref(false)
const editProgForm   = ref({ fechaini: '', fechafin: '', cartera: 0 })

function openEditProg(t: PlayersTask) {
  editProgTarget.value = t
  editProgForm.value   = { fechaini: t.fechaini, fechafin: t.fechafin, cartera: t.cartera }
  editSelectNivel(t.nivel ?? 'nacional')
  editAlcanceItems.value = alcanceFromString(t.alcance)
}
async function doEditProg() {
  if (!editProgTarget.value) return
  editProgSaving.value = true
  try {
    const payload = {
      ...editProgForm.value,
      nivel:   editNivel.value,
      alcance: alcanceToString(editAlcanceItems.value),
    }
    await svc.updateTarea(editProgTarget.value.itemCode, editProgTarget.value.fecha, payload)
    Object.assign(editProgTarget.value, payload)
    editProgTarget.value = null
  } finally { editProgSaving.value = false }
}

const deleteProgTarget = ref<PlayersTask | null>(null)
const deletingProg     = ref(false)

function confirmDeleteProg(t: PlayersTask) { deleteProgTarget.value = t }
async function doDeleteProg() {
  if (!deleteProgTarget.value) return
  deletingProg.value = true
  try {
    await svc.deleteTarea(deleteProgTarget.value.itemCode, deleteProgTarget.value.fecha)
    deleteProgTarget.value = null
    await loadTareas()
  } finally { deletingProg.value = false }
}

// ══════════════════════════ CATÁLOGO ══════════════════════════════════════════

const catFields: { key: string; label: string; ph: string; req?: boolean; type?: string }[] = [
  { key: 'codigo',     label: 'Código',      ph: 'Ej: ABC',       req: true },
  { key: 'nombre',     label: 'Nombre',      ph: 'Nombre',        req: true },
  { key: 'idProducto', label: 'ID Producto', ph: 'Ej: A00001' },
  { key: 'rubro',      label: 'Rubro',       ph: 'Ej: Bebidas' },
  { key: 'grupo',      label: 'Grupo',       ph: 'Ej: Cervezas' },
  { key: 'subgrupo',   label: 'Subgrupo',    ph: '' },
  { key: 'clase',      label: 'Clase',       ph: '' },
  { key: 'subclase',   label: 'Subclase',    ph: '' },
  { key: 'mercado',    label: 'Mercado',     ph: 'Ej: Nacional' },
  { key: 'estado',     label: 'Estado',      ph: 'Activo / Inactivo' },
  { key: 'pesoNeto',   label: 'Peso Neto',   ph: '0.00', type: 'number' },
]

const emptyItemForm = (): TradeItem => ({
  idProducto: null, codigo: '', nombre: '',
  rubro: null, grupo: null, subgrupo: null, clase: null, subclase: null,
  mercado: null, estado: null, pesoNeto: null,
})

const editingItem      = ref<TradeItem | null>(null)
const savingItem       = ref(false)
const itemFormError    = ref('')
const deleteItemTarget = ref<TradeItem | null>(null)
const deletingItem     = ref(false)
const itemForm = ref<TradeItem>(emptyItemForm())

function editItem(ti: TradeItem) { editingItem.value = ti; itemForm.value = { ...ti } }
function cancelEditItem() { editingItem.value = null; itemForm.value = emptyItemForm() }
function getCatField(key: string): string { return String((itemForm.value as any)[key] ?? '') }
function onCatFieldInput(key: string, e: Event) { (itemForm.value as any)[key] = (e.target as HTMLInputElement).value }

async function submitItem() {
  itemFormError.value = ''
  if (!itemForm.value.codigo.trim()) { itemFormError.value = 'El código es obligatorio'; return }
  if (!itemForm.value.nombre.trim()) { itemFormError.value = 'El nombre es obligatorio'; return }
  savingItem.value = true
  try {
    if (editingItem.value) await svc.updateTradeItem(editingItem.value.id!, itemForm.value)
    else await svc.createTradeItem(itemForm.value)
    tradeItems.value = await svc.getTradeItems()
    cancelEditItem()
  } catch (e: any) {
    itemFormError.value = e?.response?.data?.message ?? 'Error al guardar'
  } finally { savingItem.value = false }
}

function confirmDeleteItem(ti: TradeItem) { deleteItemTarget.value = ti }
async function doDeleteItem() {
  if (!deleteItemTarget.value) return
  deletingItem.value = true
  try {
    await svc.deleteTradeItem(deleteItemTarget.value.id!)
    deleteItemTarget.value = null
    tradeItems.value = await svc.getTradeItems()
  } finally { deletingItem.value = false }
}

// ══════════════════════════ IMPORTAR ASIGNACIONES (EXCEL) ════════════════════

const asigXlsxModal     = ref(false)
const asigXlsxImporting = ref(false)
const asigXlsxError     = ref('')
const asigXlsxRows      = ref<Record<string, any>[]>([])

const ASIG_COLUMN_MAP: Record<string, string> = {
  itemcode: 'itemCode', codigo: 'itemCode', codigoproducto: 'itemCode',
  canal: 'canal',
  players1: 'players1', competidor1: 'players1', player1: 'players1', p1: 'players1',
  players2: 'players2', competidor2: 'players2', player2: 'players2', p2: 'players2',
  players3: 'players3', competidor3: 'players3', player3: 'players3', p3: 'players3',
}

function mapAsigXlsxRow(row: Record<string, any>): Partial<PlayerSap> {
  const out: any = {}
  for (const [k, v] of Object.entries(row)) {
    const norm = k.toLowerCase().replace(/[^a-z0-9]/g, '')
    const field = ASIG_COLUMN_MAP[norm]
    if (field) out[field] = v != null && v !== '' ? String(v).trim() : null
  }
  if (!out.canal) out.canal = 'ambos'
  return out
}

function descargarPlantillaAsig() {
  const ws = XLSX.utils.aoa_to_sheet([
    ['itemCode',   'canal',       'players1',  'players2',  'players3'],
    ['101069',     'ambos',       '10000698',  '10000699',  ''],
    ['101070',     'moderno',     '10000698',  '',          ''],
    ['101071',     'tradicional', '10000699',  '10000698',  ''],
  ])
  ws['!cols'] = [16, 14, 12, 12, 12].map(w => ({ wch: w }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Asignaciones')
  XLSX.writeFile(wb, 'plantilla_asignaciones.xlsx')
}

function onAsigExcelFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  ;(e.target as HTMLInputElement).value = ''
  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      const wb = XLSX.read(ev.target?.result, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' })
      if (!data.length) { asigXlsxError.value = 'El archivo no contiene datos'; return }
      asigXlsxRows.value  = data
      asigXlsxError.value = ''
      asigXlsxModal.value = true
    } catch {
      asigXlsxError.value = 'No se pudo leer el archivo'
    }
  }
  reader.readAsArrayBuffer(file)
}

async function confirmAsigXlsxImport() {
  asigXlsxImporting.value = true
  asigXlsxError.value = ''
  try {
    const items = asigXlsxRows.value.map(mapAsigXlsxRow).filter(i => i.itemCode)
    const result = await svc.importPlayerSap(items)
    asigXlsxModal.value = false
    asignaciones.value = await svc.getAllPlayerSap()
    alert(`Importación completada: ${result.inserted} nuevas, ${result.updated} actualizadas`)
  } catch (e: any) {
    asigXlsxError.value = e?.response?.data?.message ?? 'Error al importar'
  } finally {
    asigXlsxImporting.value = false
  }
}

// ══════════════════════════ IMPORTAR EXCEL ════════════════════════════════════

const xlsxModal     = ref(false)
const xlsxImporting = ref(false)
const xlsxError     = ref('')
const xlsxHeaders   = ref<string[]>([])
const xlsxRows      = ref<Record<string, any>[]>([])

// Map Excel column headers (flexible, case-insensitive) to TradeItem fields
// Mapea columnas del Excel (nombres exactos de la tabla DB) → campos del TradeItem
const COLUMN_MAP: Record<string, string> = {
  idproducto:  'idProducto',
  nombre:      'nombre',
  rubro:       'rubro',
  grupo:       'grupo',
  subgrupo:    'subgrupo',
  clase:       'clase',
  subclase:    'subclase',
  codigo:      'codigo',
  mercado:     'mercado',
  estado:      'estado',
  pesoneto:    'pesoNeto',
}

function mapXlsxRow(row: Record<string, any>): Partial<TradeItem> {
  const out: any = {}
  for (const [k, v] of Object.entries(row)) {
    const norm = k.toLowerCase().replace(/[^a-z]/g, '')
    const field = COLUMN_MAP[norm]
    if (field) out[field] = (v !== '' && v != null) ? v : null
  }
  return out
}

function descargarPlantilla() {
  const ws = XLSX.utils.aoa_to_sheet([
    ['IdProducto', 'Nombre',                          'rubro', 'grupo',     'subgrupo', 'clase',  'subclase',     'codigo',   'mercado', 'Estado', 'PesoNeto'],
    [24087,        'FIDEO GUSTOSO MOD31 LINGUINE 400G','A&B',  'ALIMENTOS', 'BASICOS',  'PASTAS', 'TRANSITORIOS', '10001038', 'M',        1,        0],
    [488011,       'VINAGRE ALCOHOL CASTELO TINTO 750ML','A&B','ALIMENTOS', 'BASICOS',  'VINAGRES','TRANSITORIOS','10002396', 'M',        1,        0],
  ])
  ws['!cols'] = [12, 42, 8, 12, 12, 12, 14, 12, 8, 8, 10].map(w => ({ wch: w }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Competidores')
  XLSX.writeFile(wb, 'plantilla_competidores.xlsx')
}

function onExcelFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  ;(e.target as HTMLInputElement).value = ''
  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      const wb = XLSX.read(ev.target?.result, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' })
      if (!data.length) { xlsxError.value = 'El archivo no contiene datos'; return }
      xlsxHeaders.value = Object.keys(data[0])
      xlsxRows.value    = data
      xlsxError.value   = ''
      xlsxModal.value   = true
    } catch {
      xlsxError.value = 'No se pudo leer el archivo. Asegurate de que sea .xlsx o .csv'
    }
  }
  reader.readAsArrayBuffer(file)
}

async function confirmXlsxImport() {
  xlsxImporting.value = true
  xlsxError.value = ''
  try {
    const items = xlsxRows.value.map(mapXlsxRow).filter(i => i.codigo || i.nombre)
    const result = await svc.importTradeItems(items)
    xlsxModal.value = false
    tradeItems.value = await svc.getTradeItems()
    alert(`Importación completada: ${result.inserted} nuevos, ${result.updated} actualizados`)
  } catch (e: any) {
    xlsxError.value = e?.response?.data?.message ?? 'Error al importar'
  } finally {
    xlsxImporting.value = false
  }
}

// ── Load ──────────────────────────────────────────────────────────────────────
async function loadTareas() {
  loadingTable.value = true
  try { tareas.value = await svc.getTareas() }
  finally { loadingTable.value = false }
}

onMounted(async () => {
  loadingAsig.value = true
  const [p, ti, asig, ciud, rts] = await Promise.all([
    svc.getProductos(), svc.getTradeItems(), svc.getAllPlayerSap(),
    svc.getCiudades(), svc.getRutas(),
  ])
  productos.value    = p
  tradeItems.value   = ti
  asignaciones.value = asig
  ciudades.value     = ciud
  rutas.value        = rts
  loadingAsig.value  = false
  await loadTareas()
})
</script>
