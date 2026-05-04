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

export interface ClienteEntrega {
  id: number
  clienteCodigoSAP: string
  clienteNombre: string
  latitud: number | null
  longitud: number | null
  pedidoSAP: string | null
  facturaSAP: string | null
  estado: number
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

  async getClientesDia(nombre: string, fecha: string): Promise<ClienteEntrega[]> {
    const res = await authService.http.get('/api/v1/mobile/distribuidores/clientes-dia', {
      params: { nombre, fecha },
    })
    return res.data
  }
}

export default new DistribuidoresService()
