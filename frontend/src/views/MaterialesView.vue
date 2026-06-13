<template>
  <MainLayout>
    <div class="space-y-6">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Material POP / Suministros</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Gestión de modelos POP</p>
        </div>
        <button @click="openNew"
          class="flex items-center gap-2 bg-[#012F9D] hover:bg-blue-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo POP
        </button>
      </div>

      <!-- Tabla de registros -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ registros.length }} registros</span>
          <input v-model="busqueda" placeholder="Buscar..."
            class="h-8 border border-gray-200 dark:border-gray-600 rounded-lg px-3 text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 w-52"/>
        </div>

        <div v-if="registrosFiltrados.length === 0" class="py-16 text-center text-gray-400 dark:text-gray-500">
          <svg class="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
          </svg>
          <p class="text-sm">No hay registros POP</p>
          <button @click="openNew" class="mt-3 text-blue-600 text-sm font-medium hover:underline">Crear el primero</button>
        </div>

        <table v-else class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-700/50 text-left">
              <th class="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nro</th>
              <th class="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
              <th class="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ciudad</th>
              <th class="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Canal</th>
              <th class="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Supervisor</th>
              <th class="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Items</th>
              <th class="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr v-for="reg in registrosFiltrados" :key="reg.nro"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
              <td class="px-5 py-3.5 font-mono font-bold text-[#012F9D] dark:text-blue-400">{{ reg.nro }}</td>
              <td class="px-5 py-3.5 text-gray-700 dark:text-gray-300">{{ formatFecha(reg.fecha) }}</td>
              <td class="px-5 py-3.5 text-gray-700 dark:text-gray-300">{{ reg.ciudad }}</td>
              <td class="px-5 py-3.5 text-gray-700 dark:text-gray-300">{{ reg.canal }}</td>
              <td class="px-5 py-3.5 text-gray-700 dark:text-gray-300">{{ reg.supervisor }}</td>
              <td class="px-5 py-3.5">
                <span class="inline-flex items-center bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {{ reg.lineas.length }} ítems
                </span>
              </td>
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-2">
                  <button @click="openVer(reg)" title="Ver documento"
                    class="p-1.5 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                  <button @click="openEditar(reg)" title="Editar"
                    class="p-1.5 rounded-lg text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/20 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button @click="eliminar(reg.nro)" title="Eliminar"
                    class="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors">
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

    <!-- ── MODAL CREAR / EDITAR ────────────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="modalForm" class="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="cerrarModal"/>
        <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl my-6">

          <!-- Header modal -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-[#012F9D]/10 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-[#012F9D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <h2 class="text-base font-bold text-gray-900 dark:text-gray-100">
                {{ esEdicion ? `Editar POP #${form.nro}` : 'Nuevo Modelo POP' }}
              </h2>
            </div>
            <button @click="cerrarModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Cuerpo -->
          <div class="p-6 space-y-5">

            <!-- Fila 1: Fecha + Ciudad + Canal -->
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Fecha contabilización</label>
                <input v-model="form.fecha" type="date"
                  class="w-full h-9 border border-gray-200 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Ciudad / Centro Costo</label>
                <input v-model="form.ciudad" placeholder="Ej: La Paz"
                  class="w-full h-9 border border-gray-200 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Canal</label>
                <input v-model="form.canal" placeholder="Ej: Moderno"
                  class="w-full h-9 border border-gray-200 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
              </div>
            </div>

            <!-- Fila 2: NIT + Supervisor + U_Razsocial -->
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">NIT</label>
                <input v-model="form.nit" placeholder="NIT del cliente"
                  class="w-full h-9 border border-gray-200 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Supervisor</label>
                <input v-model="form.supervisor" placeholder="Nombre supervisor"
                  class="w-full h-9 border border-gray-200 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Razón Social</label>
                <input v-model="form.razsocial" placeholder="Razón social"
                  class="w-full h-9 border border-gray-200 dark:border-gray-600 rounded-lg px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
              </div>
            </div>

            <!-- Líneas de ítems -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-xs font-semibold text-gray-500 dark:text-gray-400">Ítems</label>
                <button @click="agregarLinea" type="button"
                  class="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 transition-colors">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
                  </svg>
                  Agregar ítem
                </button>
              </div>

              <div class="border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
                <table class="w-full text-xs">
                  <thead>
                    <tr class="bg-gray-50 dark:bg-gray-700/50">
                      <th class="px-3 py-2 text-left font-semibold text-gray-500 dark:text-gray-400">Item</th>
                      <th class="px-3 py-2 text-left font-semibold text-gray-500 dark:text-gray-400">Descripción</th>
                      <th class="px-3 py-2 text-left font-semibold text-gray-500 dark:text-gray-400">Cuenta</th>
                      <th class="px-3 py-2 text-left font-semibold text-gray-500 dark:text-gray-400">Nombre Cuenta</th>
                      <th class="px-3 py-2 text-left font-semibold text-gray-500 dark:text-gray-400 w-20">Cantidad</th>
                      <th class="px-3 py-2 text-left font-semibold text-gray-500 dark:text-gray-400">Reponedor</th>
                      <th class="px-3 py-2 w-8"/>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                    <tr v-for="(linea, i) in form.lineas" :key="i">
                      <td class="px-2 py-1.5">
                        <input v-model="linea.item" placeholder="Código"
                          class="w-20 h-7 border border-gray-200 dark:border-gray-600 rounded px-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400 font-mono text-xs"/>
                      </td>
                      <td class="px-2 py-1.5">
                        <input v-model="linea.descripcion" placeholder="Descripción"
                          class="w-full h-7 border border-gray-200 dark:border-gray-600 rounded px-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400 text-xs"/>
                      </td>
                      <td class="px-2 py-1.5">
                        <input v-model="linea.cuenta" placeholder="Cuenta"
                          class="w-24 h-7 border border-gray-200 dark:border-gray-600 rounded px-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400 font-mono text-xs"/>
                      </td>
                      <td class="px-2 py-1.5">
                        <input v-model="linea.nombreCuenta" placeholder="Nombre cuenta"
                          class="w-full h-7 border border-gray-200 dark:border-gray-600 rounded px-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400 text-xs"/>
                      </td>
                      <td class="px-2 py-1.5">
                        <input v-model.number="linea.cantidad" type="number" min="0" placeholder="0"
                          class="w-16 h-7 border border-gray-200 dark:border-gray-600 rounded px-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400 text-xs text-center"/>
                      </td>
                      <td class="px-2 py-1.5">
                        <input v-model="linea.reponedor" placeholder="Reponedor"
                          class="w-full h-7 border border-gray-200 dark:border-gray-600 rounded px-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400 text-xs"/>
                      </td>
                      <td class="px-2 py-1.5 text-center">
                        <button @click="quitarLinea(i)" type="button"
                          class="text-red-400 hover:text-red-600 transition-colors">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                    <tr v-if="form.lineas.length === 0">
                      <td colspan="7" class="px-4 py-4 text-center text-gray-400 italic text-xs">
                        Sin ítems — hacé clic en "Agregar ítem"
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Footer modal -->
          <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
            <button @click="cerrarModal"
              class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
              Cancelar
            </button>
            <button @click="guardar"
              class="flex items-center gap-2 bg-[#012F9D] hover:bg-blue-800 text-white text-sm font-bold px-5 py-2 rounded-xl transition-colors shadow-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              {{ esEdicion ? 'Guardar cambios' : 'Crear POP' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── MODAL VER / IMPRIMIR ──────────────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="modalVer && verReg" class="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="modalVer = false"/>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-6 overflow-hidden">

          <!-- Toolbar de impresión -->
          <div class="flex items-center justify-between px-6 py-3 bg-gray-50 border-b border-gray-200 print:hidden">
            <span class="text-sm font-semibold text-gray-700">Vista previa del documento</span>
            <div class="flex items-center gap-2">
              <button @click="imprimir"
                class="flex items-center gap-1.5 bg-[#012F9D] text-white text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-blue-800 transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                </svg>
                Imprimir
              </button>
              <button @click="modalVer = false" class="text-gray-400 hover:text-gray-600 p-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Documento POP -->
          <div id="pop-documento" class="p-8 font-sans text-xs text-gray-900">

            <!-- Encabezado del documento -->
            <div class="border border-gray-400 mb-0">
              <!-- Título -->
              <div class="flex items-center border-b border-gray-400">
                <div class="w-1/2 px-3 py-1.5 border-r border-gray-400">
                  <span class="font-bold text-sm">MODELO POP</span>
                </div>
                <div class="flex-1 px-3 py-1.5 border-r border-gray-400">
                  <span class="font-semibold text-red-600">Material POP / Suministros</span>
                </div>
                <div class="px-3 py-1.5 flex items-center gap-2">
                  <span class="text-gray-500">Nro</span>
                  <span class="font-bold text-gray-900">{{ verReg.nro }}</span>
                </div>
              </div>

              <!-- Fecha + Canal/NIT -->
              <div class="flex border-b border-gray-400">
                <div class="w-24 px-3 py-1.5 border-r border-gray-400 text-gray-500">Fecha</div>
                <div class="flex-1 px-3 py-1.5 border-r border-gray-400 font-medium">{{ formatFecha(verReg.fecha) }}</div>
                <div class="w-24 px-3 py-1.5 border-r border-gray-400 text-gray-500">Canal</div>
                <div class="w-28 px-3 py-1.5 border-r border-gray-400 font-medium">{{ verReg.canal }}</div>
                <div class="w-16 px-3 py-1.5 border-r border-gray-400 text-gray-500">NIT</div>
                <div class="flex-1 px-3 py-1.5 font-medium">{{ verReg.nit }}</div>
              </div>

              <!-- Ciudad + Supervisor/Razsocial -->
              <div class="flex">
                <div class="w-24 px-3 py-1.5 border-r border-gray-400 text-gray-500">Ciudad</div>
                <div class="flex-1 px-3 py-1.5 border-r border-gray-400 font-medium">{{ verReg.ciudad }}</div>
                <div class="w-24 px-3 py-1.5 border-r border-gray-400 text-gray-500">Supervisor</div>
                <div class="w-28 px-3 py-1.5 border-r border-gray-400 font-medium">{{ verReg.supervisor }}</div>
                <div class="w-16 px-3 py-1.5 border-r border-gray-400 text-gray-500">Razón</div>
                <div class="flex-1 px-3 py-1.5 font-medium">{{ verReg.razsocial }}</div>
              </div>
            </div>

            <!-- Tabla de ítems -->
            <table class="w-full border-collapse border border-gray-400 border-t-0">
              <thead>
                <tr class="bg-gray-100">
                  <th class="border border-gray-400 px-2 py-1.5 text-left font-bold">Item</th>
                  <th class="border border-gray-400 px-2 py-1.5 text-left font-bold">Descripcion</th>
                  <th class="border border-gray-400 px-2 py-1.5 text-left font-bold">Cuenta</th>
                  <th class="border border-gray-400 px-2 py-1.5 text-left font-bold">Nombre Cuenta</th>
                  <th class="border border-gray-400 px-2 py-1.5 text-center font-bold w-20">Cantidad</th>
                  <th class="border border-gray-400 px-2 py-1.5 text-left font-bold">Reponedor</th>
                  <th class="border border-gray-400 px-2 py-1.5 text-left font-bold w-20">Firma</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(linea, i) in verReg.lineas" :key="i">
                  <td class="border border-gray-300 px-2 py-1.5 font-mono">{{ linea.item }}</td>
                  <td class="border border-gray-300 px-2 py-1.5">{{ linea.descripcion }}</td>
                  <td class="border border-gray-300 px-2 py-1.5 font-mono">{{ linea.cuenta }}</td>
                  <td class="border border-gray-300 px-2 py-1.5">{{ linea.nombreCuenta }}</td>
                  <td class="border border-gray-300 px-2 py-1.5 text-center font-semibold">{{ linea.cantidad }}</td>
                  <td class="border border-gray-300 px-2 py-1.5">{{ linea.reponedor }}</td>
                  <td class="border border-gray-300 px-2 py-1.5"/>
                </tr>
                <!-- Filas vacías para rellenar -->
                <tr v-for="n in Math.max(0, 12 - verReg.lineas.length)" :key="`empty-${n}`" class="h-6">
                  <td class="border border-gray-300 px-2 py-1.5"/>
                  <td class="border border-gray-300 px-2 py-1.5"/>
                  <td class="border border-gray-300 px-2 py-1.5"/>
                  <td class="border border-gray-300 px-2 py-1.5"/>
                  <td class="border border-gray-300 px-2 py-1.5"/>
                  <td class="border border-gray-300 px-2 py-1.5"/>
                  <td class="border border-gray-300 px-2 py-1.5"/>
                </tr>
              </tbody>
            </table>

            <!-- Firmas -->
            <div class="flex border border-gray-400 border-t-0">
              <div class="flex-1 px-4 py-6 border-r border-gray-400 text-center">
                <div class="h-10 border-b border-gray-400 mb-2"/>
                <p class="font-bold text-xs tracking-wide">FIRMA DEL REPONEDOR</p>
              </div>
              <div class="flex-1 px-4 py-6 text-center">
                <div class="h-10 border-b border-gray-400 mb-2"/>
                <p class="font-bold text-xs tracking-wide">FIRMA DEL SUPERVISOR DE TRADE</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Teleport>

  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import MainLayout from '@/components/layouts/MainLayout.vue'

interface LineaPOP {
  item: string
  descripcion: string
  cuenta: string
  nombreCuenta: string
  cantidad: number
  reponedor: string
}

interface RegistroPOP {
  nro: number
  fecha: string
  ciudad: string
  canal: string
  nit: string
  supervisor: string
  razsocial: string
  lineas: LineaPOP[]
}

const registros = ref<RegistroPOP[]>([
  {
    nro: 1,
    fecha: '2026-06-01',
    ciudad: 'La Paz',
    canal: 'Moderno',
    nit: '1001234567',
    supervisor: 'Juan Pérez',
    razsocial: 'Supermercados Ketal S.A.',
    lineas: [
      { item: '1012012', descripcion: 'Collarin Carbonel',   cuenta: '650101001', nombreCuenta: 'Deoleo S.A.',                                  cantidad: 10, reponedor: 'Reponedores de La Paz' },
      { item: '1022012', descripcion: 'Collarin Atun',       cuenta: '650101002', nombreCuenta: 'Negocios Industriales Real S.A. NIRSA',         cantidad: 5,  reponedor: '' },
      { item: '1022013', descripcion: 'Marcaprecio Atun',    cuenta: '650101003', nombreCuenta: 'Negocios Industriales Real S.A. NIRSA',         cantidad: 4,  reponedor: '' },
      { item: '1032013', descripcion: 'Collarin Matarazo',   cuenta: '650101003', nombreCuenta: 'Molinos Río de la Plata S.A.',                  cantidad: 25, reponedor: '' },
    ],
  },
])

let nextNro = ref(2)

const busqueda = ref('')
const registrosFiltrados = computed(() => {
  const q = busqueda.value.toLowerCase()
  if (!q) return registros.value
  return registros.value.filter(r =>
    String(r.nro).includes(q) ||
    r.ciudad.toLowerCase().includes(q) ||
    r.canal.toLowerCase().includes(q) ||
    r.supervisor.toLowerCase().includes(q)
  )
})

// ── Modal crear/editar ──────────────────────────────────────────────────────
const modalForm = ref(false)
const esEdicion = ref(false)

const emptyForm = (): RegistroPOP => ({
  nro: nextNro.value,
  fecha: new Date().toISOString().slice(0, 10),
  ciudad: '',
  canal: '',
  nit: '',
  supervisor: '',
  razsocial: '',
  lineas: [],
})

const form = ref<RegistroPOP>(emptyForm())

function openNew() {
  esEdicion.value = false
  form.value = emptyForm()
  modalForm.value = true
}

function openEditar(reg: RegistroPOP) {
  esEdicion.value = true
  form.value = JSON.parse(JSON.stringify(reg))
  modalForm.value = true
}

function cerrarModal() {
  modalForm.value = false
}

function agregarLinea() {
  form.value.lineas.push({ item: '', descripcion: '', cuenta: '', nombreCuenta: '', cantidad: 0, reponedor: '' })
}

function quitarLinea(i: number) {
  form.value.lineas.splice(i, 1)
}

function guardar() {
  if (!form.value.fecha || !form.value.ciudad) return
  if (esEdicion.value) {
    const idx = registros.value.findIndex(r => r.nro === form.value.nro)
    if (idx !== -1) registros.value[idx] = JSON.parse(JSON.stringify(form.value))
  } else {
    form.value.nro = nextNro.value++
    registros.value.unshift(JSON.parse(JSON.stringify(form.value)))
  }
  cerrarModal()
}

function eliminar(nro: number) {
  if (!confirm(`¿Eliminar el POP #${nro}?`)) return
  registros.value = registros.value.filter(r => r.nro !== nro)
}

// ── Modal ver/imprimir ──────────────────────────────────────────────────────
const modalVer = ref(false)
const verReg = ref<RegistroPOP | null>(null)

function openVer(reg: RegistroPOP) {
  verReg.value = reg
  modalVer.value = true
}

function imprimir() {
  window.print()
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function formatFecha(fecha: string) {
  if (!fecha) return ''
  const [y, m, d] = fecha.split('-')
  return `${d}/${m}/${y}`
}
</script>

<style>
@media print {
  body > *:not(#pop-documento) { display: none !important; }
  #pop-documento { display: block !important; padding: 0 !important; margin: 0 !important; }
}
</style>
