import axios from 'axios'
import authService from './auth.service'

// En producción, si no hay VITE_API_URL, usar ruta relativa (mismo servidor)
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3000')

export interface LoteProducto {
  lote: string
  cantidadVendida: number
  fechaFactura: string
  numeroFactura: number
}

export interface ProductoConLotes {
  codigoProducto: string
  nombreProducto: string
  lotes: LoteProducto[]
}

class ProductosService {
  async getProductosPorSala(cardCode: string): Promise<ProductoConLotes[]> {
    const token = authService.getToken()
    if (!token) {
      throw new Error('No autenticado')
    }

    const response = await axios.get<ProductoConLotes[]>(
      `${API_URL}/productos/sala/${encodeURIComponent(cardCode)}`,
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

