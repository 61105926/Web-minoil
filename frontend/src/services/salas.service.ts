import authService from './auth.service'

export interface Sala {
  codigo: string
  nombre: string
  alias: string
  glblLocNum: string
}

class SalasService {
  async getSalas(): Promise<Sala[]> {
    const response = await authService.http.get<Sala[]>('/salas')
    return response.data
  }
}

export default new SalasService()

