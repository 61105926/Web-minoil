import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:8005'),
})

export interface BoletaMonth { month: number; year: number }

export default {
  async getMonths(numero: string): Promise<BoletaMonth[]> {
    const response = await http.get<BoletaMonth[]>('/boletas/meses', { params: { numero } })
    return response.data
  },
  async getPdf(numero: string, fecha: string): Promise<Blob> {
    const response = await http.get('/boletas/pdf', {
      params: { numero, fecha }, responseType: 'blob',
    })
    return response.data
  },
}
