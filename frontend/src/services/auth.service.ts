import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:8005')

const KEYCLOAK_BASE   = 'https://auth.minoil.com.bo/realms/minoil/protocol/openid-connect'
const KEYCLOAK_CLIENT = 'minoil-client'

// ---------- PKCE helpers ----------

async function generateCodeVerifier(): Promise<string> {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function getRedirectUri(): string {
  return `${window.location.origin}/callback`
}

// ---------- Auth service ----------

class AuthService {
  /** Redirige a Keycloak (login + password reset nativo) */
  async startLogin(): Promise<void> {
    const verifier   = await generateCodeVerifier()
    const challenge  = await generateCodeChallenge(verifier)
    const state      = crypto.randomUUID()

    sessionStorage.setItem('pkce_verifier', verifier)
    sessionStorage.setItem('pkce_state', state)

    const params = new URLSearchParams({
      client_id:             KEYCLOAK_CLIENT,
      redirect_uri:          getRedirectUri(),
      response_type:         'code',
      scope:                 'openid profile email',
      code_challenge:        challenge,
      code_challenge_method: 'S256',
      state,
    })

    window.location.href = `${KEYCLOAK_BASE}/auth?${params}`
  }

  /** Intercambia el code por token — llamado desde /callback */
  async handleCallback(code: string, state: string): Promise<void> {
    const savedState  = sessionStorage.getItem('pkce_state')
    const verifier    = sessionStorage.getItem('pkce_verifier')

    if (state !== savedState) throw new Error('State mismatch')
    if (!verifier)            throw new Error('Missing PKCE verifier')

    const params = new URLSearchParams({
      grant_type:    'authorization_code',
      client_id:     KEYCLOAK_CLIENT,
      redirect_uri:  getRedirectUri(),
      code,
      code_verifier: verifier,
    })

    const res = await axios.post(`${KEYCLOAK_BASE}/token`, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    const { access_token, refresh_token } = res.data
    const payload = JSON.parse(atob(access_token.split('.')[1]))

    localStorage.setItem('token', access_token)
    if (refresh_token) localStorage.setItem('refresh_token', refresh_token)
    localStorage.setItem('user', JSON.stringify({
      id:       payload.sub,
      username: payload.preferred_username,
      email:    payload.email,
      roles:    payload.realm_access?.roles ?? [],
    }))

    sessionStorage.removeItem('pkce_verifier')
    sessionStorage.removeItem('pkce_state')
  }

  /** Cierra sesión en Keycloak y limpia localStorage */
  logout(): void {
    const params = new URLSearchParams({
      client_id:               KEYCLOAK_CLIENT,
      post_logout_redirect_uri: `${window.location.origin}/login`,
    })
    localStorage.clear()
    window.location.href = `${KEYCLOAK_BASE}/logout?${params}`
  }

  getToken(): string | null    { return localStorage.getItem('token') }
  getUser()                    { const u = localStorage.getItem('user'); return u ? JSON.parse(u) : null }
  isAuthenticated(): boolean   { return !!this.getToken() }

  async refreshToken(): Promise<boolean> {
    const refreshTk = localStorage.getItem('refresh_token')
    if (!refreshTk) return false
    try {
      const params = new URLSearchParams({
        grant_type:    'refresh_token',
        client_id:     KEYCLOAK_CLIENT,
        refresh_token: refreshTk,
      })
      const res = await axios.post(`${KEYCLOAK_BASE}/token`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      const { access_token, refresh_token } = res.data
      localStorage.setItem('token', access_token)
      if (refresh_token) localStorage.setItem('refresh_token', refresh_token)
      return true
    } catch {
      localStorage.clear()
      window.location.href = '/login'
      return false
    }
  }

  /** Axios instance con Bearer automático y refresh en 401 */
  get http() {
    const instance = axios.create({ baseURL: API_URL })

    instance.interceptors.request.use(config => {
      const token = this.getToken()
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    })

    instance.interceptors.response.use(
      res => res,
      async error => {
        const original = error.config
        if (error.response?.status === 401 && !original._retry) {
          original._retry = true
          const ok = await this.refreshToken()
          if (ok) {
            original.headers.Authorization = `Bearer ${this.getToken()}`
            return instance(original)
          }
        }
        return Promise.reject(error)
      }
    )

    return instance
  }
}

export default new AuthService()
