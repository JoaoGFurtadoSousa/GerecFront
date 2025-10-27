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
  dataTarefaFinalizada?: string
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
    dataTarefaFinalizada: task.dataTarefaFinalizada || "",
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

  async getHistorico(): Promise<Task[]> {
    console.log("🌐 Buscando histórico de tarefas finalizadas...")

    try {
      const response = await authService.authenticatedFetch(`${API_BASE_URL}/historico/`, {
        method: "GET",
      })

      await handleFetchError(response)

      const data = await response.json()
      console.log("📦 Histórico recebido:", {
        total: data.length,
        primeira_tarefa: data[0],
        ultima_tarefa: data[data.length - 1],
      })

      if (!Array.isArray(data)) {
        console.warn("⚠️ API não retornou um array")
        return []
      }

      // Normalizar as tarefas do histórico
      const normalizedHistory = data.map(normalizeTask)

      console.log("✅ Histórico normalizado:", {
        total: normalizedHistory.length,
        status_counts: {
          concluidas: normalizedHistory.filter((t) => t.status === "Concluído").length,
          outras: normalizedHistory.filter((t) => t.status !== "Concluído").length,
        },
      })

      return normalizedHistory
    } catch (error) {
      console.error("❌ Erro ao buscar histórico:", error)
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

    console.log("📦 Tarefa recebida do backend:", {
      id: data.id,
      unidade: data.unidade,
      unidade_id: data.unidade?.id,
      unidade_nome: data.unidade?.nome_da_unidade,
      diagnostico: data.diagnostico,
      solucao: data.solucao,
    })

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

  async getEquipmentByUnitId(unitId: number): Promise<Equipment[]> {
    console.log("🔍 Buscando equipamentos da unidade:", unitId)

    try {
      const response = await authService.authenticatedFetch(
        `${API_BASE_URL}/equipamentosDaUnidade/por-unidade/${unitId}/`,
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
    console.log("=".repeat(80))
    console.log("📤 INÍCIO DO ENVIO - updateTaskWithAdditionalData")
    console.log("=".repeat(80))

    // ✅ PASSO 1: Buscar a tarefa atual para preservar a unidade
    console.log("🔍 PASSO 1: Buscando tarefa atual para preservar unidade...")
    const currentTask = await this.getTaskById(taskId)
    console.log("📦 Tarefa atual recuperada:", {
      id: currentTask.id,
      unidade_id: currentTask.unidade.id,
      unidade_nome: currentTask.unidade.nome_da_unidade,
      status_atual: currentTask.status,
    })

    // ✅ PASSO 2: Validar e preparar os dados recebidos
    console.log("🔍 PASSO 2: Validando dados recebidos do formulário...")
    console.log("📋 Dados BRUTOS recebidos:", {
      diagnostico: data.diagnostico,
      diagnostico_type: typeof data.diagnostico,
      diagnostico_length: data.diagnostico?.length,
      diagnostico_empty: !data.diagnostico || data.diagnostico.trim() === "",
      solucao: data.solucao,
      solucao_type: typeof data.solucao,
      solucao_length: data.solucao?.length,
      substituicao_de_pecas: data.substituicao_de_pecas,
      latitude: data.latitude,
      longitude: data.longitude,
      fotoTotemEntrada: data.fotoTotemEntrada ? `File: ${data.fotoTotemEntrada.name}` : "null",
      fotoTotemSaida: data.fotoTotemSaida ? `File: ${data.fotoTotemSaida.name}` : "null",
    })

    // ✅ PASSO 3: Criar FormData com TODOS os campos
    console.log("📦 PASSO 3: Criando FormData...")
    const formData = new FormData()

    // ✅ Campos de texto - garantir que não sejam undefined
    const diagnostico = String(data.diagnostico || "").trim()
    const solucao = String(data.solucao || "").trim()
    const substituicao_de_pecas = String(data.substituicao_de_pecas || "").trim()

    console.log("📝 Valores após processamento:", {
      diagnostico_processed: diagnostico,
      diagnostico_length: diagnostico.length,
      diagnostico_is_empty: diagnostico === "",
      solucao_processed: solucao,
      solucao_length: solucao.length,
      substituicao_de_pecas_processed: substituicao_de_pecas,
    })

    // ✅ Adicionar TODOS os campos ao FormData (ORDEM IMPORTANTE)
    formData.append("diagnostico", diagnostico)
    formData.append("solucao", solucao)
    formData.append("substituicao_de_pecas", substituicao_de_pecas)
    formData.append("latitude", String(data.latitude))
    formData.append("longitude", String(data.longitude))
    formData.append("status", "3") // 3 = Concluído

    // ✅ CRÍTICO: NÃO enviar o campo 'unidade' - deixar o backend manter o valor atual
    console.log("⚠️ IMPORTANTE: Campo 'unidade' NÃO será enviado para preservar o valor atual")

    // ✅ Adicionar fotos se existirem
    if (data.fotoTotemEntrada) {
      formData.append("fotoTotemEntrada", data.fotoTotemEntrada, data.fotoTotemEntrada.name)
      console.log("📷 Foto de entrada adicionada:", {
        name: data.fotoTotemEntrada.name,
        size: data.fotoTotemEntrada.size,
        type: data.fotoTotemEntrada.type,
      })
    }

    if (data.fotoTotemSaida) {
      formData.append("fotoTotemSaida", data.fotoTotemSaida, data.fotoTotemSaida.name)
      console.log("📷 Foto de saída adicionada:", {
        name: data.fotoTotemSaida.name,
        size: data.fotoTotemSaida.size,
        type: data.fotoTotemSaida.type,
      })
    }

    // ✅ PASSO 4: Verificar conteúdo completo do FormData
    console.log("🔍 PASSO 4: Verificando FormData completo antes do envio...")
    const formDataEntries: Array<[string, any]> = []
    formData.forEach((value, key) => {
      if (value instanceof File) {
        formDataEntries.push([key, `File: ${value.name} (${value.size} bytes, ${value.type})`])
      } else {
        formDataEntries.push([key, value])
      }
    })

    console.log("📦 FormData COMPLETO que será enviado:")
    console.table(formDataEntries)

    // ✅ Verificação adicional de campos críticos
    console.log("🔍 Verificação de campos críticos:")
    console.log("  ✓ diagnostico presente:", formData.has("diagnostico"))
    console.log("  ✓ diagnostico valor:", formData.get("diagnostico"))
    console.log("  ✓ solucao presente:", formData.has("solucao"))
    console.log("  ✓ solucao valor:", formData.get("solucao"))
    console.log("  ✓ status presente:", formData.has("status"))
    console.log("  ✓ status valor:", formData.get("status"))
    console.log("  ✓ unidade presente (DEVE SER FALSE):", formData.has("unidade"))

    // ✅ PASSO 5: Enviar para o backend
    console.log("🚀 PASSO 5: Enviando requisição PATCH para o backend...")
    console.log(`URL: ${API_BASE_URL}/tarefas/${taskId}/`)

    try {
      const response = await authService.authenticatedFetch(`${API_BASE_URL}/tarefas/${taskId}/`, {
        method: "PATCH",
        body: formData,
        headers: {
          Accept: "application/json",
          // ✅ NÃO definir Content-Type - deixar o browser configurar automaticamente com boundary
        },
      })

      console.log("📡 Resposta recebida:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      })

      await handleFetchError(response)

      // ✅ PASSO 6: Processar resposta do backend
      const updatedTask = await response.json()
      console.log("📦 PASSO 6: Resposta do backend processada:")
      console.log({
        id: updatedTask.id,
        unidade_id: updatedTask.unidade?.id,
        unidade_nome: updatedTask.unidade?.nome_da_unidade,
        diagnostico_recebido: updatedTask.diagnostico,
        diagnostico_length: updatedTask.diagnostico?.length,
        diagnostico_is_empty: !updatedTask.diagnostico || updatedTask.diagnostico === "",
        solucao_recebido: updatedTask.solucao,
        solucao_length: updatedTask.solucao?.length,
        status_final: updatedTask.status,
        latitude: updatedTask.latitude,
        longitude: updatedTask.longitude,
      })

      // ✅ Verificar se a unidade foi preservada
      if (updatedTask.unidade?.id !== currentTask.unidade.id) {
        console.error("❌ ERRO CRÍTICO: Unidade foi alterada incorretamente!")
        console.error({
          unidade_original: currentTask.unidade,
          unidade_retornada: updatedTask.unidade,
        })
      } else {
        console.log("✅ Unidade preservada corretamente!")
      }

      // ✅ Verificar se o diagnóstico foi salvo
      if (!updatedTask.diagnostico || updatedTask.diagnostico.trim() === "") {
        console.error("❌ ERRO CRÍTICO: Campo diagnostico não foi salvo!")
        console.error({
          diagnostico_enviado: diagnostico,
          diagnostico_recebido: updatedTask.diagnostico,
        })
      } else {
        console.log("✅ Diagnóstico salvo corretamente!")
      }

      console.log("=".repeat(80))
      console.log("✅ FIM DO ENVIO - Tarefa atualizada com sucesso")
      console.log("=".repeat(80))

      return normalizeTask(updatedTask)
    } catch (error) {
      console.error("=".repeat(80))
      console.error("❌ ERRO NO ENVIO")
      console.error("=".repeat(80))
      console.error("Erro completo:", error)
      throw error
    }
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
