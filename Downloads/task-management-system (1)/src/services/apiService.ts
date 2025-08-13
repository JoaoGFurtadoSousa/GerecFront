import { authService } from "./authService"

const API_BASE_URL = "http://192.168.15.14:8000/api/v1"

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
  diagnostico?: string
  solucao?: string
  substituicao_de_pecas?: string
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

// Interface para dados adicionais
export interface AdditionalDataForm {
  diagnostico: string
  solucao: string
  substituicao_de_pecas: string
  fotoTotemEntrada: File | null
  fotoTotemSaida: File | null
  latitude: number
  longitude: number
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

      if (errorData.errors) {
        errorMessage += ` - ${JSON.stringify(errorData.errors)}`
      }
    } catch (e) {
      console.log("⚠️ Não foi possível parsear erro JSON")
    }

    throw new Error(errorMessage)
  }
}

// Função para normalizar os dados da tarefa
const normalizeTask = (task: any): Task => {
  // Converter status numérico para string
  let statusString: "Para iniciar" | "Em andamento" | "Concluído" = "Para iniciar"
  if (typeof task.status === "string" && NUMBER_TO_STATUS[task.status as keyof typeof NUMBER_TO_STATUS]) {
    statusString = NUMBER_TO_STATUS[task.status as keyof typeof NUMBER_TO_STATUS]
  }

  return {
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
    diagnostico: task.diagnostico || "",
    solucao: task.solucao || "",
    substituicao_de_pecas: task.substituicao_de_pecas || "",
  }
}

class ApiService {
  async getTasks(): Promise<Task[]> {
    console.log("🌐 Buscando tarefas com GET...")

    try {
      const response = await authService.authenticatedFetch(`${API_BASE_URL}/tarefas/`, {
        method: "GET",
      })

      await handleFetchError(response)

      const data = await response.json()
      console.log("📦 Tarefas recebidas:", data.length)

      if (!Array.isArray(data)) {
        console.warn("⚠️ API não retornou um array")
        return []
      }

      return data.map(normalizeTask)
    } catch (error) {
      console.error("❌ Erro ao buscar tarefas:", error)
      throw error
    }
  }

  async getTaskById(id: number): Promise<Task> {
    console.log("🔍 Buscando tarefa:", id)

    const response = await authService.authenticatedFetch(`${API_BASE_URL}/tarefas/${id}/`, {
      method: "GET",
    })

    await handleFetchError(response)
    const data = await response.json()

    return normalizeTask(data)
  }

  async updateTaskStatus(id: number, status: "Para iniciar" | "Em andamento" | "Concluído"): Promise<Task> {
    const statusNumber = STATUS_TO_NUMBER[status]
    console.log("🔄 Atualizando status:", id, "para", statusNumber)

    const response = await authService.authenticatedFetch(`${API_BASE_URL}/tarefas/${id}/`, {
      method: "PATCH",
      body: JSON.stringify({ status: statusNumber }),
    })

    await handleFetchError(response)
    const data = await response.json()

    return normalizeTask(data)
  }

  // ✅ NOVO: Método para buscar equipamentos reais da unidade
  async getEquipmentByUnitId(unitId: number): Promise<Equipment[]> {
    console.log("🔍 Buscando equipamentos da unidade:", unitId)

    try {
      const response = await authService.authenticatedFetch(
        `${API_BASE_URL}/equipamentosDaUnidade/por-unidade/${unitId}/`, // ✅ ENDPOINT CORRETO
        {
          method: "GET",
        },
      )

      await handleFetchError(response)
      const data = await response.json()

      console.log("📦 Equipamentos da unidade recebidos:", {
        unitId,
        count: data.length,
        firstEquipment: data[0],
        lastEquipment: data[data.length - 1],
      })

      // Normalizar equipamentos
      const normalizedEquipment = data.map((item: any) => ({
        id: item.id,
        nome_do_equipamento: item.nome_do_equipamento,
        unidade: item.unidade,
        danificado_a_entrada: item.danificado_a_entrada || false,
        danificado_a_saida: item.danificado_a_saida || false,
      }))

      console.log("✅ Equipamentos normalizados:", normalizedEquipment.length, "itens")
      return normalizedEquipment
    } catch (error) {
      console.error("❌ Erro ao buscar equipamentos da unidade:", error)
      throw error
    }
  }

  async submitEquipmentChecklist(unitId: number, equipmentArray: EquipmentChecklistItem[]): Promise<void> {
    console.log("📤 Enviando checklist para unidade:", unitId)
    console.log(
      "📤 Equipamentos com IDs corretos:",
      equipmentArray.map((eq) => ({ id: eq.id, nome: eq.nome_do_equipamento })),
    )

    const url = `${API_BASE_URL}/equipamentosDaUnidade/atualizar-equipamentos-por-unidades/${unitId}/`

    const response = await authService.authenticatedFetch(url, {
      method: "PUT",
      body: JSON.stringify(equipmentArray),
    })

    await handleFetchError(response)
    console.log("✅ Checklist enviado com sucesso")
  }

  async updateTaskWithAdditionalData(taskId: number, data: AdditionalDataForm): Promise<Task> {
    console.log("📤 Atualizando tarefa com dados adicionais:", taskId)

    const formData = new FormData()

    // Adicionar campos de texto
    formData.append("diagnostico", data.diagnostico)
    formData.append("solucao", data.solucao)
    formData.append("substituicao_de_pecas", data.substituicao_de_pecas)
    formData.append("latitude", data.latitude.toString())
    formData.append("longitude", data.longitude.toString())

    // Adicionar arquivos se existirem
    if (data.fotoTotemEntrada) {
      formData.append("fotoTotemEntrada", data.fotoTotemEntrada)
    }

    if (data.fotoTotemSaida) {
      formData.append("fotoTotemSaida", data.fotoTotemSaida)
    }

    // Atualizar status para concluído
    formData.append("status", "3") // 3 = Concluído

    const response = await authService.authenticatedFetch(`${API_BASE_URL}/tarefas/${taskId}/`, {
      method: "PATCH",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    })

    await handleFetchError(response)
    const updatedTask = await response.json()

    return normalizeTask(updatedTask)
  }

  async saveData() {
    console.log("🌐 Salvando dados no backend...")

    const response = await authService.authenticatedFetch(`${API_BASE_URL}/salvar/`, {
      method: "POST",
    })

    await handleFetchError(response)
    console.log("✅ Dados salvos com sucesso")
  }
}

export const apiService = new ApiService()
