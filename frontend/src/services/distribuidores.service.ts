import authService from './auth.service'

export interface Distribuidor {
  ID: number
  NOMBRE: string
  LATITUD: number | null
  LONGITUD: number | null
  CREATED_AT: string
  UPDATED_AT: string | null
}

export interface CreateDistribuidorDto {
  nombre: string
  latitud?: number
  longitud?: number
}

class DistribuidoresService {
  async getAll(): Promise<Distribuidor[]> {
    const res = await authService.http.get('/api/v1/distribuidores')
    return res.data
  }

  async create(dto: CreateDistribuidorDto): Promise<void> {
    await authService.http.post('/api/v1/distribuidores', dto)
  }
}

export default new DistribuidoresService()
