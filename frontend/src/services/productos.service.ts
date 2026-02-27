import axios from 'axios'
import authService from './auth.service'

// En producción, si no hay VITE_API_URL, usar ruta relativa (mismo servidor)
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:8005')

export interface LoteProducto {
  lote: string
  cantidadVendida: number
  fechaFactura: string
  fechaVencimiento: string
  numeroFactura: number
}

export interface ProductoSimple {
  codigoProducto: string
  nombreProducto: string
}

export interface ProductoConLotes {
  codigoProducto: string
  nombreProducto: string
  lotes: LoteProducto[]
}

class ProductosService {
  async getCervezas(): Promise<ProductoSimple[]> {
    const token = authService.getToken()
    if (!token) {
      throw new Error('No autenticado')
    }

    const response = await axios.get<ProductoSimple[]>(
      `${API_URL}/productos/cervezas`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!Array.isArray(response.data)) {
      console.error('Respuesta no válida del servidor:', response.data)
      throw new Error('No se pudo obtener la lista de cervezas (¿falló la conexión al backend?).')
    }

    return response.data
  }

  async getProductosPorSala(cardCode: string, tipo: string = 'impost'): Promise<ProductoConLotes[]> {
    const token = authService.getToken()
    if (!token) {
      throw new Error('No autenticado')
    }

    const response = await axios.get<ProductoConLotes[]>(
      `${API_URL}/productos/sala/${encodeURIComponent(cardCode)}?tipo=${tipo}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    return response.data
  }
}

export default new ProductosService()

