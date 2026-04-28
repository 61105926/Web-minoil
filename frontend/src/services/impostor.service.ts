import authService from './auth.service'

export interface ImpostorStockData {
  CardCode: string
  ItemCode: string
  BatchNum: string
  StockSala: number
  StockBodega: number
}

class ImpostorService {
  async insertarStock(
    datos: ImpostorStockData[],
    regional?: string,
  ): Promise<{ success: boolean; message: string; registrosInsertados: number; empleado: string; regional: string | null }> {
    const response = await authService.http.post(
      '/impostor/stock',
      { datos, regional },
    )
    return response.data
  }
}

export default new ImpostorService()
