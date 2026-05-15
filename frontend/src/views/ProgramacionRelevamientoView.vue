<template>
  <MainLayout>
    <div class="max-w-7xl mx-auto space-y-6">

      <!-- ── Header ──────────────────────────────────────────────────────────── -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Relevamiento Comercial</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestión de competidores, asignaciones y programación de campo</p>
      </div>

      <!-- ── Tabs ────────────────────────────────────────────────────────────── -->
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="flex gap-0">
          <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
            :class="activeTab === tab.id
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300'"
            class="flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all -mb-px whitespace-nowrap">
            <component :is="'svg'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon" />
            </component>
            {{ tab.label }}
            <span v-if="tab.count !== undefined"
              :class="activeTab === tab.id
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'"
              class="text-xs font-bold px-2 py-0.5 rounded-full">{{ tab.count }}</span>
          </button>
        </nav>
      </div>

      <!-- ══════════════════════ TAB: ASIGNACIÓN ════════════════════════════════ -->
      <template v-if="activeTab === 'asignacion'">

        <!-- Barra de búsqueda + botón agregar -->
        <div class="flex gap-3 items-center">
          <div class="relative flex-1">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input v-model="asigFilter" type="text" placeholder="Buscar producto por código o nombre..."
              class="w-full h-10 pl-9 pr-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
          </div>
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
          <div v-for="a in filteredAsig" :key="a.itemCode"
            class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <!-- Card header -->
            <div class="flex items-start justify-between px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-700">
              <div class="min-w-0 flex-1">
                <span class="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{{ a.itemCode }}</span>
                <p class="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5 leading-tight" :title="a.itemName">
                  {{ a.itemName || '—' }}
                </p>
              </div>
              <div class="flex gap-1 ml-2 flex-shrink-0">
                <button @click="openAsigModal(a)" title="Editar"
                  class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
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
            <!-- Competitors -->
            <div class="px-4 py-3 space-y-2">
              <template v-for="n in [1,2,3]">
                <div v-if="getAsigPlayer(a, n)" :key="`p${n}`" class="flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    :class="n===1?'bg-orange-100 text-orange-600':n===2?'bg-amber-100 text-amber-600':'bg-yellow-100 text-yellow-700'">
                    {{ n }}
                  </span>
                  <span class="text-xs font-mono text-gray-500 dark:text-gray-400 w-12 flex-shrink-0">{{ getAsigPlayer(a, n) }}</span>
                  <span class="text-xs text-gray-700 dark:text-gray-300 truncate">{{ getAsigPlayerName(a, n) }}</span>
                </div>
                <div v-else :key="`e${n}`" class="flex items-center gap-2 opacity-40">
                  <span class="w-5 h-5 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs font-bold text-gray-400">{{ n }}</span>
                  <span class="text-xs text-gray-400 italic">Sin asignar</span>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
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

                <!-- Competidores -->
                <div>
                  <label class="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">Competidores asignados</label>
                  <div class="space-y-3">
                    <div v-for="n in [1,2,3]" :key="n" class="flex items-center gap-3">
                      <span class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm"
                        :class="n===1?'bg-orange-100 text-orange-600':n===2?'bg-amber-100 text-amber-600':'bg-yellow-100 text-yellow-700'">
                        {{ n }}
                      </span>
                      <div class="relative flex-1">
                        <input :value="getAsigFormPlayer(n)" @input="onAsigPlayerInput(n, $event)"
                          @focus="asigPlayerFocus=n; showAsigPlayerDrop=true"
                          @blur="hideAsigPlayerDrop"
                          :placeholder="`Competidor ${n} (opcional)`"
                          class="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400"/>
                        <div v-if="showAsigPlayerDrop && asigPlayerFocus===n && filteredAsigPlayers.length > 0"
                          class="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl max-h-44 overflow-y-auto">
                          <button v-for="ti in filteredAsigPlayers.slice(0,25)" :key="ti.codigo"
                            @mousedown.prevent="selectAsigPlayer(n, ti)"
                            class="w-full text-left px-3 py-2 hover:bg-orange-50 dark:hover:bg-gray-700 border-b border-gray-50 dark:border-gray-700 last:border-0">
                            <span class="text-xs font-bold text-orange-600 dark:text-orange-400 mr-2">{{ ti.codigo }}</span>
                            <span class="text-sm text-gray-700 dark:text-gray-300">{{ ti.nombre }}</span>
                          </button>
                        </div>
                      </div>
                      <p class="text-xs text-orange-600 dark:text-orange-400 w-24 truncate font-medium">
                        {{ resolvePlayerName(getAsigFormPlayer(n)) }}
                      </p>
                      <button v-if="getAsigFormPlayer(n)" @click="clearAsigPlayer(n)"
                        class="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
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

      </template><!-- fin tab asignacion -->

      <!-- ══════════════════════ TAB: PROGRAMACIÓN ══════════════════════════════ -->
      <template v-if="activeTab === 'programacion'">

        <!-- Stats chips -->
        <div class="flex gap-2 flex-wrap">
          <span v-for="chip in statsChips" :key="chip.label"
            class="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
            :class="chip.cls">
            <span class="w-1.5 h-1.5 rounded-full" :class="chip.dot"></span>
            {{ chip.count }} {{ chip.label }}
          </span>
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

            <!-- Período + Cartera -->
            <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
              <div>
                <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Cartera</label>
                <input v-model.number="progForm.cartera" type="number" min="0" placeholder="0"
                  class="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>
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
          <select v-model="filterCartera"
            class="h-9 border border-gray-200 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm">
            <option value="">Todas las carteras</option>
            <option v-for="c in carteras" :key="c" :value="c">Cartera {{ c }}</option>
          </select>
          <select v-model="filterEstado"
            class="h-9 border border-gray-200 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm">
            <option value="">Todos los estados</option>
            <option value="vigente">Vigente</option>
            <option value="pendiente">Pendiente</option>
            <option value="vencido">Vencido</option>
            <option value="inactivo">Inactivo</option>
          </select>
          <button v-if="filterText||filterCartera||filterEstado" @click="clearFilters"
            class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline">Limpiar</button>
          <span class="text-xs text-gray-400 ml-auto">{{ filteredTareas.length }} resultado{{ filteredTareas.length!==1?'s':'' }}</span>
        </div>

        <!-- Tabla programaciones -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="font-bold text-gray-900 dark:text-gray-100">Programaciones</h2>
            <div v-if="loadingTable" class="flex items-center gap-2 text-xs text-gray-400">
              <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Actualizando...
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead>
                <tr class="bg-gray-50 dark:bg-gray-700/50 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  <th class="px-5 py-3 text-left">Producto</th>
                  <th class="px-5 py-3 text-left">Competidores</th>
                  <th class="px-5 py-3 text-left">Período</th>
                  <th class="px-5 py-3 text-left">Cartera</th>
                  <th class="px-5 py-3 text-left">Estado</th>
                  <th class="px-5 py-3 text-center">Activo</th>
                  <th class="px-5 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                <tr v-if="filteredTareas.length===0">
                  <td colspan="7" class="px-5 py-14 text-center">
                    <div class="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
                      <svg class="w-10 h-10 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      <p class="text-sm font-semibold">Sin programaciones</p>
                      <p class="text-xs">{{ filterText||filterCartera||filterEstado?'Ajustá los filtros':'Creá la primera programación arriba' }}</p>
                    </div>
                  </td>
                </tr>
                <tr v-for="t in filteredTareas" :key="`${t.itemCode}-${t.fecha}`"
                  class="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                  <td class="px-5 py-3.5">
                    <p class="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{{ t.itemCode }}</p>
                    <p class="text-xs text-gray-600 dark:text-gray-300 mt-0.5 max-w-[160px] truncate" :title="itemName(t)">{{ itemName(t)||'—' }}</p>
                  </td>
                  <td class="px-5 py-3.5">
                    <div class="flex flex-wrap gap-1">
                      <span v-for="(pl,i) in playersOf(t)" :key="i"
                        class="text-xs px-2 py-0.5 rounded-full font-semibold"
                        :class="i===0?'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300':i===1?'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300':'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'">
                        {{ pl }}
                      </span>
                      <span v-if="playersOf(t).length===0" class="text-xs text-gray-400 italic">—</span>
                    </div>
                  </td>
                  <td class="px-5 py-3.5 whitespace-nowrap">
                    <p class="text-xs font-medium text-gray-700 dark:text-gray-300">{{ t.fechaini }} → {{ t.fechafin }}</p>
                    <p v-if="daysLeft(t)!==null" class="text-xs mt-0.5"
                      :class="(daysLeft(t)??99)<=3?'text-red-500 font-semibold':'text-gray-400 dark:text-gray-500'">
                      {{ daysLeft(t)===0?'Vence hoy':`${daysLeft(t)}d restantes` }}
                    </p>
                  </td>
                  <td class="px-5 py-3.5">
                    <span class="text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md">{{ t.cartera||'—' }}</span>
                  </td>
                  <td class="px-5 py-3.5">
                    <span :class="estadoBadgeClass(t)" class="text-xs px-2.5 py-1 rounded-full font-bold">{{ estadoLabel(t) }}</span>
                  </td>
                  <td class="px-5 py-3.5 text-center">
                    <button @click="toggleActivo(t)" :class="t.activo?'bg-indigo-600':'bg-gray-200 dark:bg-gray-600'"
                      class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1">
                      <span :class="t.activo?'translate-x-5':'translate-x-1'"
                        class="inline-block h-3 w-3 transform rounded-full bg-white transition-transform shadow-sm"></span>
                    </button>
                  </td>
                  <td class="px-5 py-3.5">
                    <div class="flex items-center justify-center gap-1">
                      <button @click="openEditProg(t)" title="Editar período"
                        class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button @click="confirmDeleteProg(t)" title="Eliminar"
                        class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
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
              <div class="mb-5">
                <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Cartera</label>
                <input v-model.number="editProgForm.cartera" type="number" min="0"
                  class="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
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

        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-5">
            <h2 class="text-white font-bold text-lg">{{ editingItem?'Editar competidor':'Nuevo competidor'  }}</h2>
            <p class="text-orange-100 text-sm mt-0.5">Mantené actualizado el catálogo de marcas competidoras</p>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-5">
              <div v-for="f in catFields" :key="f.key">
                <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">{{ f.label }}<span v-if="f.req" class="text-red-500 ml-0.5">*</span></label>
                <input :value="getCatField(f.key)" @input="onCatFieldInput(f.key, $event)" :type="f.type||'text'" :placeholder="f.ph||''" :disabled="f.key==='codigo'&&!!editingItem"
                  class="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50"/>
              </div>
            </div>
            <p v-if="itemFormError" class="text-sm text-red-500 mb-3">{{ itemFormError }}</p>
            <div class="flex gap-2 justify-end border-t border-gray-100 dark:border-gray-700 pt-4">
              <button v-if="editingItem" @click="cancelEditItem" class="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancelar</button>
              <button @click="submitItem" :disabled="savingItem"
                class="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors">
                {{ savingItem?'Guardando...':editingItem?'Actualizar':'Agregar competidor' }}
              </button>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="font-bold text-gray-900 dark:text-gray-100">Competidores registrados</h2>
            <span class="text-xs font-bold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2.5 py-1 rounded-full">{{ tradeItems.length }}</span>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead>
                <tr class="bg-gray-50 dark:bg-gray-700/50 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  <th class="px-5 py-3 text-left">Código</th>
                  <th class="px-5 py-3 text-left">Nombre</th>
                  <th class="px-5 py-3 text-left">Rubro</th>
                  <th class="px-5 py-3 text-left">Grupo</th>
                  <th class="px-5 py-3 text-left">Subgrupo</th>
                  <th class="px-5 py-3 text-left">Clase</th>
                  <th class="px-5 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                <tr v-if="tradeItems.length===0">
                  <td colspan="7" class="px-5 py-10 text-center text-gray-400 text-sm">Sin competidores registrados</td>
                </tr>
                <tr v-for="ti in tradeItems" :key="ti.codigo" class="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                  <td class="px-5 py-3 font-mono text-xs font-bold text-orange-600 dark:text-orange-400">{{ ti.codigo }}</td>
                  <td class="px-5 py-3 font-semibold text-gray-800 dark:text-gray-200">{{ ti.nombre }}</td>
                  <td class="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs">{{ ti.rubro||'—' }}</td>
                  <td class="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs">{{ ti.grupo||'—' }}</td>
                  <td class="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs">{{ ti.subgrupo||'—' }}</td>
                  <td class="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs">{{ ti.clase||'—' }}</td>
                  <td class="px-5 py-3">
                    <div class="flex items-center justify-center gap-1">
                      <button @click="editItem(ti)" class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button @click="confirmDeleteItem(ti)" class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <Teleport to="body">
          <div v-if="deleteItemTarget" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
              <h3 class="font-bold text-gray-900 dark:text-gray-100 text-lg mb-2">Eliminar competidor</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">¿Eliminar <strong>{{ deleteItemTarget.nombre }}</strong> ({{ deleteItemTarget.codigo }})?</p>
              <div class="flex gap-3 justify-end">
                <button @click="deleteItemTarget=null" class="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancelar</button>
                <button @click="doDeleteItem" :disabled="deletingItem" class="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-lg">
                  {{ deletingItem?'Eliminando...':'Eliminar' }}
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
import { ref, computed, onMounted } from 'vue'
import MainLayout from '@/components/layouts/MainLayout.vue'
import svc, { type ProductoSAP, type TradeItem, type PlayerSap, type PlayersTask } from '@/services/categoria-relevamiento.service'

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
const loadingTable = ref(false)
const loadingAsig  = ref(false)

