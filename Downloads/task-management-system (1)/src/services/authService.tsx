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
  private isLoggingOut = false
  private hasInitialized = false
  private navigationCallback: ((path: string) => void) | null = null

  private constructor() {
    // Construtor vazio - sem inicialização automática
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  // Registrar callback de navegação do React Router
  setNavigationCallback(callback: (path: string) => void) {
    this.navigationCallback = callback
  }

  // Inicializar apenas quando necessário
  initialize() {
    if (this.hasInitialized) {
      return
    }

    console.log("🔐 Inicializando AuthService...")
    this.hasInitialized = true

    // Apenas agendar refresh se tiver tokens válidos
    if (this.hasValidTokens()) {
      this.scheduleTokenRefresh()
      console.log("✅ AuthService inicializado com tokens válidos")
    }
  }

  private hasValidTokens(): boolean {
    const accessToken = localStorage.getItem("access_token")
    const refreshToken = localStorage.getItem("refresh_token")
    const userData = localStorage.getItem("user_data")
    return !!(accessToken && refreshToken && userData)
  }

  // Salvar tokens após login
  setTokens(accessToken: string, refreshToken: string, user?: any) {
    console.log("💾 Salvando tokens...")

    localStorage.setItem("access_token", accessToken)
    localStorage.setItem("refresh_token", refreshToken)

    if (user) {
      localStorage.setItem("user_data", JSON.stringify(user))
    }

    // Limpar timer anterior
    this.clearRefreshTimer()

    // Configurar refresh automático
    this.scheduleTokenRefresh()

    console.log("✅ Tokens salvos")
  }

  getAccessToken(): string | null {
    return localStorage.getItem("access_token")
  }

  getRefreshToken(): string | null {
    return localStorage.getItem("refresh_token")
  }

  getUserData(): any | null {
    const userData = localStorage.getItem("user_data")
    return userData ? JSON.parse(userData) : null
  }

  isAuthenticated(): boolean {
    return this.hasValidTokens()
  }

  private clearRefreshTimer() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  private scheduleTokenRefresh() {
    // Limpar timer anterior
    this.clearRefreshTimer()

    // Não agendar se está fazendo logout
    if (this.isLoggingOut) {
      return
    }

    // Agendar refresh para 25 minutos
    this.refreshTimer = setTimeout(
      () => {
        if (!this.isLoggingOut && this.hasValidTokens()) {
          console.log("⏰ Executando refresh automático...")
          this.refreshAccessToken().catch((error) => {
            console.error("❌ Erro no refresh automático:", error)
            this.logout()
          })
        }
      },
      25 * 60 * 1000,
    )

    console.log("⏰ Refresh agendado para 25 minutos")
  }

  async refreshAccessToken(): Promise<string> {
    // Se já está fazendo logout, não tentar refresh
    if (this.isLoggingOut) {
      throw new Error("Logout em andamento")
    }

    // Se já está fazendo refresh, retorna a promise existente
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      this.logout()
      throw new Error("Refresh token não encontrado")
    }

    this.isRefreshing = true
    this.refreshPromise = this.performTokenRefresh(refreshToken)

    try {
      const newAccessToken = await this.refreshPromise
      return newAccessToken
    } catch (error) {
      this.logout()
      throw error
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  private async performTokenRefresh(refreshToken: string): Promise<string> {
    try {
      const response = await fetch("http://192.168.0.103:8000/api/token/refresh/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      })

      if (!response.ok) {
        throw new Error(`Erro ao renovar token: ${response.status}`)
      }

      const data: RefreshResponse = await response.json()

      // Salvar novo token
      localStorage.setItem("access_token", data.access)

      // Agendar próximo refresh
      this.scheduleTokenRefresh()

      return data.access
    } catch (error) {
      throw error
    }
  }

  // Logout SEM redirecionamento automático
  logout() {
    if (this.isLoggingOut) {
      return
    }

    console.log("🚪 Executando logout...")
    this.isLoggingOut = true

    // Limpar timer
    this.clearRefreshTimer()

    // Limpar localStorage
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user_data")

    // Resetar estado
    this.isRefreshing = false
    this.refreshPromise = null
    this.hasInitialized = false

    console.log("🧹 Dados limpos")

    // Usar callback de navegação se disponível
    if (this.navigationCallback) {
      this.navigationCallback("/login")
    }

    // Reset do flag após navegação
    setTimeout(() => {
      this.isLoggingOut = false
    }, 1000)
  }

  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    if (this.isLoggingOut) {
      throw new Error("Logout em andamento")
    }

    let accessToken = this.getAccessToken()

    if (!accessToken) {
      this.logout()
      throw new Error("Token não encontrado")
    }

    // Preparar headers
    const headers: Record<string, string> = {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    }

    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json"
    }

    // Primeira tentativa
    let response = await fetch(url, {
      ...options,
      headers,
    })

    // Se token expirou, tentar renovar UMA VEZ
    if (response.status === 401 && !this.isRefreshing) {
      try {
        accessToken = await this.refreshAccessToken()

        // Repetir com novo token
        const newHeaders: Record<string, string> = {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        }

        if (!(options.body instanceof FormData)) {
          newHeaders["Content-Type"] = "application/json"
        }

        response = await fetch(url, {
          ...options,
          headers: newHeaders,
        })

        if (response.status === 401) {
          this.logout()
          throw new Error("Sessão expirada")
        }
      } catch (error) {
        this.logout()
        throw error
      }
    }

    return response
  }

  // Método para validar token sem logout automático
  async validateToken(): Promise<boolean> {
    const accessToken = this.getAccessToken()
    if (!accessToken) {
      return false
    }

    try {
      // Fazer uma requisição simples para validar o token
      const response = await fetch("http://192.168.0.103:8000/api/v1/tarefas/", {
        method: "HEAD", // Usar HEAD para não retornar dados
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      })

      return response.ok
    } catch (error) {
      console.log("⚠️ Erro na validação do token:", error)
      return false
    }
  }
}

export const authService = AuthService.getInstance()
