<template>
  <MainLayout>
    <div class="max-w-7xl mx-auto space-y-6">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Programación de Relevamiento</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Brand Manager · Asignación de players y calendario</p>
        </div>
        <span class="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full">
          {{ tareas.length }} tareas registradas
        </span>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg w-fit">
        <button
          v-for="tab in tabs" :key="tab.id"
          @click="activeTab = tab.id"
          :class="activeTab === tab.id
            ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm font-semibold'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'"
          class="px-4 py-2 text-sm rounded-md transition-all"
        >{{ tab.label }}</button>
      </div>

      <!-- Tab: Programación -->
      <template v-if="activeTab === 'programacion'">

      <!-- Form -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h2 class="text-white font-semibold text-lg">Nueva Programación</h2>
          <p class="text-blue-100 text-sm mt-0.5">Selecciona el producto SAP, configura los players y el período</p>
        </div>

        <div class="p-6 space-y-6">

          <!-- Producto SAP -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Producto SAP</label>
            <div class="relative">
              <input
                v-model="productoSearch"
                @focus="showProductoDropdown = true"
                @blur="() => setTimeout(() => showProductoDropdown = false, 150)"
                type="text"
                placeholder="Buscar por código o nombre..."
                class="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg px-3 pr-10 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <div v-if="showProductoDropdown && filteredProductos.length > 0"
                class="absolute z-30 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                <button
                  v-for="p in filteredProductos.slice(0, 50)"
                  :key="p.itemCode"
                  @mousedown.prevent="selectProducto(p)"
                  class="w-full text-left px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span class="text-xs font-bold text-blue-600 dark:text-blue-400 mr-2">{{ p.itemCode }}</span>
                  <span class="text-sm text-gray-800 dark:text-gray-200">{{ p.itemName }}</span>
                </button>
              </div>
            </div>
            <div v-if="form.itemCode" class="mt-2 flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <svg class="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="text-sm font-bold text-blue-700 dark:text-blue-300">{{ form.itemCode }}</span>
              <span class="text-sm text-blue-600 dark:text-blue-400 truncate">{{ form.itemName }}</span>
              <button @click="clearProducto" class="ml-auto text-blue-400 hover:text-blue-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Players -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Players (competidores asociados)
              </label>
              <button
                v-if="form.itemCode"
                @click="savePlayers"
                :disabled="savingPlayers"
                class="text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50">
                {{ savingPlayers ? 'Guardando...' : 'Guardar players' }}
              </button>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <!-- Player 1 -->
              <div>
                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Player 1</label>
                <div class="relative">
                  <input v-model="form.players1"
                    @focus="activePlayerField = 1; showPlayerDropdown = true"
                    @blur="() => setTimeout(() => showPlayerDropdown = false, 150)"
                    type="text" placeholder="Buscar competidor..." :disabled="!form.itemCode"
                    class="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed" />
                  <div v-if="showPlayerDropdown && activePlayerField === 1 && filteredTradeItems.length > 0"
                    class="absolute z-30 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    <button v-for="ti in filteredTradeItems.slice(0, 30)" :key="ti.codigo"
                      @mousedown.prevent="selectPlayer(1, ti)"
                      class="w-full text-left px-3 py-2 hover:bg-orange-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <span class="text-xs font-bold text-orange-600 dark:text-orange-400 mr-1.5">{{ ti.codigo }}</span>
                      <span class="text-xs text-gray-700 dark:text-gray-300">{{ ti.nombre }}</span>
                    </button>
                  </div>
                </div>
              </div>
              <!-- Player 2 -->
              <div>
                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Player 2</label>
                <div class="relative">
                  <input v-model="form.players2"
                    @focus="activePlayerField = 2; showPlayerDropdown = true"
                    @blur="() => setTimeout(() => showPlayerDropdown = false, 150)"
                    type="text" placeholder="Buscar competidor..." :disabled="!form.itemCode"
                    class="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed" />
                  <div v-if="showPlayerDropdown && activePlayerField === 2 && filteredTradeItems.length > 0"
                    class="absolute z-30 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    <button v-for="ti in filteredTradeItems.slice(0, 30)" :key="ti.codigo"
                      @mousedown.prevent="selectPlayer(2, ti)"
                      class="w-full text-left px-3 py-2 hover:bg-orange-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <span class="text-xs font-bold text-orange-600 dark:text-orange-400 mr-1.5">{{ ti.codigo }}</span>
                      <span class="text-xs text-gray-700 dark:text-gray-300">{{ ti.nombre }}</span>
                    </button>
                  </div>
                </div>
              </div>
              <!-- Player 3 -->
              <div>
                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Player 3</label>
                <div class="relative">
                  <input v-model="form.players3"
                    @focus="activePlayerField = 3; showPlayerDropdown = true"
                    @blur="() => setTimeout(() => showPlayerDropdown = false, 150)"
                    type="text" placeholder="Buscar competidor..." :disabled="!form.itemCode"
                    class="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed" />
                  <div v-if="showPlayerDropdown && activePlayerField === 3 && filteredTradeItems.length > 0"
                    class="absolute z-30 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    <button v-for="ti in filteredTradeItems.slice(0, 30)" :key="ti.codigo"
                      @mousedown.prevent="selectPlayer(3, ti)"
                      class="w-full text-left px-3 py-2 hover:bg-orange-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <span class="text-xs font-bold text-orange-600 dark:text-orange-400 mr-1.5">{{ ti.codigo }}</span>
                      <span class="text-xs text-gray-700 dark:text-gray-300">{{ ti.nombre }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Fechas + Cartera -->
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Fecha</label>
              <input v-model="form.fecha" type="date"
                class="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Fecha inicio</label>
              <input v-model="form.fechaini" type="date"
                class="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Fecha fin</label>
              <input v-model="form.fechafin" type="date"
                class="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Cartera</label>
              <input v-model.number="form.cartera" type="number" min="0" placeholder="0"
                class="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <p v-if="formError" class="text-sm text-red-500">{{ formError }}</p>

          <div class="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-700">
            <button
              @click="submitTarea"
              :disabled="saving"
              class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors">
              <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {{ saving ? 'Guardando...' : 'Guardar programación' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Tabla -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="font-semibold text-gray-900 dark:text-gray-100">Programaciones registradas</h2>
          <span v-if="loadingTable" class="text-xs text-gray-400">Cargando...</span>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="bg-gray-50 dark:bg-gray-700/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                <th class="px-4 py-3 text-left">ItemCode</th>
                <th class="px-4 py-3 text-left">Producto</th>
                <th class="px-4 py-3 text-left">Players</th>
                <th class="px-4 py-3 text-left">Fecha</th>
                <th class="px-4 py-3 text-left">Inicio</th>
                <th class="px-4 py-3 text-left">Fin</th>
                <th class="px-4 py-3 text-left">Cartera</th>
                <th class="px-4 py-3 text-left">Usuario</th>
                <th class="px-4 py-3 text-left">Estado</th>
                <th class="px-4 py-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr v-if="tareas.length === 0">
                <td colspan="10" class="px-4 py-10 text-center text-gray-400 dark:text-gray-500">
                  No hay programaciones registradas
                </td>
              </tr>
              <tr v-for="t in tareas" :key="`${t.itemCode}-${t.fecha}`"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                <td class="px-4 py-3 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{{ t.itemCode }}</td>
                <td class="px-4 py-3 text-gray-900 dark:text-gray-100 max-w-[160px] truncate" :title="itemName(t)">{{ itemName(t) || '—' }}</td>
                <td class="px-4 py-3">
                  <div class="flex flex-wrap gap-1">
                    <span v-for="(pl, i) in playersOf(t)" :key="i"
                      class="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs px-2 py-0.5 rounded-full font-medium">
                      {{ pl }}
                    </span>
                    <span v-if="playersOf(t).length === 0" class="text-gray-400 text-xs">—</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{{ t.fecha || '—' }}</td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{{ t.fechaini }}</td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{{ t.fechafin }}</td>
                <td class="px-4 py-3 text-gray-700 dark:text-gray-300">{{ t.cartera }}</td>
                <td class="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{{ t.usuario || '—' }}</td>
                <td class="px-4 py-3">
                  <span :class="t.activo ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'"
                    class="text-xs px-2 py-0.5 rounded-full font-medium">
                    {{ t.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <button @click="confirmDelete(t)" class="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors" title="Eliminar">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal confirmar borrado tarea -->
      <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 mx-4 max-w-sm w-full">
          <h3 class="font-bold text-gray-900 dark:text-gray-100 text-lg mb-2">Eliminar programación</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
            ¿Eliminar la tarea de <strong>{{ deleteTarget.itemCode }}</strong> con fecha <strong>{{ deleteTarget.fecha }}</strong>?
          </p>
          <div class="flex gap-3 justify-end">
            <button @click="deleteTarget = null" class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Cancelar</button>
            <button @click="doDelete" :disabled="deleting" class="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg font-semibold">
              {{ deleting ? 'Eliminando...' : 'Eliminar' }}
            </button>
          </div>
        </div>
      </div>

      </template><!-- fin tab programacion -->

      <!-- Tab: Catálogo de Competidores -->
      <template v-if="activeTab === 'catalogo'">

        <!-- Formulario nuevo competidor -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
            <h2 class="text-white font-semibold text-lg">{{ editingItem ? 'Editar competidor' : 'Nuevo competidor' }}</h2>
            <p class="text-orange-100 text-sm mt-0.5">Gestión del catálogo de players (competidores)</p>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-4">
              <div>
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Código *</label>
                <input v-model="itemForm.codigo" type="text" placeholder="Ej: ABC" :disabled="!!editingItem"
                  class="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Nombre *</label>
                <input v-model="itemForm.nombre" type="text" placeholder="Nombre del competidor"
                  class="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Rubro</label>
                <input v-model="itemForm.rubro" type="text" placeholder="Ej: Bebidas"
                  class="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Grupo</label>
                <input v-model="itemForm.grupo" type="text" placeholder="Ej: Cervezas"
                  class="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Subgrupo</label>
                <input v-model="itemForm.subgrupo" type="text"
                  class="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Clase</label>
                <input v-model="itemForm.clase" type="text"
                  class="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Subclase</label>
                <input v-model="itemForm.subclase" type="text"
                  class="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
            </div>
            <p v-if="itemFormError" class="text-sm text-red-500 mb-3">{{ itemFormError }}</p>
            <div class="flex gap-2 justify-end border-t border-gray-100 dark:border-gray-700 pt-4">
              <button v-if="editingItem" @click="cancelEditItem" class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                Cancelar
              </button>
              <button @click="submitItem" :disabled="savingItem"
                class="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
                {{ savingItem ? 'Guardando...' : editingItem ? 'Actualizar' : 'Agregar competidor' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Tabla catálogo -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="font-semibold text-gray-900 dark:text-gray-100">Competidores registrados</h2>
            <span class="text-xs text-gray-400">{{ tradeItems.length }} registros</span>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead>
                <tr class="bg-gray-50 dark:bg-gray-700/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  <th class="px-4 py-3 text-left">Código</th>
                  <th class="px-4 py-3 text-left">Nombre</th>
                  <th class="px-4 py-3 text-left">Rubro</th>
                  <th class="px-4 py-3 text-left">Grupo</th>
                  <th class="px-4 py-3 text-left">Subgrupo</th>
                  <th class="px-4 py-3 text-left">Clase</th>
                  <th class="px-4 py-3 text-left">Subclase</th>
                  <th class="px-4 py-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                <tr v-if="tradeItems.length === 0">
                  <td colspan="8" class="px-4 py-10 text-center text-gray-400">No hay competidores registrados</td>
                </tr>
                <tr v-for="ti in tradeItems" :key="ti.codigo" class="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                  <td class="px-4 py-3 font-mono text-xs font-bold text-orange-600 dark:text-orange-400">{{ ti.codigo }}</td>
                  <td class="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{{ ti.nombre }}</td>
                  <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ ti.rubro || '—' }}</td>
                  <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ ti.grupo || '—' }}</td>
                  <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ ti.subgrupo || '—' }}</td>
                  <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ ti.clase || '—' }}</td>
                  <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ ti.subclase || '—' }}</td>
                  <td class="px-4 py-3 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <button @click="editItem(ti)" class="text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors" title="Editar">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button @click="confirmDeleteItem(ti)" class="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors" title="Eliminar">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Modal borrar item -->
        <div v-if="deleteItemTarget" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 mx-4 max-w-sm w-full">
            <h3 class="font-bold text-gray-900 dark:text-gray-100 text-lg mb-2">Eliminar competidor</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
              ¿Eliminar <strong>{{ deleteItemTarget.nombre }}</strong> ({{ deleteItemTarget.codigo }})?
            </p>
            <div class="flex gap-3 justify-end">
              <button @click="deleteItemTarget = null" class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Cancelar</button>
              <button @click="doDeleteItem" :disabled="deletingItem" class="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg font-semibold">
                {{ deletingItem ? 'Eliminando...' : 'Eliminar' }}
              </button>
            </div>
          </div>
        </div>

      </template><!-- fin tab catalogo -->

    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import MainLayout from '@/components/layouts/MainLayout.vue'
