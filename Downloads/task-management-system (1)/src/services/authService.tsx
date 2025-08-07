interface LoginResponse {
  access: string
  refresh: string
  user?: {
    id: number
    nome: string
    email: string
  }
}

interface RefreshResponse {
  access: string
}

class AuthService {
  private static instance: AuthService
  private refreshTimer: NodeJS.Timeout | null = null
  private isRefreshing = false
  private refreshPromise: Promise<string> | null = null

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  // Salvar tokens após login
  setTokens(accessToken: string, refreshToken: string, user?: any) {
    localStorage.setItem("access_token", accessToken)
    localStorage.setItem("refresh_token", refreshToken)

    if (user) {
      localStorage.setItem("user_data", JSON.stringify(user))
    }

    // Configurar refresh automático (25 minutos = 1500000ms)
    this.scheduleTokenRefresh()

    console.log("✅ Tokens salvos e refresh agendado")
  }

  // Obter token de acesso
  getAccessToken(): string | null {
    return localStorage.getItem("access_token")
  }

  // Obter token de refresh
  getRefreshToken(): string | null {
    return localStorage.getItem("refresh_token")
  }

  // Obter dados do usuário
  getUserData(): any | null {
    const userData = localStorage.getItem("user_data")
    return userData ? JSON.parse(userData) : null
  }

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    const accessToken = this.getAccessToken()
    const refreshToken = this.getRefreshToken()
    return !!(accessToken && refreshToken)
  }

  // Agendar refresh automático do token
  private scheduleTokenRefresh() {
    // Limpar timer anterior se existir
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
    }

    // Agendar refresh para 25 minutos (5 minutos antes de expirar)
    this.refreshTimer = setTimeout(
      () => {
        this.refreshAccessToken()
      },
      25 * 60 * 1000,
    ) // 25 minutos

    console.log("⏰ Refresh do token agendado para 25 minutos")
  }

  // Renovar token de acesso
  async refreshAccessToken(): Promise<string> {
    // Se já está fazendo refresh, retorna a promise existente
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error("Refresh token não encontrado")
    }

    this.isRefreshing = true
    this.refreshPromise = this.performTokenRefresh(refreshToken)

    try {
      const newAccessToken = await this.refreshPromise
      return newAccessToken
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  private async performTokenRefresh(refreshToken: string): Promise<string> {
    console.log("🔄 Renovando token de acesso...")

    try {
      const response = await fetch("http://192.168.15.17:8000/api/token/refresh/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      })

      if (!response.ok) {
        console.error("❌ Erro ao renovar token:", response.status)

        if (response.status === 401) {
          // Refresh token expirado, fazer logout
          this.logout()
          throw new Error("Sessão expirada. Faça login novamente.")
        }

        throw new Error("Erro ao renovar token")
      }

      const data: RefreshResponse = await response.json()
      console.log("✅ Token renovado com sucesso")

      // Salvar novo token de acesso
      localStorage.setItem("access_token", data.access)

      // Agendar próximo refresh
      this.scheduleTokenRefresh()

      return data.access
    } catch (error) {
      console.error("❌ Erro no refresh do token:", error)
      throw error
    }
  }

  // Fazer logout
  logout() {
    console.log("🚪 Fazendo logout...")

    // Limpar timer de refresh
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }

    // Limpar localStorage
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user_data")

    // Redirecionar para login
    window.location.href = "/login"
  }

  // Fazer requisição autenticada
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    let accessToken = this.getAccessToken()

    if (!accessToken) {
      throw new Error("Token de acesso não encontrado")
    }

    // Primeira tentativa com token atual
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    // Se token expirou, tentar renovar
    if (response.status === 401) {
      console.log("🔄 Token expirado, tentando renovar...")

      try {
        accessToken = await this.refreshAccessToken()

        // Repetir requisição com novo token
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })
      } catch (error) {
        console.error("❌ Erro ao renovar token:", error)
        this.logout()
        throw error
      }
    }

    return response
  }
}

export const authService = AuthService.getInstance()
