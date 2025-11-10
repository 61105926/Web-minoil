<template>
  <MainLayout>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <!-- Fase: Seleccionar Sala -->
      <div v-if="fase === 'seleccionar-sala'" class="min-h-screen flex items-center justify-center p-4">
        <div v-if="loadingSalas" class="text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p class="text-gray-600 dark:text-gray-400 text-lg">Cargando salas...</p>
        </div>
        <RoomSelectorModal 
          v-else
          :open="true" 
          :rooms="salasDisponibles" 
          @select="handleSeleccionarSala" 
          @close="() => {}" 
        />
      </div>

      <!-- Fase: Cargando Productos -->
      <div v-if="fase === 'cargando-productos'" class="min-h-screen flex items-center justify-center p-4">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-6"></div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Cargando productos...</h2>
          <p class="text-gray-600 dark:text-gray-400">{{ salaSeleccionada }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">Por favor espera</p>
        </div>
      </div>

      <!-- Fase: Conteo en Sala -->
      <div v-else-if="fase === 'sala'" class="min-h-screen p-4 pb-8">
        <div v-if="loadingProductos" class="max-w-2xl mx-auto flex items-center justify-center min-h-screen">
          <div class="text-center">
            <p class="text-gray-600 dark:text-gray-400 text-lg">Cargando productos...</p>
          </div>
        </div>
        <div v-else-if="productosBase.length === 0" class="max-w-2xl mx-auto flex items-center justify-center min-h-screen">
          <div class="text-center">
            <p class="text-red-600 dark:text-red-400 text-lg">No se encontraron productos para esta sala</p>
            <Button @click="fase = 'seleccionar-sala'" class="mt-4">Volver a seleccionar sala</Button>
          </div>
        </div>
        <div v-else class="max-w-2xl mx-auto">
          <div class="text-center mb-6">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg mb-4">
              <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1 leading-tight">Reposición Minoil</h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">{{ salaSeleccionada }}</p>
          </div>

          <Card className="bg-white dark:bg-gray-800 shadow-2xl border-0 overflow-hidden">
            <div class="bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 text-white pb-6 pt-6 px-5">
              <h2 class="text-xl font-bold text-center">Conteo en Sala</h2>
              <p class="text-blue-100 text-sm mt-2 text-center font-medium">Producto {{ indexActual + 1 }}/{{ productosBase.length || 0 }}</p>
            </div>
            <div class="space-y-5 pt-6 px-5 pb-6">
              <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-4 rounded-2xl border-2 border-blue-200 dark:border-blue-700 shadow-sm">
                <div class="flex items-start gap-3">
                  <div class="bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm">
                    <svg class="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1">PRODUCTO</p>
                    <p class="text-gray-900 dark:text-gray-100 font-bold text-base leading-tight">{{ itemActual.item }}</p>
                  </div>
                </div>
              </div>

              <div class="space-y-4">
                <p class="text-sm font-bold text-gray-900 dark:text-gray-100 text-center">Ingresa cantidad por lote</p>
                <div class="grid grid-cols-1 gap-4">
                  <template v-for="(lote, loteIdx) in itemActual.lotes" :key="loteIdx">
                    <div
                      v-if="lote.lote && lote.lote.trim() !== ''"
                      class="bg-blue-50 dark:bg-blue-900 p-4 rounded-xl border-2 border-blue-200 dark:border-blue-700"
                    >
                      <div class="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <div class="flex items-center gap-2 mb-1">
                            <svg class="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                            </svg>
                            <p class="text-xs text-gray-600 dark:text-gray-400 font-semibold">LOTE</p>
                          </div>
                          <p class="font-mono font-bold text-sm text-gray-900 dark:text-gray-100">{{ lote.lote }}</p>
                        </div>
                        <div>
                          <div class="flex items-center gap-2 mb-1">
                            <svg class="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p class="text-xs text-gray-600 dark:text-gray-400 font-semibold">VENCE</p>
                          </div>
                          <p class="font-bold text-sm text-gray-900 dark:text-gray-100">{{ formatearFecha(lote.fechaVencimiento) }}</p>
                        </div>
                      </div>
                      <Input
                        type="number"
                        :model-value="String(cantidadesActuales[lote.indiceOriginal ?? loteIdx] || '')"
                        @update:model-value="(val) => handleCantidadSala(lote.indiceOriginal ?? loteIdx, val)"
                        placeholder="0"
                        class="bg-white dark:bg-gray-700 border-3 border-blue-600 dark:border-blue-500 text-gray-900 dark:text-gray-100 text-2xl font-bold h-16 text-center shadow-lg rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800"
                        min="0"
                        autofocus
                      />
                    </div>
                  </template>
                </div>
              </div>

              <Button
                @click="handleGuardarProducto"
                :disabled="!todosLlenosEnSala"
                class="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:opacity-90 h-14 text-lg font-bold shadow-xl disabled:opacity-50 rounded-xl"
              >
                <svg class="h-5 w-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ indexActual < productosBase.length - 1 ? 'Siguiente Producto' : 'Continuar' }}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <!-- Fase: Pregunta Bodega -->
      <div v-else-if="fase === 'pregunta-bodega'" class="min-h-screen p-6 flex items-center justify-center">
        <Card class="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl border-0 overflow-hidden">
          <div class="bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 text-white pb-8 pt-8 px-5">
            <div class="flex justify-center mb-4">
              <div class="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                <svg class="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <h2 class="text-center text-2xl font-bold">Conteo en Sala Completado</h2>
            <p class="text-center text-blue-100 text-sm mt-2">{{ salaSeleccionada }}</p>
          </div>
          <div class="p-8 space-y-6">
            <div class="text-center space-y-3">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-2">
                <svg class="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">¿Esta sala tiene bodega?</h3>
              <p class="text-gray-600 dark:text-gray-400 text-sm">Selecciona una opción para continuar</p>
            </div>

            <div class="space-y-3">
              <Button
                @click="handleRespuestaBodega(true)"
                class="w-full h-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:opacity-90 text-lg font-bold shadow-lg"
              >
                <svg class="h-6 w-6 mr-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Sí, tiene bodega
              </Button>
              <Button
                @click="handleRespuestaBodega(false)"
                variant="outline"
                class="w-full h-16 border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 text-lg font-bold"
              >
                No tiene bodega
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <!-- Fase: Conteo en Bodega -->
      <div v-else-if="fase === 'bodega'" class="min-h-screen p-4 pb-8">
        <div class="max-w-2xl mx-auto">
          <div class="text-center mb-6">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg mb-4">
              <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1 leading-tight">Reposición Minoil</h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">{{ salaSeleccionada }}</p>
          </div>

          <Card class="bg-white dark:bg-gray-800 shadow-2xl border-0 overflow-hidden">
            <div class="bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 text-white pb-6 pt-6 px-5">
              <h2 class="text-xl font-bold text-center">Conteo en Bodega</h2>
              <p class="text-blue-100 text-sm mt-2 text-center font-medium">Producto {{ indexActual + 1 }}/{{ productosBase.length || 0 }}</p>
            </div>
            <div class="space-y-5 pt-6 px-5 pb-6">
              <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-4 rounded-2xl border-2 border-blue-200 dark:border-blue-700 shadow-sm">
                <div class="flex items-start gap-3">
                  <div class="bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm">
                    <svg class="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1">PRODUCTO</p>
                    <p class="text-gray-900 dark:text-gray-100 font-bold text-base leading-tight">{{ itemActual.item }}</p>
                  </div>
                </div>
              </div>

              <div class="space-y-4">
                <p class="text-sm font-bold text-gray-900 dark:text-gray-100 text-center">Ingresa cantidad por lote</p>
                <div class="grid grid-cols-1 gap-4">
                  <template v-for="(lote, loteIdx) in itemActual.lotes" :key="loteIdx">
                    <div
                      v-if="lote.lote && lote.lote.trim() !== ''"
                      class="bg-blue-50 dark:bg-blue-900 p-4 rounded-xl border-2 border-blue-200 dark:border-blue-700"
                    >
                      <div class="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <div class="flex items-center gap-2 mb-1">
                            <svg class="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                            </svg>
                            <p class="text-xs text-gray-600 dark:text-gray-400 font-semibold">LOTE</p>
                          </div>
                          <p class="font-mono font-bold text-sm text-gray-900 dark:text-gray-100">{{ lote.lote }}</p>
                        </div>
                        <div>
                          <div class="flex items-center gap-2 mb-1">
                            <svg class="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p class="text-xs text-gray-600 dark:text-gray-400 font-semibold">VENCE</p>
                          </div>
                          <p class="font-bold text-sm text-gray-900 dark:text-gray-100">{{ formatearFecha(lote.fechaVencimiento) }}</p>
                        </div>
                      </div>
                      <Input
                        type="number"
                        :model-value="String(cantidadesBodega[lote.indiceOriginal ?? loteIdx] || '')"
                        @update:model-value="(val) => handleCantidadBodega(lote.indiceOriginal ?? loteIdx, val)"
                        placeholder="0"
                        class="bg-white dark:bg-gray-700 border-3 border-blue-600 dark:border-blue-500 text-gray-900 dark:text-gray-100 text-2xl font-bold h-16 text-center shadow-lg rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800"
                        min="0"
                        autofocus
                      />
                    </div>
                  </template>
                </div>
              </div>

              <Button
                @click="handleSiguienteBodega"
                :disabled="!todosLlenosEnBodega"
                class="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:opacity-90 h-16 text-base font-bold shadow-xl disabled:opacity-50 rounded-xl"
              >
                <svg class="h-5 w-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ indexActual < productosBase.length - 1 ? 'Siguiente Producto' : 'Finalizar' }}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <!-- Fase: Informe Final -->
      <div v-else-if="fase === 'informe' || mostrarInforme" class="min-h-screen p-4 pb-8">
        <div class="max-w-2xl mx-auto">
          <Card class="bg-white dark:bg-gray-800 shadow-2xl border-0 overflow-hidden">
            <div class="bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 text-white pb-8 pt-6 px-5">
              <div class="flex items-center justify-center mb-3">
                <div class="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <h2 class="text-center text-2xl font-bold">Informe de Reposición</h2>
              <p class="text-center text-blue-100 text-sm mt-1">Minoil</p>
            </div>
            <div class="space-y-5 pt-6 px-4">
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-gradient-to-br from-green-500 to-green-600 p-5 rounded-2xl shadow-lg text-white">
                  <svg class="h-6 w-6 mb-2 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p class="text-sm font-medium opacity-90">Total Sala</p>
                  <p class="text-3xl font-bold mt-1">{{ totalSala }}</p>
                </div>
                <div class="bg-gradient-to-br from-amber-500 to-amber-600 p-5 rounded-2xl shadow-lg text-white">
                  <svg class="h-6 w-6 mb-2 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p class="text-sm font-medium opacity-90">Total Bodega</p>
                  <p class="text-3xl font-bold mt-1">{{ salaTieneBodega ? totalBodega : 'N/A' }}</p>
                </div>
              </div>

              <div class="bg-blue-50 dark:bg-blue-900 p-4 rounded-xl border-2 border-blue-200 dark:border-blue-700">
                <p class="text-center text-sm font-semibold text-blue-900 dark:text-blue-100">
                  {{ registros.length }} registros completados
                </p>
              </div>

              <div class="space-y-3">
                <div
                  v-for="(producto, prodIndex) in registrosAgrupados"
                  :key="prodIndex"
                  class="bg-white dark:bg-gray-700 rounded-xl border-2 border-blue-100 dark:border-blue-800 shadow-md overflow-hidden"
                >
                  <div class="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
                    <div class="flex items-center justify-between">
                      <div class="flex-1 min-w-0">
                        <p class="font-bold text-white text-base leading-tight">{{ producto.item }}</p>
                        <p class="text-xs text-blue-100 mt-1 flex items-center gap-1">
                          <svg class="h-3 w-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span class="truncate">{{ producto.sala }}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="p-4">
                    <div class="overflow-x-auto">
                      <table class="w-full text-sm">
                        <thead>
                          <tr class="border-b border-gray-200 dark:border-gray-600">
                            <th class="text-left py-2 px-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Lote</th>
                            <th class="text-left py-2 px-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Vence</th>
                            <th class="text-center py-2 px-2 text-xs font-semibold text-green-600 dark:text-green-400">Sala</th>
                            <th class="text-center py-2 px-2 text-xs font-semibold text-amber-600 dark:text-amber-400">Bodega</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(lote, loteIdx) in producto.lotes"
                            :key="loteIdx"
                            class="border-b border-gray-100 dark:border-gray-700"
                          >
                            <td class="py-2 px-2">
                              <p class="font-mono text-xs font-bold text-gray-900 dark:text-gray-100">{{ lote.lote }}</p>
                            </td>
                            <td class="py-2 px-2">
                              <p class="text-xs text-gray-700 dark:text-gray-300">{{ formatearFecha(lote.fechaVencimiento) }}</p>
                            </td>
                            <td class="py-2 px-2 text-center">
                              <span class="inline-block bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded font-bold text-sm">
                                {{ lote.cantidadSala }}
                              </span>
                            </td>
                            <td class="py-2 px-2 text-center">
                              <span
                                v-if="lote.noHayEnBodega"
                                class="inline-block bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-1 rounded font-bold text-xs"
                              >
                                No hay
                              </span>
                              <span
                                v-else
                                class="inline-block bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-2 py-1 rounded font-bold text-sm"
                              >
                                {{ lote.cantidadBodega || 0 }}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  @click="imprimirResumen"
                  variant="outline"
                  class="h-14 text-base font-bold border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900"
                >
                  <svg class="h-5 w-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Imprimir
                </Button>
                <Button
                  @click="descargarResumen"
                  variant="outline"
                  class="h-14 text-base font-bold border-2 border-green-600 dark:border-green-500 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900"
                >
                  <svg class="h-5 w-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descargar PDF
                </Button>
                <Button
                  @click="resetearFormulario"
                  class="h-14 text-base font-bold bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:opacity-90 shadow-lg"
                >
                  <svg class="h-5 w-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Nueva Reposición
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import MainLayout from '@/components/layouts/MainLayout.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import RoomSelectorModal, { type Sala } from '@/components/RoomSelectorModal.vue'
import salasService from '@/services/salas.service'
import productosService from '@/services/productos.service'
import jsPDF from 'jspdf'

interface LoteInfo {
  lote: string
  fechaVencimiento: string
  stockSala: number
  stockBodega: number
  indiceOriginal?: number
}

interface ItemReposicion {
  id: string
  item: string
  sala: string
  lotes: LoteInfo[]
}

interface RegistroReposicion {
  item: string
  sala: string
  lote: string
  fechaVencimiento: string
  cantidadSala: number
  cantidadBodega: number | null
  noHayEnBodega: boolean
}

type Fase = 'seleccionar-sala' | 'cargando-productos' | 'sala' | 'pregunta-bodega' | 'bodega' | 'informe'

const fase = ref<Fase>('seleccionar-sala')
const salaSeleccionada = ref<string | null>(null)
const salaSeleccionadaObj = ref<Sala | null>(null)
const indexActual = ref(0)
const lotesCantidadesSala = ref<Record<string, Record<number, number>>>({})
const lotesCantidadesBodega = ref<Record<string, Record<number, number>>>({})
const registros = ref<RegistroReposicion[]>([])
const mostrarInforme = ref(false)
const salaTieneBodega = ref<boolean | null>(null)
const productosBase = ref<ItemReposicion[]>([])
const loadingProductos = ref(false)

// Productos por defecto (fallback)
const productosDefault: ItemReposicion[] = [
  {
    id: '1',
    item: 'LECHE VEG/BANANA 946 ML',
    sala: '',
    lotes: [
      { lote: 'LT240115A', fechaVencimiento: '2025-01-15', stockSala: 12, stockBodega: 48 },
      { lote: 'LT240110C', fechaVencimiento: '2025-01-10', stockSala: 8, stockBodega: 32 },
      { lote: 'LT240120E', fechaVencimiento: '2025-01-20', stockSala: 15, stockBodega: 60 },
    ],
  },
  {
    id: '2',
    item: 'SIXPACK MIX LECHES 140 ML',
    sala: '',
    lotes: [
      { lote: 'SP240120B', fechaVencimiento: '2025-01-20', stockSala: 18, stockBodega: 72 },
      { lote: 'SP240125D', fechaVencimiento: '2025-01-25', stockSala: 24, stockBodega: 96 },
      { lote: 'SP240130F', fechaVencimiento: '2025-01-30', stockSala: 20, stockBodega: 80 },
    ],
  },
  {
    id: '3',
    item: 'LECHE VEG/CHOCOLATE 946 ML',
    sala: '',
    lotes: [
      { lote: 'LT240118E', fechaVencimiento: '2025-01-18', stockSala: 15, stockBodega: 60 },
      { lote: 'LT240122G', fechaVencimiento: '2025-01-22', stockSala: 10, stockBodega: 40 },
      { lote: 'LT240128H', fechaVencimiento: '2025-01-28', stockSala: 18, stockBodega: 72 },
    ],
  },
  {
    id: '4',
    item: 'LECHE VEG/VAINILLA 946 ML',
    sala: '',
    lotes: [
      { lote: 'LT240122F', fechaVencimiento: '2025-01-22', stockSala: 20, stockBodega: 80 },
      { lote: 'LT240128G', fechaVencimiento: '2025-01-28', stockSala: 10, stockBodega: 40 },
      { lote: 'LT240202I', fechaVencimiento: '2025-02-02', stockSala: 16, stockBodega: 64 },
    ],
  },
  {
    id: '5',
    item: 'LECHE VEG/FRESA 946 ML',
    sala: '',
    lotes: [
      { lote: 'LT240112H', fechaVencimiento: '2025-01-12', stockSala: 14, stockBodega: 56 },
      { lote: 'LT240118J', fechaVencimiento: '2025-01-18', stockSala: 12, stockBodega: 48 },
      { lote: 'LT240125K', fechaVencimiento: '2025-01-25', stockSala: 22, stockBodega: 88 },
    ],
  },
  {
    id: '6',
    item: 'PACK LECHES SURTIDO 250 ML',
    sala: '',
    lotes: [
      { lote: 'PK240116I', fechaVencimiento: '2025-01-16', stockSala: 22, stockBodega: 88 },
      { lote: 'PK240120J', fechaVencimiento: '2025-01-20', stockSala: 16, stockBodega: 64 },
      { lote: 'PK240126L', fechaVencimiento: '2025-01-26', stockSala: 28, stockBodega: 112 },
    ],
  },
  {
    id: '7',
    item: 'LECHE VEG/COCO 946 ML',
    sala: '',
    lotes: [
      { lote: 'LT240125K', fechaVencimiento: '2025-01-25', stockSala: 18, stockBodega: 72 },
      { lote: 'LT240130M', fechaVencimiento: '2025-01-30', stockSala: 14, stockBodega: 56 },
      { lote: 'LT240205N', fechaVencimiento: '2025-02-05', stockSala: 20, stockBodega: 80 },
    ],
  },
]

const salasDisponibles = ref<Sala[]>([])
const loadingSalas = ref(false)

const itemActual = computed(() => productosBase.value[indexActual.value])

const cantidadesActuales = computed(() => {
  if (!productosBase.value[indexActual.value]) return {}
  const idProductoActual = productosBase.value[indexActual.value].id
  return lotesCantidadesSala.value[idProductoActual] || {}
})

const cantidadesBodega = computed(() => {
  if (!productosBase.value[indexActual.value]) return {}
  const idProductoActual = productosBase.value[indexActual.value].id
  return lotesCantidadesBodega.value[idProductoActual] || {}
})

const todosLlenosEnSala = computed(() => {
  if (!itemActual.value) return false
  const idProductoActual = productosBase.value[indexActual.value].id
  const cantidades = lotesCantidadesSala.value[idProductoActual] || {}
  return itemActual.value.lotes.every((_, idx) => cantidades[idx] !== undefined && cantidades[idx] > 0)
})

const todosLlenosEnBodega = computed(() => {
  if (!itemActual.value) return false
  const idProductoActual = productosBase.value[indexActual.value].id
  const cantidades = lotesCantidadesBodega.value[idProductoActual] || {}
  return itemActual.value.lotes.every((_, idx) => cantidades[idx] !== undefined && cantidades[idx] > 0)
})

const totalSala = computed(() => registros.value.reduce((acc, r) => acc + r.cantidadSala, 0))
const totalBodega = computed(() => registros.value.reduce((acc, r) => acc + (r.cantidadBodega || 0), 0))

// Agrupar registros por producto para mostrar los 3 lotes en una sola fila
const registrosAgrupados = computed(() => {
  const agrupados = new Map<string, {
    item: string
    sala: string
    lotes: Array<{
      lote: string
      fechaVencimiento: string
      cantidadSala: number
      cantidadBodega: number | null
      noHayEnBodega: boolean
    }>
  }>()

  registros.value.forEach((registro) => {
    const key = `${registro.item}-${registro.sala}`
    if (!agrupados.has(key)) {
      agrupados.set(key, {
        item: registro.item,
        sala: registro.sala,
        lotes: [],
      })
    }
    agrupados.get(key)!.lotes.push({
      lote: registro.lote,
      fechaVencimiento: registro.fechaVencimiento,
      cantidadSala: registro.cantidadSala,
      cantidadBodega: registro.cantidadBodega,
      noHayEnBodega: registro.noHayEnBodega,
    })
  })

  return Array.from(agrupados.values())
})

const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const handleSeleccionarSala = async (sala: Sala) => {
  salaSeleccionada.value = sala.nombre || sala.alias || sala.codigo
  salaSeleccionadaObj.value = sala
  indexActual.value = 0
  
  // Mostrar indicador de carga
  fase.value = 'cargando-productos'
  
  // Cargar productos para esta sala
  await cargarProductos(sala.codigo)
  
  // Si hay productos, ir a la fase de sala, sino volver a seleccionar
  if (productosBase.value.length > 0) {
    fase.value = 'sala'
  } else {
    fase.value = 'seleccionar-sala'
  }
}

const handleCantidadSala = (loteIdx: number, value: string) => {
  if (!productosBase.value[indexActual.value]) return
  const idProductoActual = productosBase.value[indexActual.value].id
  const nuevasCantidades = { ...cantidadesActuales.value }
  nuevasCantidades[loteIdx] = value ? Number(value) : 0
  lotesCantidadesSala.value = {
    ...lotesCantidadesSala.value,
    [idProductoActual]: nuevasCantidades,
  }
}

const handleCantidadBodega = (loteIdx: number, value: string) => {
  if (!productosBase.value[indexActual.value]) return
  const idProductoActual = productosBase.value[indexActual.value].id
  const nuevasCantidades = { ...cantidadesBodega.value }
  nuevasCantidades[loteIdx] = value ? Number(value) : 0
  lotesCantidadesBodega.value = {
    ...lotesCantidadesBodega.value,
    [idProductoActual]: nuevasCantidades,
  }
}

const handleGuardarProducto = () => {
  if (!todosLlenosEnSala.value) return

  if (indexActual.value < productosBase.value.length - 1) {
    indexActual.value++
  } else {
    fase.value = 'pregunta-bodega'
  }
}

const handleRespuestaBodega = (tieneBodega: boolean) => {
  salaTieneBodega.value = tieneBodega

  if (tieneBodega) {
    fase.value = 'bodega'
    indexActual.value = 0
    registros.value = [] // Limpiar registros antes de empezar bodega
  } else {
    // No tiene bodega - generar resumen inmediatamente
    const nuevosRegistros: RegistroReposicion[] = []
    productosBase.value.forEach((producto) => {
      producto.lotes.forEach((lote) => {
        // Usar el índice original del lote si está disponible
        const indiceLote = lote.indiceOriginal !== undefined ? lote.indiceOriginal : producto.lotes.indexOf(lote)
        nuevosRegistros.push({
          item: producto.item,
          sala: salaSeleccionada.value!,
          lote: lote.lote,
          fechaVencimiento: lote.fechaVencimiento,
          cantidadSala: lotesCantidadesSala.value[producto.id]?.[indiceLote] || 0,
          cantidadBodega: null,
          noHayEnBodega: true,
        })
      })
    })
    registros.value = nuevosRegistros
    fase.value = 'informe' // Cambiar a fase informe en lugar de solo mostrarInforme
    mostrarInforme.value = true
  }
}

const handleSiguienteBodega = () => {
  const idProductoActual = productosBase.value[indexActual.value].id
  const itemActual = productosBase.value[indexActual.value]
  const cantidadesBodega = lotesCantidadesBodega.value[idProductoActual] || {}
  const cantidadesSala = lotesCantidadesSala.value[idProductoActual] || {}

  itemActual.lotes.forEach((lote) => {
    // Usar el índice original del lote si está disponible
    const indiceLote = lote.indiceOriginal !== undefined ? lote.indiceOriginal : itemActual.lotes.indexOf(lote)
    registros.value.push({
      item: itemActual.item,
      sala: salaSeleccionada.value!,
      lote: lote.lote,
      fechaVencimiento: lote.fechaVencimiento,
      cantidadSala: cantidadesSala[indiceLote] || 0,
      cantidadBodega: cantidadesBodega[indiceLote] || 0,
      noHayEnBodega: false,
    })
  })

  avanzarSiguienteProducto()
}


const avanzarSiguienteProducto = () => {
  if (indexActual.value < productosBase.value.length - 1) {
    indexActual.value++
  } else {
    // Terminó de contar bodega - mostrar resumen
    fase.value = 'informe'
    mostrarInforme.value = true
  }
}

const resetearFormulario = () => {
  registros.value = []
  lotesCantidadesSala.value = {}
  lotesCantidadesBodega.value = {}
  indexActual.value = 0
  fase.value = 'seleccionar-sala'
  mostrarInforme.value = false
  salaTieneBodega.value = null
  salaSeleccionada.value = null
  salaSeleccionadaObj.value = null
  productosBase.value = []
}

const cargarSalas = async () => {
  loadingSalas.value = true
  salasDisponibles.value = [] // Limpiar salas anteriores
  try {
    console.log('🔵 Iniciando carga de salas...')
    const salas = await salasService.getSalas()
    console.log('✅ Salas recibidas del servidor:', salas)
    console.log('✅ Total de salas recibidas:', salas.length)
    
    if (!salas || salas.length === 0) {
      console.warn('⚠️ No se recibieron salas del servidor')
      return
    }
    
    // Eliminar duplicados por código
    const salasUnicas = new Map<string, Sala>()
    salas.forEach((sala) => {
      if (sala.codigo && !salasUnicas.has(sala.codigo)) {
        salasUnicas.set(sala.codigo, sala)
      } else if (!sala.codigo) {
        console.warn('⚠️ Sala sin código:', sala)
      }
    })
    
    salasDisponibles.value = Array.from(salasUnicas.values())
    console.log('✅ Salas únicas después de eliminar duplicados:', salasDisponibles.value.length)
    console.log('✅ Salas disponibles:', salasDisponibles.value.map(s => s.nombre))
  } catch (error: any) {
    console.error('❌ Error cargando salas:', error)
    console.error('❌ Error response:', error.response)
    console.error('❌ Error message:', error.message)
    // Si hay error, NO usar salas por defecto, dejar vacío para que el usuario vea el error
    salasDisponibles.value = []
    alert('Error al cargar las salas. Por favor, recarga la página.')
  } finally {
    loadingSalas.value = false
  }
}

const cargarProductos = async (cardCode: string) => {
  loadingProductos.value = true
  productosBase.value = [] // Limpiar productos anteriores
  try {
    console.log('Cargando productos para sala:', cardCode)
    const productos = await productosService.getProductosPorSala(cardCode)
    console.log('Productos recibidos:', productos)
    
    // Convertir productos de la BD al formato esperado
    productosBase.value = productos
      .filter((producto) => producto.nombreProducto && producto.nombreProducto.trim() !== '')
      .map((producto, index) => {
        // Filtrar lotes vacíos pero mantener el índice original para mapeo
        const lotesConDatos = producto.lotes
          .map((lote, idx) => ({ ...lote, indiceOriginal: idx }))
          .filter((lote) => lote.lote && lote.lote.trim() !== '')
        
        return {
          id: producto.codigoProducto || String(index + 1),
          item: producto.nombreProducto.trim(),
          sala: salaSeleccionada.value || '',
          lotes: lotesConDatos.map((lote) => ({
            lote: lote.lote.trim(),
            fechaVencimiento: lote.fechaFactura || '',
            stockSala: lote.cantidadVendida || 0,
            stockBodega: 0, // No tenemos esta info en la query
            indiceOriginal: lote.indiceOriginal, // Guardar índice original
          })),
        }
      })
      .filter((producto) => producto.lotes.length > 0) // Solo productos con lotes
    
    console.log('Productos procesados:', productosBase.value.length)
    productosBase.value.forEach((p, idx) => {
      console.log(`Producto ${idx + 1}: ${p.item} - ${p.lotes.length} lotes`)
      p.lotes.forEach((l, lidx) => {
        console.log(`  Lote ${lidx + 1}: ${l.lote} - ${l.fechaVencimiento}`)
      })
    })
    
    if (productosBase.value.length === 0) {
      console.warn('No se encontraron productos con lotes para esta sala')
    }
  } catch (error: any) {
    console.error('Error cargando productos:', error)
    // Si hay error, usar productos por defecto
    productosBase.value = productosDefault
  } finally {
    loadingProductos.value = false
  }
}

const imprimirResumen = () => {
  const contenido = document.getElementById('resumen-impresion')
  if (!contenido) return

  const ventana = window.open('', '_blank')
  if (!ventana) return

  ventana.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Informe de Reposición - ${salaSeleccionada.value}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #2563eb;
            margin: 0;
          }
          .info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          .info-card {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
          }
          .info-card.amber {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          }
          .info-card h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            opacity: 0.9;
          }
          .info-card .valor {
            font-size: 36px;
            font-weight: bold;
            margin: 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background-color: #2563eb;
            color: white;
            padding: 12px;
            text-align: left;
            font-size: 12px;
            text-transform: uppercase;
          }
          td {
            padding: 10px;
            border-bottom: 1px solid #e5e7eb;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INFORME DE REPOSICIÓN</h1>
          <p style="color: #6b7280; margin: 5px 0;">Minoil S.A.</p>
          <p style="color: #6b7280; margin: 5px 0;">Sala: ${salaSeleccionada.value}</p>
          <p style="color: #6b7280; margin: 5px 0;">Fecha: ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
        <div class="info">
          <div class="info-card">
            <h3>Total Sala</h3>
            <p class="valor">${totalSala.value}</p>
          </div>
          <div class="info-card amber">
            <h3>Total Bodega</h3>
            <p class="valor">${salaTieneBodega.value ? totalBodega.value : 'N/A'}</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Producto</th>
              <th>Lote</th>
              <th>Vencimiento</th>
              <th>Sala</th>
              <th>Bodega</th>
            </tr>
          </thead>
          <tbody>
            ${registrosAgrupados.value.map((prod, prodIdx) => 
              prod.lotes.map((lote, loteIdx) => `
              <tr>
                <td>${prodIdx === 0 && loteIdx === 0 ? prodIdx + 1 : ''}</td>
                <td>${loteIdx === 0 ? prod.item : ''}</td>
                <td>${lote.lote}</td>
                <td>${formatearFecha(lote.fechaVencimiento)}</td>
                <td>${lote.cantidadSala}</td>
                <td>${lote.noHayEnBodega ? 'No hay' : (lote.cantidadBodega || 0)}</td>
              </tr>
            `).join('')
            ).join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>Total de registros: ${registros.value.length}</p>
          <p>Generado el ${new Date().toLocaleString('es-ES')}</p>
        </div>
      </body>
    </html>
  `)
  ventana.document.close()
  ventana.print()
}

const descargarResumen = () => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPos = 20
  const margin = 15
  const maxWidth = pageWidth - 2 * margin

  // Colores corporativos (grises y azul oscuro)
  const colorDarkBlue: [number, number, number] = [30, 41, 59] // #1e293b
  const colorDarkGray: [number, number, number] = [51, 65, 85] // #334155
  const colorMediumGray: [number, number, number] = [100, 116, 139] // #64748b
  const colorLightGray: [number, number, number] = [226, 232, 240] // #e2e8f0
  const colorTextGray: [number, number, number] = [71, 85, 105] // #475569

  // Encabezado
  doc.setFillColor(colorDarkBlue[0], colorDarkBlue[1], colorDarkBlue[2])
  doc.rect(0, 0, pageWidth, 50, 'F')
  
  doc.setFontSize(18)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('INFORME DE REPOSICIÓN', pageWidth / 2, 25, { align: 'center' })
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Minoil S.A.', pageWidth / 2, 35, { align: 'center' })
  
  yPos = 60

  doc.setFontSize(9)
  doc.setTextColor(colorTextGray[0], colorTextGray[1], colorTextGray[2])
  doc.text(`Sala: ${salaSeleccionada.value}`, margin, yPos)
  yPos += 5
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}`, margin, yPos)
  yPos += 12

  // Línea separadora
  doc.setDrawColor(colorLightGray[0], colorLightGray[1], colorLightGray[2])
  doc.setLineWidth(0.5)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 10

  // Resumen
  doc.setFontSize(12)
  doc.setTextColor(colorDarkBlue[0], colorDarkBlue[1], colorDarkBlue[2])
  doc.setFont('helvetica', 'bold')
  doc.text('RESUMEN', margin, yPos)
  yPos += 10

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)

  // Total Sala - estilo corporativo
  doc.setFillColor(colorLightGray[0], colorLightGray[1], colorLightGray[2])
  doc.roundedRect(margin, yPos - 5, (pageWidth - 2 * margin) / 2 - 5, 18, 2, 2, 'F')
  doc.setDrawColor(colorMediumGray[0], colorMediumGray[1], colorMediumGray[2])
  doc.setLineWidth(0.5)
  doc.roundedRect(margin, yPos - 5, (pageWidth - 2 * margin) / 2 - 5, 18, 2, 2, 'D')
  doc.setTextColor(colorDarkGray[0], colorDarkGray[1], colorDarkGray[2])
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('Total Sala', margin + 5, yPos + 2)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(colorDarkBlue[0], colorDarkBlue[1], colorDarkBlue[2])
  doc.text(String(totalSala.value), margin + 5, yPos + 10)

  // Total Bodega - estilo corporativo
  doc.setFillColor(colorLightGray[0], colorLightGray[1], colorLightGray[2])
  doc.roundedRect(pageWidth / 2 + 5, yPos - 5, (pageWidth - 2 * margin) / 2 - 5, 18, 2, 2, 'F')
  doc.setDrawColor(colorMediumGray[0], colorMediumGray[1], colorMediumGray[2])
  doc.roundedRect(pageWidth / 2 + 5, yPos - 5, (pageWidth - 2 * margin) / 2 - 5, 18, 2, 2, 'D')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(colorDarkGray[0], colorDarkGray[1], colorDarkGray[2])
  doc.text('Total Bodega', pageWidth / 2 + 10, yPos + 2)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(colorDarkBlue[0], colorDarkBlue[1], colorDarkBlue[2])
  doc.text(salaTieneBodega.value ? String(totalBodega.value) : 'N/A', pageWidth / 2 + 10, yPos + 10)
  yPos += 25

  // Línea separadora
  doc.setDrawColor(colorLightGray[0], colorLightGray[1], colorLightGray[2])
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 10

  // Detalle de registros
  doc.setFontSize(12)
  doc.setTextColor(colorDarkBlue[0], colorDarkBlue[1], colorDarkBlue[2])
  doc.setFont('helvetica', 'bold')
  doc.text('DETALLE DE REGISTROS', margin, yPos)
  yPos += 8

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)

  // Tabla de productos
  registrosAgrupados.value.forEach((prod, prodIdx) => {
    // Verificar si necesitamos una nueva página
    if (yPos > pageHeight - 50) {
      doc.addPage()
      yPos = 20
    }

    // Nombre del producto
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(colorDarkBlue[0], colorDarkBlue[1], colorDarkBlue[2])
    doc.text(`${prodIdx + 1}. ${prod.item}`, margin, yPos)
    yPos += 7

    // Encabezados de tabla - estilo corporativo
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(255, 255, 255)
    doc.setFillColor(colorDarkGray[0], colorDarkGray[1], colorDarkGray[2])
    doc.rect(margin, yPos - 4, maxWidth, 6, 'F')
    
    const colWidths = [maxWidth * 0.25, maxWidth * 0.25, maxWidth * 0.25, maxWidth * 0.25]
    let xPos = margin
    
    doc.text('Lote', xPos + 2, yPos)
    xPos += colWidths[0]
    doc.text('Vence', xPos + 2, yPos)
    xPos += colWidths[1]
    doc.text('Sala', xPos + 2, yPos)
    xPos += colWidths[2]
    doc.text('Bodega', xPos + 2, yPos)
    yPos += 6

    // Filas de lotes
    prod.lotes.forEach((lote, loteIdx) => {
      if (yPos > pageHeight - 20) {
        doc.addPage()
        yPos = 20
      }

      // Fondo alternado para mejor legibilidad
      if (loteIdx % 2 === 0) {
        doc.setFillColor(250, 250, 250)
        doc.rect(margin, yPos - 4, maxWidth, 5, 'F')
      }

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(0, 0, 0)
      xPos = margin

      // Lote
      doc.text(lote.lote, xPos + 2, yPos)
      xPos += colWidths[0]

      // Vencimiento
      doc.text(formatearFecha(lote.fechaVencimiento), xPos + 2, yPos)
      xPos += colWidths[1]

      // Sala - estilo corporativo
      doc.setDrawColor(colorMediumGray[0], colorMediumGray[1], colorMediumGray[2])
      doc.setLineWidth(0.3)
      doc.rect(xPos, yPos - 4, colWidths[2] - 1, 5, 'D')
      doc.setTextColor(colorDarkBlue[0], colorDarkBlue[1], colorDarkBlue[2])
      doc.setFont('helvetica', 'bold')
      doc.text(String(lote.cantidadSala), xPos + colWidths[2] / 2, yPos, { align: 'center' })
      xPos += colWidths[2]

      // Bodega - estilo corporativo
      doc.setDrawColor(colorMediumGray[0], colorMediumGray[1], colorMediumGray[2])
      doc.rect(xPos, yPos - 4, colWidths[3] - 1, 5, 'D')
      if (lote.noHayEnBodega) {
        doc.setTextColor(120, 120, 120)
        doc.setFont('helvetica', 'normal')
        doc.text('No hay', xPos + colWidths[3] / 2, yPos, { align: 'center' })
      } else {
        doc.setTextColor(colorDarkBlue[0], colorDarkBlue[1], colorDarkBlue[2])
        doc.setFont('helvetica', 'bold')
        doc.text(String(lote.cantidadBodega || 0), xPos + colWidths[3] / 2, yPos, { align: 'center' })
      }

      yPos += 6
      doc.setTextColor(0, 0, 0)
    })

    yPos += 4 // Espacio entre productos
  })

  // Pie de página
  const finalY = pageHeight - 15
  doc.setFontSize(7)
  doc.setTextColor(colorMediumGray[0], colorMediumGray[1], colorMediumGray[2])
  doc.setFont('helvetica', 'normal')
  doc.text(`Total de registros: ${registros.value.length}`, margin, finalY)
  doc.text(`Generado el: ${new Date().toLocaleString('es-ES')}`, pageWidth - margin, finalY, { align: 'right' })

  // Descargar
  const fileName = `Informe_Reposicion_${salaSeleccionada.value?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}

onMounted(() => {
  cargarSalas()
})
</script>
