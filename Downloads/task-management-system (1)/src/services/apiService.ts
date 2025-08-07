import { authService } from "./authService"

const API_BASE_URL = "http://192.168.15.17:8000/api/v1"

export interface Task {
  id: number
  nomeDoTecnico: {
    nome: string
  }
  unidade: {
    id: number
    nome_da_unidade: string
  }
  descricao: string
  fotoTotemEntrada: string | null
  fotoTotemSaida: string | null
  latitude: number
  longitude: number
  numChamado: string
  dataTarefa: string
  status: string
}

export interface Equipment {
  id: number
  nome_do_equipamento: string
  unidade: number
  danificado_a_entrada: boolean
  danificado_a_saida: boolean
}

export interface TaskCompletionData {
  descricao_realizada: string
  data_inicio: string
  data_finalizacao: string
}

export interface EquipmentChecklistItem {
  id: number
  nome_do_equipamento: string
  unidade: number
  danificado_a_entrada: boolean
  danificado_a_saida: boolean
}

// Mapeamento de status: Frontend <-> Backend
const STATUS_TO_NUMBER = {
  "Para iniciar": "1",
  "Em andamento": "2",
  Concluído: "3",
} as const

const NUMBER_TO_STATUS = {
  "1": "Para iniciar",
  "2": "Em andamento",
  "3": "Concluído",
} as const

const handleFetchError = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = `Erro ${response.status}: ${response.statusText}`

    try {
      const errorData = await response.json()
      console.log("📋 Detalhes do erro:", errorData)
      errorMessage = errorData.message || errorData.detail || errorData.error || errorMessage

      // Se houver detalhes específicos do erro, incluir
      if (errorData.errors) {
        errorMessage += ` - ${JSON.stringify(errorData.errors)}`
      }
    } catch (e) {
      console.log("⚠️ Não foi possível parsear erro JSON")
    }

    // Se for erro 401, pode ser token expirado (será tratado pelo authService)
    if (response.status === 401) {
      console.log("🔒 Erro 401 - Token pode estar expirado")
    }

    throw new Error(errorMessage)
  }
}

const handleConnectionError = (error: any): Error => {
  console.error("❌ Erro de conexão:", error)
  return new Error("Erro de conexão com o servidor. Por favor, tente novamente mais tarde.")
}

// Função para normalizar os dados da tarefa
const normalizeTask = (task: any): Task => {
  console.log("🔄 Normalizando tarefa:", task)

  // Converter status numérico para string
  let statusString: "Para iniciar" | "Em andamento" | "Concluído" = "Para iniciar"
  if (typeof task.status === "string" && NUMBER_TO_STATUS[task.status as keyof typeof NUMBER_TO_STATUS]) {
    statusString = NUMBER_TO_STATUS[task.status as keyof typeof NUMBER_TO_STATUS]
  }

  const normalized = {
    id: task.id,
    nomeDoTecnico: task.nomeDoTecnico || { nome: "" },
    unidade: task.unidade || { id: 0, nome_da_unidade: "Sem unidade" },
    descricao: task.descricao || "Sem descrição disponível",
    fotoTotemEntrada: task.fotoTotemEntrada,
    fotoTotemSaida: task.fotoTotemSaida,
    latitude: task.latitude || 0,
    longitude: task.longitude || 0,
    numChamado: task.numChamado || "",
    dataTarefa: task.dataTarefa || "",
    status: statusString,
  }

  console.log("✅ Tarefa normalizada:", normalized)
  return normalized
}

class ApiService {
  async getTasks(): Promise<Task[]> {
    console.log("🌐 Iniciando requisição autenticada para:", `${API_BASE_URL}/tarefas/`)

    try {
      const response = await authService.authenticatedFetch(`${API_BASE_URL}/tarefas/`, {
        method: "GET",
        signal: AbortSignal.timeout(10000), // Timeout de 10 segundos
      })

      console.log("📡 Status da resposta:", response.status, response.statusText)

      await handleFetchError(response)

      const data = await response.json()
      console.log("📦 Dados brutos recebidos:", data)

      // Garantir que sempre retornamos um array
      if (!Array.isArray(data)) {
        console.warn("⚠️ API não retornou um array, convertendo...")
        return []
      }

      // Normalizar cada tarefa
      const normalizedTasks = data.map((task, index) => {
        console.log(`📋 Tarefa ${index + 1} dados brutos:`, task)
        const normalized = normalizeTask(task)
        console.log(`✅ Tarefa ${index + 1} normalizada:`, normalized)
        return normalized
      })

      console.log("✅ Todas as tarefas processadas:", normalizedTasks.length, "itens")
      return normalizedTasks
    } catch (error) {
      console.error("❌ Erro na requisição:", error)
      throw handleConnectionError(error)
    }
  }