// ── Helpers ───────────────────────────────────────────────────────────────────
function resolvePlayerName(codigo: string | null | undefined): string {
  if (!codigo) return ''
  return tradeItems.value.find(t => t.codigo === codigo)?.nombre ?? codigo
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
const asigProductSearch = ref('')

const asigForm = ref<PlayerSap>({
  itemCode: '', itemName: '', players1: null, players2: null, players3: null
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
  const val = (getAsigFormPlayer(asigPlayerFocus.value) ?? '').toLowerCase()
  if (!val) return tradeItems.value
  return tradeItems.value.filter(t =>
    t.codigo.toLowerCase().includes(val) || t.nombre.toLowerCase().includes(val)
  )
})

function getAsigFormPlayer(n: number): string {
  return (n===1 ? asigForm.value.players1 : n===2 ? asigForm.value.players2 : asigForm.value.players3) ?? ''
}

function setAsigFormPlayer(n: number, val: string) {
  if (n===1) asigForm.value.players1 = val || null
  else if (n===2) asigForm.value.players2 = val || null
  else asigForm.value.players3 = val || null
}

function onAsigPlayerInput(n: number, e: Event) {
  setAsigFormPlayer(n, (e.target as HTMLInputElement).value)
}

function clearAsigPlayer(n: number) { setAsigFormPlayer(n, '') }

function selectAsigPlayer(n: number, ti: TradeItem) {
  setAsigFormPlayer(n, ti.codigo)
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
  asigForm.value = a
    ? { ...a }
    : { itemCode: '', itemName: '', players1: null, players2: null, players3: null }
  asigModal.value = true
}

async function saveAsig() {
  asigError.value = ''
  if (!asigForm.value.itemCode) { asigError.value = 'Seleccioná un producto'; return }
  asigSaving.value = true
  try {
    await svc.upsertPlayerSap(asigForm.value)
    asignaciones.value = await svc.getAllPlayerSap()
    asigModal.value = false
  } catch (e: any) {
    asigError.value = e?.response?.data?.message ?? 'Error al guardar'
  } finally {
    asigSaving.value = false
  }
}

function confirmDeleteAsig(a: PlayerSap) { deleteAsigTarget.value = a }

async function doDeleteAsig() {
  if (!deleteAsigTarget.value) return
  deletingAsig.value = true
  try {
    await svc.deletePlayerSap(deleteAsigTarget.value.itemCode)
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
  progSaving.value = true
  try {
    await svc.createTarea({
      itemCode: progForm.value.itemCode,
      fecha:    progForm.value.fecha,
      fechaini: progForm.value.fechaini,
      fechafin: progForm.value.fechafin,
      cartera:  progForm.value.cartera,
    })
    await loadTareas()
    clearProgProducto()
    progForm.value = { itemCode: '', itemName: '', fecha: today, fechaini: today, fechafin: today, cartera: 0 }
    formOpen.value = false
  } catch (e: any) {
    progError.value = e?.response?.data?.message ?? 'Error al guardar'
  } finally {
    progSaving.value = false
  }
}

// Filtros tabla
const filterText    = ref('')
const filterCartera = ref('')
const filterEstado  = ref('')

const carteras = computed(() => {
  const s = new Set(tareas.value.map(t => String(t.cartera)).filter(Boolean))
  return [...s].sort()
})

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
    if (filterCartera.value && String(t.cartera) !== filterCartera.value) return false
    if (filterEstado.value && estadoKey(t) !== filterEstado.value) return false
    return true
  })
)