import svc, { type ProductoSAP, type TradeItem, type PlayersTask } from '@/services/categoria-relevamiento.service'

const today = new Date().toISOString().split('T')[0]

const tabs = [
  { id: 'programacion', label: 'Programación' },
  { id: 'catalogo',     label: 'Catálogo de Competidores' },
]
const activeTab = ref('programacion')

const productos    = ref<ProductoSAP[]>([])
const tradeItems   = ref<TradeItem[]>([])
const tareas       = ref<PlayersTask[]>([])
const loadingTable = ref(false)
const saving       = ref(false)
const savingPlayers = ref(false)

const showProductoDropdown = ref(false)
const showPlayerDropdown   = ref(false)
const activePlayerField    = ref(0)
const productoSearch       = ref('')
const formError            = ref('')
const deleteTarget         = ref<PlayersTask | null>(null)
const deleting             = ref(false)

// Catálogo de competidores
const editingItem      = ref<TradeItem | null>(null)
const savingItem       = ref(false)
const itemFormError    = ref('')
const deleteItemTarget = ref<TradeItem | null>(null)
const deletingItem     = ref(false)
const itemForm = ref<TradeItem>({ codigo: '', nombre: '', rubro: null, grupo: null, subgrupo: null, clase: null, subclase: null })

function editItem(ti: TradeItem) {
  editingItem.value = ti
  itemForm.value = { ...ti }
}

