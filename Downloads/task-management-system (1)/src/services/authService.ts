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

  private setAuthMessage(message: string) {
    try {
      sessionStorage.setItem("auth_message", message)
    } catch (error) {
      console.error("❌ Erro ao salvar mensagem de autenticação:", error)
    }
  }

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
    console.log("🔄 Callback de navegação registrado")
  }

  // Inicializar apenas quando necessário
  initialize() {
    if (this.hasInitialized) {
      console.log("⚠️ AuthService já foi inicializado")
      return
    }

    console.log("🔐 Inicializando AuthService...")
    this.hasInitialized = true

    // Debug: Verificar estado atual do localStorage
    this.debugTokenState()

    // Apenas agendar refresh se tiver tokens válidos
    if (this.hasValidTokens()) {
      this.scheduleTokenRefresh()
      console.log("✅ AuthService inicializado com tokens válidos")
    } else {
      console.log("⚠️ AuthService inicializado sem tokens válidos")
    }
  }

  // Método para debug do estado dos tokens
  private debugTokenState() {
    const accessToken = localStorage.getItem("access_token")
    const refreshToken = localStorage.getItem("refresh_token")
    const userData = localStorage.getItem("user_data")

    console.log("🔍 Estado atual do localStorage:", {
      accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : null,
      refreshToken: refreshToken ? `${refreshToken.substring(0, 20)}...` : null,
      userData: userData ? "presente" : "ausente",
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      hasUserData: !!userData,
    })
  }

  // ✅ CORREÇÃO: Validar apenas tokens obrigatórios
  private hasValidTokens(): boolean {
    const accessToken = localStorage.getItem("access_token")
    const refreshToken = localStorage.getItem("refresh_token")
    // ✅ Removido verificação de userData - não é obrigatório

    const isValid = !!(accessToken && refreshToken)
    console.log("🔍 Verificação de tokens (apenas obrigatórios):", {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      isValid,
      note: "userData não é obrigatório para autenticação",
    })

    return isValid
  }

  // Salvar tokens após login
  setTokens(accessToken: string, refreshToken: string, user?: any) {
    console.log("💾 Salvando tokens no AuthService...")

    try {
      localStorage.setItem("access_token", accessToken)
      localStorage.setItem("refresh_token", refreshToken)

      // Verificar se foi salvo corretamente
      const savedAccess = localStorage.getItem("access_token")
      const savedRefresh = localStorage.getItem("refresh_token")

      console.log("✅ Verificação pós-salvamento:", {
        accessSaved: !!savedAccess,
        refreshSaved: !!savedRefresh,
        accessMatch: savedAccess === accessToken,
        refreshMatch: savedRefresh === refreshToken,
      })

      // ✅ Salvar dados do usuário apenas se fornecidos (opcional)
      if (user) {
        localStorage.setItem(
          "user_data",
          JSON.stringify({
            ...user,
            username: user.username || user.nome || "Usuário",
            email: user.email || "usuario@sistema.com",
          }),
        )
        console.log("👤 Dados do usuário salvos (opcional)")
      } else {
        console.log("⚠️ Dados do usuário não fornecidos - continuando sem userData")
      }

      // Limpar timer anterior
      this.clearRefreshTimer()

      // Configurar refresh automático
      this.scheduleTokenRefresh()

      console.log("✅ Tokens salvos no AuthService")
    } catch (error) {
      console.error("❌ Erro ao salvar tokens:", error)
      throw new Error("Erro ao salvar tokens no localStorage")
    }
  }

  getAccessToken(): string | null {
    try {
      const token = localStorage.getItem("access_token")
      console.log("🔑 Obtendo access token:", {
        found: !!token,
        length: token?.length || 0,
        preview: token ? `${token.substring(0, 20)}...` : "null",
      })
      return token
    } catch (error) {
      console.error("❌ Erro ao obter access token:", error)
      return null
    }
  }

  getRefreshToken(): string | null {
    try {
      const token = localStorage.getItem("refresh_token")
      console.log("🔄 Obtendo refresh token:", {
        found: !!token,
        length: token?.length || 0,
        preview: token ? `${token.substring(0, 20)}...` : "null",
      })
      return token
    } catch (error) {
      console.error("❌ Erro ao obter refresh token:", error)
      return null
    }
  }

  // ✅ CORREÇÃO: getUserData com fallback para não quebrar funcionalidades
  getUserData(): any | null {
    try {
      const userData = localStorage.getItem("user_data")
      const parsed = userData ? JSON.parse(userData) : null

      console.log("👤 Obtendo dados do usuário:", {
        found: !!parsed,
        hasUserData: !!userData,
      })

      // ✅ Se não há userData mas há tokens válidos, criar dados básicos
      if (!parsed && this.hasValidTokens()) {
        console.log("🔄 Criando userData básico pois tokens são válidos")
        const basicUserData = {
          id: 1,
          username: "Usuário",
          email: "usuario@sistema.com",
        }
        return basicUserData
      }

      if (!parsed) {
        return null
      }

      return {
        ...parsed,
        username: parsed.username || parsed.nome || "Usuário",
        email: parsed.email || "usuario@sistema.com",
      }
    } catch (error) {
      console.error("❌ Erro ao obter dados do usuário:", error)

      // ✅ Fallback: se há tokens válidos, retornar dados básicos
      if (this.hasValidTokens()) {
        console.log("🔄 Fallback: retornando userData básico")
        return {
          id: 1,
          username: "Usuário",
          email: "usuario@sistema.com",
        }
      }

      return null
    }
  }

  // ✅ CORREÇÃO: Autenticação baseada apenas em tokens
  isAuthenticated(): boolean {
    const authenticated = this.hasValidTokens()
    console.log("🔍 Verificando autenticação (baseada apenas em tokens):", authenticated)

    // Debug adicional se não autenticado
    if (!authenticated) {
      this.debugTokenState()
    }

    return authenticated
  }

  private clearRefreshTimer() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
      console.log("⏰ Timer de refresh limpo")
    }
  }

  private scheduleTokenRefresh() {
    // Limpar timer anterior
    this.clearRefreshTimer()

    // Não agendar se está fazendo logout
    if (this.isLoggingOut) {
      console.log("⚠️ Não agendando refresh - logout em andamento")
      return
    }

    // Agendar refresh para 25 minutos
    this.refreshTimer = setTimeout(
      () => {
        if (!this.isLoggingOut && this.hasValidTokens()) {
          console.log("⏰ Executando refresh automático...")
          this.refreshAccessToken().catch((error) => {
            console.error("❌ Erro no refresh automático:", error)
            this.logout("Sessão expirada")
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
      console.log("🔄 Refresh já em andamento, aguardando...")
      return this.refreshPromise
    }

    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      console.error("❌ Refresh token não encontrado")
      this.logout("Sessão expirada")
      throw new Error("Refresh token não encontrado")
    }

    console.log("🔄 Iniciando refresh do token...")
    this.isRefreshing = true
    this.refreshPromise = this.performTokenRefresh(refreshToken)

    try {
      const newAccessToken = await this.refreshPromise
      console.log("✅ Token renovado com sucesso")
      return newAccessToken
    } catch (error) {
      console.error("❌ Erro no refresh do token:", error)
      this.logout("Sessão expirada")
      throw error
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  private async performTokenRefresh(refreshToken: string): Promise<string> {
    try {
      console.log("📡 Fazendo requisição de refresh...")
      const response = await fetch("http://192.168.15.29:7000/api/token/refresh/", {
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
      console.log("💾 Novo access token salvo")

      // Agendar próximo refresh
      this.scheduleTokenRefresh()

      return data.access
    } catch (error) {
      console.error("❌ Erro na requisição de refresh:", error)
      throw error
    }
  }

  // Logout SEM redirecionamento automático
  logout(message?: string) {
    if (this.isLoggingOut) {
      console.log("⚠️ Logout já em andamento")
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
    if (message) {
      this.setAuthMessage(message)
    }

    if (this.navigationCallback) {
      console.log("🔄 Redirecionando para login via callback")
      this.navigationCallback("/login")
    }

    // Reset do flag após navegação
    setTimeout(() => {
      this.isLoggingOut = false
    }, 1000)
  }

  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    console.log("🌐 Iniciando authenticatedFetch para:", url)

    if (this.isLoggingOut) {
      console.error("❌ Tentativa de requisição durante logout")
      throw new Error("Logout em andamento")
    }

    // Debug do estado antes da requisição
    this.debugTokenState()

    let accessToken = this.getAccessToken()

    if (!accessToken) {
      console.error("❌ Token não encontrado para requisição autenticada")
      console.error("🔍 Estado do localStorage:", {
        keys: Object.keys(localStorage),
        accessToken: localStorage.getItem("access_token"),
        refreshToken: localStorage.getItem("refresh_token"),
      })

      // Tentar recuperar token uma vez antes de fazer logout
      const refreshToken = this.getRefreshToken()
      if (refreshToken) {
        console.log("🔄 Tentando recuperar com refresh token...")
        try {
          accessToken = await this.refreshAccessToken()
          console.log("✅ Token recuperado via refresh")
        } catch (error) {
          console.error("❌ Falha na recuperação do token:", error)
          this.logout("Sessão expirada")
          throw new Error("Token não encontrado e falha na recuperação")
        }
      } else {
        this.logout("Sessão expirada")
        throw new Error("Token não encontrado")
      }
    }

    // Preparar headers
    const headers: Record<string, string> = {
      ...Object.fromEntries(new Headers(options.headers).entries()),
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    }

    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json"
    }

    console.log("📡 Fazendo requisição autenticada:", {
      url,
      method: options.method || "GET",
      hasAuth: !!headers.Authorization,
      authPreview: headers.Authorization ? `${headers.Authorization.substring(0, 20)}...` : "none",
    })

    // Primeira tentativa
    let response = await fetch(url, {
      ...options,
      headers,
    })

    console.log("📡 Resposta recebida:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    })

    // Se token expirou, tentar renovar UMA VEZ
    if (response.status === 401 && !this.isRefreshing) {
      console.log("🔄 Token expirado (401), tentando renovar...")
      try {
        accessToken = await this.refreshAccessToken()

        // Repetir com novo token
        const newHeaders: Record<string, string> = {
          ...Object.fromEntries(new Headers(options.headers).entries()),
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        }

        if (!(options.body instanceof FormData)) {
          newHeaders["Content-Type"] = "application/json"
        }

        console.log("📡 Repetindo requisição com novo token...")
        response = await fetch(url, {
          ...options,
          headers: newHeaders,
        })

        console.log("📡 Segunda tentativa:", {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
        })

        if (response.status === 401) {
          console.error("❌ Ainda não autorizado após refresh")
          this.logout("Sessão expirada")
          throw new Error("Sessão expirada")
        }
      } catch (error) {
        console.error("❌ Erro no refresh durante requisição:", error)
        this.logout("Sessão expirada")
        throw error
      }
    }

    console.log("✅ Requisição autenticada concluída:", response.status)
    return response
  }

  // Método para validar token sem logout automático
  async validateToken(): Promise<boolean> {
    const accessToken = this.getAccessToken()
    if (!accessToken) {
      console.log("⚠️ Não há token para validar")
      return false
    }

    try {
      console.log("🔍 Validando token...")
      // Fazer uma requisição simples para validar o token
      const response = await fetch("http://192.168.15.29:7000/api/v1/tarefas/", {
        method: "HEAD", // Usar HEAD para não retornar dados
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      })

      const isValid = response.ok
      console.log("🔍 Token válido:", isValid)
      return isValid
    } catch (error) {
      console.log("⚠️ Erro na validação do token:", error)
      return false
    }
  }

  // Método para forçar re-inicialização se necessário
  forceReinitialize() {
    console.log("🔄 Forçando re-inicialização do AuthService...")
    this.hasInitialized = false
    this.initialize()
  }

  // ✅ NOVO: Método para verificar se funcionalidades devem estar habilitadas
  shouldEnableFeatures(): boolean {
    const hasValidTokens = this.hasValidTokens()
    console.log("🔍 Verificando se funcionalidades devem estar habilitadas:", {
      hasValidTokens,
      shouldEnable: hasValidTokens, // Baseado apenas em tokens
    })
    return hasValidTokens
  }
}

export const authService = AuthService.getInstance()
