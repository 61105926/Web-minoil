import authService from './auth.service'

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
    const response = await authService.http.get<ProductoSimple[]>('/productos/cervezas')
    if (!Array.isArray(response.data)) {
      throw new Error('No se pudo obtener la lista de cervezas.')
    }
    return response.data
  }

  async getProductosPorSala(cardCode: string, tipo: string = 'impost'): Promise<ProductoConLotes[]> {
    const response = await authService.http.get<ProductoConLotes[]>(
      `/productos/sala/${encodeURIComponent(cardCode)}?tipo=${tipo}`
    )
    return response.data
  }
}

export default new ProductosService()

