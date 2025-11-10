import axios from 'axios'
import authService from './auth.service'

// En producción, si no hay VITE_API_URL, usar ruta relativa (mismo servidor)
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3000')

export interface Sala {
  codigo: string
  nombre: string
  alias: string
  glblLocNum: string
}

class SalasService {
  async getSalas(): Promise<Sala[]> {
    const token = authService.getToken()
    if (!token) {
      throw new Error('No autenticado')
    }

    const response = await axios.get<Sala[]>(`${API_URL}/salas`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data
  }
}

export default new SalasService()