function cancelEditItem() {
  editingItem.value = null
  itemForm.value = { codigo: '', nombre: '', rubro: null, grupo: null, subgrupo: null, clase: null, subclase: null }
}

async function submitItem() {
  itemFormError.value = ''
  if (!itemForm.value.codigo.trim()) { itemFormError.value = 'El código es obligatorio'; return }
  if (!itemForm.value.nombre.trim()) { itemFormError.value = 'El nombre es obligatorio'; return }
  savingItem.value = true
  try {
    if (editingItem.value) {
      await svc.updateTradeItem(itemForm.value.codigo, itemForm.value)
    } else {
      await svc.createTradeItem(itemForm.value)
    }
    tradeItems.value = await svc.getTradeItems()
    cancelEditItem()
  } catch (e: any) {
    itemFormError.value = e?.response?.data?.message ?? 'Error al guardar'
  } finally {
    savingItem.value = false
  }
}

function confirmDeleteItem(ti: TradeItem) { deleteItemTarget.value = ti }

async function doDeleteItem() {
  if (!deleteItemTarget.value) return
  deletingItem.value = true
  try {
    await svc.deleteTradeItem(deleteItemTarget.value.codigo)
    deleteItemTarget.value = null
    tradeItems.value = await svc.getTradeItems()
  } finally {
    deletingItem.value = false
  }
}

