import axios from 'axios'
import authService from './auth.service'

// En producción, si no hay VITE_API_URL, usar ruta relativa (mismo servidor)
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:8005')

export interface ImpostorStockData {
  CardCode: string
  ItemCode: string
  BatchNum: string
  StockSala: number
  StockBodega: number
}

class ImpostorService {
  async insertarStock(datos: ImpostorStockData[]): Promise<{ success: boolean; message: string; registrosInsertados: number }> {
    const token = authService.getToken()
    if (!token) {
      throw new Error('No autenticado')
    }

    console.log('🔵 Enviando datos al servidor:', datos.length, 'registros')

    const response = await axios.post<{ success: boolean; message: string; registrosInsertados: number }>(
      `${API_URL}/impostor/stock`,
      { datos },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    console.log('✅ Datos insertados correctamente:', response.data)
    return response.data
  }
}

export default new ImpostorService()

