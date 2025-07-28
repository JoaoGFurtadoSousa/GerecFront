const API_BASE_URL = "http://192.168.15.25:8000/api/v1"

export interface Task {
  id: number
  nome: string
  status: "Para iniciar" | "Em andamento" | "Concluído"
  unidade: string
  descricao: string
  data_criacao?: string
  created_at?: string
  data_inicio?: string
  data_fim?: string
}

export interface Equipment {
  id: number
  nome_do_equipamento: string
  danificado_a_entrada: boolean
  danificado_a_saida: boolean
}

export interface TaskCompletionData {
  descricao_realizada: string
  data_inicio: string
  data_finalizacao: string
}

// Mapeamento de status: Frontend <-> Backend
const STATUS_TO_NUMBER = {
  "Para iniciar": 1,
  "Em andamento": 2,
  Concluído: 3,
} as const

const NUMBER_TO_STATUS = {
  1: "Para iniciar",
  2: "Em andamento",
  3: "Concluído",
} as const

const handleFetchError = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = `Erro ${response.status}: ${response.statusText}`

    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorData.detail || errorMessage
    } catch (e) {
      // Se não conseguir parsear o JSON, usa a mensagem padrão
    }

    throw new Error(errorMessage)
  }
}

// Função para normalizar os dados da tarefa
const normalizeTask = (task: any): Task => {
  console.log("🔄 Normalizando tarefa:", task)

  // Extrair nome da unidade
  let unidadeNome = "Sem unidade"
  if (task.unidade) {
    if (typeof task.unidade === "string") {
      unidadeNome = task.unidade
    } else if (typeof task.unidade === "object" && task.unidade.nome_da_unidade) {
      unidadeNome = task.unidade.nome_da_unidade
    } else if (typeof task.unidade === "object" && task.unidade.nome) {
      unidadeNome = task.unidade.nome
    }
  }

  // Converter status numérico para string
  let statusString: Task["status"] = "Para iniciar"
  if (typeof task.status === "number" && NUMBER_TO_STATUS[task.status as keyof typeof NUMBER_TO_STATUS]) {
    statusString = NUMBER_TO_STATUS[task.status as keyof typeof NUMBER_TO_STATUS]
  } else if (typeof task.status === "string") {
    statusString = task.status as Task["status"]
  }

  const normalized = {
    id: task.id,
    nome: task.nome || unidadeNome || "Sem nome",
    status: statusString,
    unidade: unidadeNome,
    descricao: task.descricao || "Sem descrição disponível",
    data_criacao: task.data_criacao || task.created_at || task.data_inicio,
    created_at: task.created_at,
    data_inicio: task.data_inicio,
    data_fim: task.data_fim,
  }

  console.log("✅ Tarefa normalizada:", normalized)
  return normalized
}

class ApiService {
  async getTasks(): Promise<Task[]> {
    console.log("🌐 Iniciando requisição para:", `${API_BASE_URL}/tarefas/`)

    try {
      const response = await fetch(`${API_BASE_URL}/tarefas/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
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
      throw error
    }
  }

  async getTaskById(id: number): Promise<Task> {
    console.log("🔍 Buscando tarefa por ID:", id)

    const response = await fetch(`${API_BASE_URL}/tarefas/${id}/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      mode: "cors",
    })

    await handleFetchError(response)
    const data = await response.json()
    console.log("📦 Dados da tarefa recebidos:", data)

    return normalizeTask(data)
  }

  async updateTaskStatus(id: number, status: Task["status"]): Promise<Task> {
    // Converter status string para número
    const statusNumber = STATUS_TO_NUMBER[status]
    console.log("🔄 Atualizando status da tarefa:", id, "de", status, "para número", statusNumber)

    const response = await fetch(`${API_BASE_URL}/tarefas/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      mode: "cors",
      body: JSON.stringify({ status: statusNumber }), // Enviar como número
    })

    await handleFetchError(response)
    const data = await response.json()
    console.log("✅ Resposta da atualização:", data)

    return normalizeTask(data)
  }

  async getEquipmentByTaskId(taskId: number): Promise<Equipment[]> {
    const response = await fetch(`${API_BASE_URL}/tarefas/${taskId}/equipamentos/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      mode: "cors",
    })

    await handleFetchError(response)
    return await response.json()
  }

  async submitEquipmentChecklist(taskId: number, equipment: Equipment[]): Promise<void> {
    const payload = equipment.map((item) => ({
      id: item.id,
      danificado_a_saida: item.danificado_a_saida,
    }))

    const response = await fetch(`${API_BASE_URL}/tarefas/${taskId}/checklist/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      mode: "cors",
      body: JSON.stringify({ equipamentos: payload }),
    })

    await handleFetchError(response)
  }

  async completeTask(taskId: number, data: TaskCompletionData): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tarefas/${taskId}/concluir/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      mode: "cors",
      body: JSON.stringify(data),
    })

    await handleFetchError(response)
  }
}

export const apiService = new ApiService()
