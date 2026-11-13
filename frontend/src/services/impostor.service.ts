import authService from './auth.service'

export interface ImpostorStockData {
  CardCode: string
  ItemCode: string
  BatchNum: string
  StockSala: number
  StockBodega: number
}

export interface InsertarStockResultado {
  success: boolean
  message: string
  registrosInsertados: number
  /** true si el backend ya tenía guardado este conteoId (reintento): no se insertó de nuevo. */
  duplicado?: boolean
  empleado: string
  regional: string | null
}

class ImpostorService {
  /** `conteoId` identifica el conteo para que reenviarlo no duplique filas. */
  async insertarStock(datos: ImpostorStockData[], conteoId: string): Promise<InsertarStockResultado> {
    const response = await authService.http.post<InsertarStockResultado>('/impostor/stock', { datos, conteoId })
    return response.data
  }
}

export default new ImpostorService()
