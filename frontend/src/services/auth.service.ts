import axios from 'axios'

// En producción, si no hay VITE_API_URL, usar ruta relativa (mismo servidor)
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3000')

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  access_token: string
  user: {
    id: number
    username: string
    email?: string
    region?: string
    territorio?: number
  }
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('🔵 AuthService.login llamado', { API_URL, url: `${API_URL}/auth/login`, credentials: { ...credentials, password: '***' } })
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, credentials)
      console.log('✅ Respuesta del servidor:', response.data)
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        console.log('✅ Token guardado en localStorage')
      }
      return response.data
    } catch (error: any) {
      console.error('❌ Error en AuthService.login:', error)
      console.error('❌ Error response:', error.response)
      console.error('❌ Error message:', error.message)
      throw error
    }
  }

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  getToken(): string | null {
    return localStorage.getItem('token')
  }

  getUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }
}

export default new AuthService()