const form = ref({
  itemCode: '',
  itemName: '',
  fecha:    today,
  fechaini: today,
  fechafin: today,
  cartera:  0,
  players1: '' as string | null,
  players2: '' as string | null,
  players3: '' as string | null,
})

const filteredProductos = computed(() => {
  const term = productoSearch.value.toLowerCase().trim()
  if (!term) return productos.value
  return productos.value.filter(p =>
    p.itemCode.toLowerCase().includes(term) || p.itemName.toLowerCase().includes(term)
  )
})

function getPlayerVal(n: number): string {
  if (n === 1) return form.value.players1 ?? ''
  if (n === 2) return form.value.players2 ?? ''
  return form.value.players3 ?? ''
}

const filteredTradeItems = computed(() => {
  const val = getPlayerVal(activePlayerField.value).toLowerCase().trim()
  if (!val) return tradeItems.value
  return tradeItems.value.filter(t =>
    t.codigo.toLowerCase().includes(val) || t.nombre.toLowerCase().includes(val)
  )
})

async function selectProducto(p: ProductoSAP) {
  form.value.itemCode = p.itemCode
  form.value.itemName = p.itemName
  productoSearch.value = `${p.itemCode} — ${p.itemName}`
  showProductoDropdown.value = false

  const existing = await svc.getPlayerSap(p.itemCode)
  form.value.players1 = existing?.players1 ?? ''
  form.value.players2 = existing?.players2 ?? ''
  form.value.players3 = existing?.players3 ?? ''
}

