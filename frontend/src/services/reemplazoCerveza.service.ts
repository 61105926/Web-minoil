import authService from './auth.service'

export interface ReemplazoCervezaData {
  cardCode: string
  itemCode: string
  stock: number
  expirationDate?: string | null
  observations?: string | null
}

export interface ReemplazoCervezaRecord {
  id: number
  cardCode: string
  ItemCode: string
  ItemName: string
  stock: number
  expiration_date: string | null
  observations: string | null
  created_at: string
}

class ReemplazoCervezaService {
  async crearReemplazo(data: ReemplazoCervezaData): Promise<{ success: boolean; message: string }> {
    const response = await authService.http.post<{ success: boolean; message: string }>('/reemplazo-cerveza', data)
    return response.data
  }

  async getRegistrosPorSala(cardCode: string): Promise<ReemplazoCervezaRecord[]> {
    const response = await authService.http.get<ReemplazoCervezaRecord[]>(
      `/reemplazo-cerveza/sala/${encodeURIComponent(cardCode)}`
    )
    return response.data
  }

  async eliminarRegistro(id: number): Promise<{ success: boolean; message: string }> {
    const response = await authService.http.delete<{ success: boolean; message: string }>(
      `/reemplazo-cerveza/${id}`
    )
    return response.data
  }
}

export default new ReemplazoCervezaService()
