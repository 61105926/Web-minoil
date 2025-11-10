import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  access_token: string
  user: {
    id: number
    username: string
  }
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, credentials)
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
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