function clearFilters() { filterText.value = ''; filterCartera.value = ''; filterEstado.value = '' }

const statsChips = computed(() => [
  { label: 'total',     count: tareas.value.length,                                    cls: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',             dot: 'bg-gray-400' },
  { label: 'vigentes',  count: tareas.value.filter(t => estadoKey(t)==='vigente').length,  cls: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',      dot: 'bg-green-500' },
  { label: 'pendientes',count: tareas.value.filter(t => estadoKey(t)==='pendiente').length,cls: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',  dot: 'bg-yellow-500' },
  { label: 'vencidas',  count: tareas.value.filter(t => estadoKey(t)==='vencido').length,  cls: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',             dot: 'bg-red-400' },
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
  return [
    t.nombrePlayer1 ?? t.players1,
    t.nombrePlayer2 ?? t.players2,
    t.nombrePlayer3 ?? t.players3,
  ].filter(Boolean) as string[]
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
  editProgForm.value = { fechaini: t.fechaini, fechafin: t.fechafin, cartera: t.cartera }
}
async function doEditProg() {
  if (!editProgTarget.value) return
  editProgSaving.value = true
  try {
    await svc.updateTarea(editProgTarget.value.itemCode, editProgTarget.value.fecha, editProgForm.value)
    Object.assign(editProgTarget.value, editProgForm.value)
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
  { key: 'codigo',   label: 'Código',    ph: 'Ej: ABC',     req: true },
  { key: 'nombre',   label: 'Nombre',    ph: 'Nombre',      req: true },
  { key: 'rubro',    label: 'Rubro',     ph: 'Ej: Bebidas' },
  { key: 'grupo',    label: 'Grupo',     ph: 'Ej: Cervezas' },
  { key: 'subgrupo', label: 'Subgrupo',  ph: '' },
  { key: 'clase',    label: 'Clase',     ph: '' },
  { key: 'subclase', label: 'Subclase',  ph: '' },
]

const editingItem      = ref<TradeItem | null>(null)
const savingItem       = ref(false)
const itemFormError    = ref('')
const deleteItemTarget = ref<TradeItem | null>(null)
const deletingItem     = ref(false)
const itemForm = ref<TradeItem>({ codigo: '', nombre: '', rubro: null, grupo: null, subgrupo: null, clase: null, subclase: null })

function editItem(ti: TradeItem) { editingItem.value = ti; itemForm.value = { ...ti } }
function cancelEditItem() { editingItem.value = null; itemForm.value = { codigo: '', nombre: '', rubro: null, grupo: null, subgrupo: null, clase: null, subclase: null } }
function getCatField(key: string): string { return (itemForm.value as any)[key] ?? '' }
function onCatFieldInput(key: string, e: Event) { (itemForm.value as any)[key] = (e.target as HTMLInputElement).value }

async function submitItem() {
  itemFormError.value = ''
  if (!itemForm.value.codigo.trim()) { itemFormError.value = 'El código es obligatorio'; return }
  if (!itemForm.value.nombre.trim()) { itemFormError.value = 'El nombre es obligatorio'; return }
  savingItem.value = true
  try {
    if (editingItem.value) await svc.updateTradeItem(itemForm.value.codigo, itemForm.value)
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
    await svc.deleteTradeItem(deleteItemTarget.value.codigo)
    deleteItemTarget.value = null
    tradeItems.value = await svc.getTradeItems()
  } finally { deletingItem.value = false }
}

// ── Load ──────────────────────────────────────────────────────────────────────
async function loadTareas() {
  loadingTable.value = true
  try { tareas.value = await svc.getTareas() }
  finally { loadingTable.value = false }
}

onMounted(async () => {
  loadingAsig.value = true
  const [p, ti, asig] = await Promise.all([
    svc.getProductos(), svc.getTradeItems(), svc.getAllPlayerSap()
  ])
  productos.value    = p
  tradeItems.value   = ti
  asignaciones.value = asig
  loadingAsig.value  = false
  await loadTareas()
})
</script>