function clearProducto() {
  form.value.itemCode = ''
  form.value.itemName = ''
  form.value.players1 = ''
  form.value.players2 = ''
  form.value.players3 = ''
  productoSearch.value = ''
}

function selectPlayer(n: number, ti: TradeItem) {
  if (n === 1) form.value.players1 = ti.codigo
  else if (n === 2) form.value.players2 = ti.codigo
  else form.value.players3 = ti.codigo
  showPlayerDropdown.value = false
}

async function savePlayers() {
  if (!form.value.itemCode) return
  savingPlayers.value = true
  try {
    await svc.upsertPlayerSap({
      itemCode: form.value.itemCode,
      players1: form.value.players1 || null,
      players2: form.value.players2 || null,
      players3: form.value.players3 || null,
    })
  } finally {
    savingPlayers.value = false
  }
}

async function submitTarea() {
  formError.value = ''
  if (!form.value.itemCode) { formError.value = 'Selecciona un producto'; return }
  if (!form.value.fechaini || !form.value.fechafin) { formError.value = 'Las fechas inicio y fin son obligatorias'; return }

  saving.value = true
  try {
    await svc.createTarea({
      itemCode: form.value.itemCode,
      fecha:    form.value.fecha,
      fechaini: form.value.fechaini,
      fechafin: form.value.fechafin,
      cartera:  form.value.cartera,
    })
    await loadTareas()
    clearProducto()
    form.value.cartera = 0
    form.value.fecha    = today
    form.value.fechaini = today
    form.value.fechafin = today
  } catch (e: any) {
    formError.value = e?.response?.data?.message ?? 'Error al guardar'
  } finally {
    saving.value = false
  }
}

function itemName(t: PlayersTask): string {
  return (t as any).itemName ?? ''
}

function playersOf(t: PlayersTask): string[] {
  return [
    t.nombrePlayer1 ?? t.players1,
    t.nombrePlayer2 ?? t.players2,
    t.nombrePlayer3 ?? t.players3,
  ].filter(Boolean) as string[]
}

function confirmDelete(t: PlayersTask) { deleteTarget.value = t }

async function doDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await svc.deleteTarea(deleteTarget.value.itemCode, deleteTarget.value.fecha)
    deleteTarget.value = null
    await loadTareas()
  } finally {
    deleting.value = false
  }
}

async function loadTareas() {
  loadingTable.value = true
  try { tareas.value = await svc.getTareas() }
  finally { loadingTable.value = false }
}

onMounted(async () => {
  productos.value  = await svc.getProductos()
  tradeItems.value = await svc.getTradeItems()
  await loadTareas()
})
</script>