  async getTaskById(id: number): Promise<Task> {
    console.log("🔍 Buscando tarefa por ID:", id)

    try {
      const response = await authService.authenticatedFetch(`${API_BASE_URL}/tarefas/${id}/`, {
        method: "GET",
        signal: AbortSignal.timeout(10000),
      })

      await handleFetchError(response)
      const data = await response.json()
      console.log("📦 Dados da tarefa recebidos:", data)

      return normalizeTask(data)
    } catch (error) {
      throw handleConnectionError(error)
    }
  }

  async updateTaskStatus(id: number, status: "Para iniciar" | "Em andamento" | "Concluído"): Promise<Task> {
    // Converter status string para número
    const statusNumber = STATUS_TO_NUMBER[status]
    console.log("🔄 Atualizando status da tarefa:", id, "de", status, "para número", statusNumber)

    try {
      const response = await authService.authenticatedFetch(`${API_BASE_URL}/tarefas/${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ status: statusNumber }),
        signal: AbortSignal.timeout(10000),
      })

      await handleFetchError(response)
      const data = await response.json()
      console.log("✅ Resposta da atualização:", data)

      return normalizeTask(data)
    } catch (error) {
      throw handleConnectionError(error)
    }
  }

  // Enviar checklist por unidade - FORMATO CORRETO
  async submitEquipmentChecklist(unitId: number, equipmentArray: EquipmentChecklistItem[]): Promise<void> {
    console.log("📤 Enviando checklist para unidade:", unitId)
    console.log("📤 Array de equipamentos:", equipmentArray.length, "itens")
    console.log("📤 Payload completo:", JSON.stringify(equipmentArray, null, 2))

    // Verificar se o usuário está autenticado
    const token = authService.getAccessToken()
    if (!token) {
      throw new Error("Token de acesso não encontrado. Faça login novamente.")
    }

    // Endpoint correto
    const url = `${API_BASE_URL}/equipamentosDaUnidade/atualizar-equipamentos-por-unidades/${unitId}/`
    console.log("🌐 URL de envio (PUT):", url)

    try {
      const response = await authService.authenticatedFetch(url, {
        method: "PUT",
        body: JSON.stringify(equipmentArray),
        signal: AbortSignal.timeout(15000), // Timeout maior para upload
      })

      console.log("📡 Status da resposta checklist:", response.status, response.statusText)

      // Log detalhado da resposta para debug
      if (!response.ok) {
        const responseText = await response.text()
        console.log("📋 Resposta completa do erro:", responseText)

        // Tratamento específico para erro 403
        if (response.status === 403) {
          console.error("❌ Erro 403 - Possíveis causas:")
          console.error("1. Usuário não tem permissão para esta unidade")
          console.error("2. Token expirado ou inválido")
          console.error("3. Endpoint requer permissões específicas")
          console.error("4. CORS ou configuração do servidor")

          // Tentar verificar se é problema de token
          const userData = authService.getUserData()
          console.log("👤 Dados do usuário:", userData)

          throw new Error("Acesso negado. Você não tem permissão para atualizar equipamentos desta unidade.")
        }
      }

      await handleFetchError(response)
      console.log("✅ Checklist enviado com sucesso via PUT para unidade", unitId)
    } catch (error) {
      console.error("❌ Erro detalhado no envio do checklist:", error)
      throw handleConnectionError(error)
    }
  }

  async completeTask(taskId: number, data: TaskCompletionData): Promise<void> {
    try {
      const response = await authService.authenticatedFetch(`${API_BASE_URL}/tarefas/${taskId}/concluir/`, {
        method: "POST",
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(10000),
      })

      await handleFetchError(response)
    } catch (error) {
      throw handleConnectionError(error)
    }
  }
}

export const apiService = new ApiService()
