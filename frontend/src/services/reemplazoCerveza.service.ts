import axios from 'axios'
import authService from './auth.service'

// En producción, si no hay VITE_API_URL, usar ruta relativa (mismo servidor)
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:8005')

export interface ReemplazoCervezaData {
  cardCode: string
  itemCode: string
  stock: number
  expirationDate?: string | null
  observations?: string | null
}

class ReemplazoCervezaService {
  async crearReemplazo(data: ReemplazoCervezaData): Promise<{ success: boolean; message: string }> {
    const token = authService.getToken()
    if (!token) {
      throw new Error('No autenticado')
    }

    const response = await axios.post<{ success: boolean; message: string }>(
      `${API_URL}/reemplazo-cerveza`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    return response.data
  }
}

export default new ReemplazoCervezaService()

