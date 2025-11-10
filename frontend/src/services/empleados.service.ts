import axios from 'axios'
import authService from './auth.service'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface Empleado {
  ID: number
  NOMBRE: string
  APELLIDO: string
  EMAIL: string
  PUESTO: string
}

class EmpleadosService {
  async getEmpleados(): Promise<Empleado[]> {
    const token = authService.getToken()
    const response = await axios.get<Empleado[]>(`${API_URL}/empleados`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  }
}

export default new EmpleadosService()
