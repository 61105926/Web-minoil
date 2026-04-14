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

export interface PuntoTrayectoria {
  NOMBRE: string
  LATITUD: number
  LONGITUD: number
  CREATED_AT: string
}

class DistribuidoresService {
  async getAll(): Promise<Distribuidor[]> {
    const res = await authService.http.get('/api/v1/mobile/distribuidores')
    return res.data
  }

  async create(dto: CreateDistribuidorDto): Promise<void> {
    await authService.http.post('/api/v1/mobile/distribuidores', dto)
  }

  async getTrayectoria(nombre: string, fecha: string): Promise<PuntoTrayectoria[]> {
    const res = await authService.http.get('/api/v1/mobile/distribuidores/trayectoria', {
      params: { nombre, fecha },
    })
    return res.data
  }
}

export default new DistribuidoresService()
