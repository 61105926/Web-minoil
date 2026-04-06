import authService from './auth.service'

export interface Empleado {
  ID: number
  NOMBRE: string
  APELLIDO: string
  EMAIL: string
  PUESTO: string
}

class EmpleadosService {
  async getEmpleados(): Promise<Empleado[]> {
    const response = await authService.http.get<Empleado[]>('/empleados')
    return response.data
  }
}

export default new EmpleadosService()
