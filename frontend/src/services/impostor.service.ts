import authService from './auth.service'

export interface ImpostorStockData {
  CardCode: string
  ItemCode: string
  BatchNum: string
  StockSala: number
  StockBodega: number
}

class ImpostorService {
  async insertarStock(datos: ImpostorStockData[]): Promise<{ success: boolean; message: string; registrosInsertados: number }> {
    const response = await authService.http.post<{ success: boolean; message: string; registrosInsertados: number }>(
      '/impostor/stock',
      { datos }
    )
    return response.data
  }
}

export default new ImpostorService()
