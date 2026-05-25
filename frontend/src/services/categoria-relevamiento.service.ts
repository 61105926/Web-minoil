import authService from './auth.service'

const BASE = '/api/v1/categoria-relevamiento'

export interface ProductoSAP {
  itemCode: string
  itemName: string
}

export interface TradeItem {
  id?: number
  idProducto: string | null
  codigo: string
  nombre: string
  rubro: string | null
  grupo: string | null
  subgrupo: string | null
  clase: string | null
  subclase: string | null
  mercado: string | null
  estado: boolean | null
  pesoNeto: number | null
}

export interface PlayerSap {
  itemCode: string
  canal: string   // 'moderno' | 'tradicional' | 'ambos'
  itemName?: string
  players1: string | null
  players2: string | null
  players3: string | null
  nombrePlayer1?: string | null
  nombrePlayer2?: string | null
  nombrePlayer3?: string | null
}

export interface PlayersTask {
  itemCode: string
  itemName?: string
  fecha: string
  fechaini: string
  fechafin: string
  cartera: number
  usuario?: string
  activo?: number
  players1?: string | null
  players2?: string | null
  players3?: string | null
  nombrePlayer1?: string | null
  nombrePlayer2?: string | null
  nombrePlayer3?: string | null
}

class CategoriaRelevamientoService {
  async getProductos(): Promise<ProductoSAP[]> {
    const res = await authService.http.get(`${BASE}/productos`)
    return res.data
  }

  // ── Catálogo de competidores ────────────────────────────────────────────────
  async getTradeItems(): Promise<TradeItem[]> {
    const res = await authService.http.get(`${BASE}/trade-items`)
    return res.data
  }

  async createTradeItem(data: TradeItem): Promise<void> {
    await authService.http.post(`${BASE}/trade-items`, data)
  }

  async updateTradeItem(id: number, data: Partial<TradeItem>): Promise<void> {
    await authService.http.put(`${BASE}/trade-items/${id}`, data)
  }

  async deleteTradeItem(id: number): Promise<void> {
    await authService.http.delete(`${BASE}/trade-items/${id}`)
  }

  // ── Asignación producto → competidores ──────────────────────────────────────
  async getAllPlayerSap(): Promise<PlayerSap[]> {
    const res = await authService.http.get(`${BASE}/player-sap`)
    return res.data
  }

  async getPlayerSap(itemCode: string, canal?: string): Promise<PlayerSap | null> {
    const res = await authService.http.get(`${BASE}/player-sap`, { params: { itemCode, canal } })
    return res.data
  }

  async upsertPlayerSap(data: PlayerSap): Promise<void> {
    await authService.http.post(`${BASE}/player-sap`, data)
  }

  async deletePlayerSap(itemCode: string, canal?: string): Promise<void> {
    await authService.http.delete(`${BASE}/player-sap/${encodeURIComponent(itemCode)}`, { params: canal ? { canal } : {} })
  }

  async importTradeItems(items: Partial<TradeItem>[]): Promise<{ inserted: number; updated: number }> {
    const res = await authService.http.post(`${BASE}/trade-items/import`, { items })
    return res.data
  }

  async importPlayerSap(items: Partial<PlayerSap>[]): Promise<{ inserted: number; updated: number }> {
    const res = await authService.http.post(`${BASE}/player-sap/import`, { items })
    return res.data
  }

  // ── Programación de tareas ──────────────────────────────────────────────────
  async getTareas(): Promise<PlayersTask[]> {
    const res = await authService.http.get(`${BASE}/tareas`)
    return res.data
  }

  async createTarea(data: Omit<PlayersTask, 'usuario' | 'activo' | 'itemName' | 'players1' | 'players2' | 'players3' | 'nombrePlayer1' | 'nombrePlayer2' | 'nombrePlayer3'>): Promise<void> {
    await authService.http.post(`${BASE}/tareas`, data)
  }

  async updateTarea(itemCode: string, fecha: string, data: { activo?: number; fechaini?: string; fechafin?: string; cartera?: number }): Promise<void> {
    await authService.http.patch(`${BASE}/tareas/${encodeURIComponent(itemCode)}/${fecha}`, data)
  }

  async deleteTarea(itemCode: string, fecha: string): Promise<void> {
    await authService.http.delete(`${BASE}/tareas/${encodeURIComponent(itemCode)}/${fecha}`)
  }
}

export default new CategoriaRelevamientoService()
