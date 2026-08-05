import { authService } from "./authService"

const API_BASE_URL = "http://192.168.15.29:8000/api/v1"
const INVENTORY_API_BASE_URL = "http://192.168.15.29:8000/api/v1/inventario/"
const EQUIPMENT_EXITS_API_URL = "http://192.168.15.29:8000/api/v1/saidas-equipamentos/"

export interface Task {
  id: number
  nome?: string
  nomeDoTecnico: {
    nome: string
    username?: string
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

export interface Unit {
  id: number
  nome_da_unidade: string
  status: boolean
  id_garagem?: string
  cidade?: string
}

export interface AdditionalDataForm {
  diagnostico: string
  solucao: string
  substituicao_de_pecas: string
  fotoTotemEntrada: File | null
  fotoTotemSaida: File | null
  latitude: number
  longitude: number
}

export interface Technician {
  id: number
  nome: string
  username?: string
}

export interface InventoryItem {
  id: number
  nome_do_equipamento: string
  quantidade: number
}

export interface InventoryPayload {
  nome_do_equipamento: string
  quantidade: number
}

export interface InventoryQuantityPayload {
  quantidade: number
}

export interface InventoryRemovePayload {
  nome_do_equipamento: string
  unidade: number
  quantidade: number
}

export interface InventoryRemoveResponse {
  detail: string
  tecnico: string
  unidade: string
  quantidade_retirada: number
  quantidade_de_equipamentos_no_inventario: number
}

export interface EquipmentExitUser {
  id: number
  username: string
}

export interface EquipmentExitUnit {
  id: number
  nome_da_unidade: string
}

export interface EquipmentExitHistoryItem {
  id: number
  usuario: EquipmentExitUser
  data_saida: string
  unidade_envio: EquipmentExitUnit
}

export interface CurrentUser {
  email: string
  username: string
  grupo?: string
}

export interface QRCodePayload {
  id_garagem: string
  status: string
  quantidade: number
}

export interface RFIDPayload {
  ticket_cartao: string
  id_garagem: string
  adicao_cartao: "Unitario" | "Lista"
}

export interface PasswordResetPayload {
  user: number
  username_user_cloudaccess: string
  email_user_cloudaccess: string
  unidades: number[]
}

export interface PasswordResetUnitSuccess {
  unidade: number
  garagem: string
}

export interface PasswordResetUnitFailure extends PasswordResetUnitSuccess {
  erro: string
}

export interface PasswordResetResponse {
  detail: {
    unidades_ok: PasswordResetUnitSuccess[]
    unidades_fail: PasswordResetUnitFailure[]
  }
}

export interface CreateCloudAccessUserPayload {
  username: string
  first_name: string
  last_name: string
  email: string
  profile_type: number
  unidades: number[]
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type PasswordResetHistoryItem = Record<string, unknown> & { id?: number }

export interface TaskChecklistPdfResponse {
  blob: Blob
  fileName: string
}

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

const formatLocalDateTime = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const seconds = String(date.getSeconds()).padStart(2, "0")

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

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

const normalizeTask = (task: any): Task => {
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

const paginatedUrl = (url: string, page = 1) => {
  const separator = url.includes("?") ? "&" : "?"
  return `${url}${separator}page=${page}`
}

const readPaginatedResponse = <T>(data: unknown): PaginatedResponse<T> => {
  if (Array.isArray(data)) return { count: data.length, next: null, previous: null, results: data as T[] }
  const response = data as Partial<PaginatedResponse<T>>
  return {
    count: response.count ?? 0,
    next: response.next ?? null,
    previous: response.previous ?? null,
    results: Array.isArray(response.results) ? response.results : [],
  }
}

/**
 * Follows the API pagination links and returns a single collection.  This is
 * used by form controls, where hiding records from subsequent pages would
 * make them impossible to select.
 */
export const fetchAllPages = async <T>(fetchPage: (page: number) => Promise<PaginatedResponse<T>>): Promise<T[]> => {
  const records: T[] = []
  const visitedPages = new Set<number>()
  let page = 1

  while (!visitedPages.has(page)) {
    visitedPages.add(page)
    const response = await fetchPage(page)
    records.push(...response.results)

    if (!response.next) break

    const nextPage = Number(new URL(response.next, API_BASE_URL).searchParams.get("page"))
    if (!Number.isInteger(nextPage) || nextPage < 1) break
    page = nextPage
  }

  return records
}

class ApiService {
  private cachedCurrentTechnicianUsername: string | null = null
  async getTasks(): Promise<Task[]> {
    return fetchAllPages((page) => this.getTasksPage(page))
  }

  async getTasksPage(page = 1): Promise<PaginatedResponse<Task>> {
    console.log("🌐 Buscando tarefas com GET...")

    try {
      const response = await authService.authenticatedFetch(paginatedUrl(`${API_BASE_URL}/tarefas/`, page), {
        method: "GET",
      })

      await handleFetchError(response)

      const data = readPaginatedResponse<unknown>(await response.json())
      return { ...data, results: data.results.map(normalizeTask) }
    } catch (error) {
      console.error("❌ Erro ao buscar tarefas:", error)
      throw error
    }
  }

  async getHistorico(): Promise<Task[]> {
    return fetchAllPages((page) => this.getHistoricoPage(page))
  }

  async getHistoricoPage(page = 1): Promise<PaginatedResponse<Task>> {
    console.log("🌐 Buscando histórico de tarefas finalizadas...")

    try {
      const response = await authService.authenticatedFetch(paginatedUrl(`${API_BASE_URL}/historico/`, page), {
        method: "GET",
      })

      await handleFetchError(response)

      const data = readPaginatedResponse<unknown>(await response.json())
      console.log("📦 Histórico recebido:", {
        total: data.count,
        primeira_tarefa: data.results[0],
        ultima_tarefa: data.results[data.results.length - 1],
      })

      const normalizedHistory = data.results.map(normalizeTask)

      console.log("✅ Histórico normalizado:", {
        total: normalizedHistory.length,
        status_counts: {
          concluidas: normalizedHistory.filter((t) => t.status === "Concluído").length,
          outras: normalizedHistory.filter((t) => t.status !== "Concluído").length,
        },
      })

      return { ...data, results: normalizedHistory }
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

  async generateTaskChecklistPdf(taskId: number): Promise<TaskChecklistPdfResponse> {
    const response = await authService.authenticatedFetch(`${API_BASE_URL}/gerar-pdf/${taskId}`, {
      method: "GET",
      headers: {
        Accept: "application/pdf",
      },
    })

    if (!response.ok) {
      await handleFetchError(response)
    }

    const contentType = response.headers.get("content-type") || ""

    if (!contentType.toLowerCase().includes("application/pdf")) {
      throw new Error("Resposta inválida ao gerar checklist. O arquivo retornado não é um PDF.")
    }

    const contentDisposition = response.headers.get("content-disposition") || ""
    const fileNameMatch = contentDisposition.match(/filename\*?=(?:UTF-8''|")?([^\";]+)/i)
    const fileName = fileNameMatch?.[1] ? decodeURIComponent(fileNameMatch[1].replace(/"/g, "").trim()) : `checklist-tarefa-${taskId}.pdf`

    return {
      blob: await response.blob(),
      fileName,
    }
  }

  async getInventoryItems(): Promise<InventoryItem[]> {
    return fetchAllPages((page) => this.getInventoryItemsPage(page))
  }

  async getInventoryItemsPage(page = 1): Promise<PaginatedResponse<InventoryItem>> {
    const response = await authService.authenticatedFetch(paginatedUrl(INVENTORY_API_BASE_URL, page), {
      method: "GET",
    })

    await handleFetchError(response)
    return readPaginatedResponse<InventoryItem>(await response.json())
  }

  async createInventoryItem(payload: InventoryPayload): Promise<InventoryItem> {
    const response = await authService.authenticatedFetch(INVENTORY_API_BASE_URL, {
      method: "POST",
      body: JSON.stringify(payload),
    })

    await handleFetchError(response)
    return response.json()
  }

  async updateInventoryItem(itemId: number, payload: InventoryPayload): Promise<InventoryItem> {
    const response = await authService.authenticatedFetch(`${INVENTORY_API_BASE_URL}${itemId}/`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })

    await handleFetchError(response)
    return response.json()
  }

  async deleteInventoryItem(itemId: number): Promise<void> {
    const response = await authService.authenticatedFetch(`${INVENTORY_API_BASE_URL}${itemId}/`, {
      method: "DELETE",
    })

    await handleFetchError(response)
  }

  async addInventoryStock(itemId: number, payload: InventoryQuantityPayload): Promise<InventoryItem> {
    const response = await authService.authenticatedFetch(`${INVENTORY_API_BASE_URL}add_equipamento/${itemId}/`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })

    await handleFetchError(response)
    return response.json()
  }

  async removeInventoryStock(itemId: number, payload: InventoryRemovePayload): Promise<InventoryRemoveResponse> {
    const response = await authService.authenticatedFetch(`${INVENTORY_API_BASE_URL}remove_equipamento/${itemId}/`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })

    await handleFetchError(response)
    return response.json()
  }

  async getEquipmentExitHistory(): Promise<EquipmentExitHistoryItem[]> {
    return fetchAllPages((page) => this.getEquipmentExitHistoryPage(page))
  }

  async getEquipmentExitHistoryPage(page = 1): Promise<PaginatedResponse<EquipmentExitHistoryItem>> {
    const response = await authService.authenticatedFetch(paginatedUrl(EQUIPMENT_EXITS_API_URL, page), {
      method: "GET",
    })

    await handleFetchError(response)
    return readPaginatedResponse<EquipmentExitHistoryItem>(await response.json())
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

    const currentTask = await this.getTaskById(taskId)
    console.log("📦 Tarefa atual recuperada:", {
      id: currentTask.id,
      unidade_id: currentTask.unidade.id,
      unidade_nome: currentTask.unidade.nome_da_unidade,
      status_atual: currentTask.status,
    })

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

    console.log("📦 PASSO 3: Criando FormData...")
    const formData = new FormData()
    const dataTarefaSaidaTecnico = formatLocalDateTime(new Date())

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
      dataTarefaSaidaTecnico,
    })

    formData.append("diagnostico", diagnostico)
    formData.append("solucao", solucao)
    formData.append("substituicao_de_pecas", substituicao_de_pecas)
    formData.append("latitude", String(data.latitude))
    formData.append("longitude", String(data.longitude))
    formData.append("status", "2")
    formData.append("dataTarefaSaidaTecnico", dataTarefaSaidaTecnico)

    console.log("⚠️ IMPORTANTE: Campo 'unidade' NÃO será enviado para preservar o valor atual")

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

    console.log("🔍 Verificação de campos críticos:")
    console.log("  ✓ diagnostico presente:", formData.has("diagnostico"))
    console.log("  ✓ diagnostico valor:", formData.get("diagnostico"))
    console.log("  ✓ solucao presente:", formData.has("solucao"))
    console.log("  ✓ solucao valor:", formData.get("solucao"))
    console.log("  ✓ status presente:", formData.has("status"))
    console.log("  ✓ status valor:", formData.get("status"))
    console.log("  ✓ unidade presente (DEVE SER FALSE):", formData.has("unidade"))

    console.log("🚀 PASSO 5: Enviando requisição PATCH para o backend...")
    console.log(`URL: ${API_BASE_URL}/tarefas/${taskId}/`)

    try {
      const response = await authService.authenticatedFetch(`${API_BASE_URL}/tarefas/${taskId}/`, {
        method: "PATCH",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      })

      console.log("📡 Resposta recebida:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      })

      await handleFetchError(response)

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

      if (updatedTask.unidade?.id !== currentTask.unidade.id) {
        console.error("❌ ERRO CRÍTICO: Unidade foi alterada incorretamente!")
        console.error({
          unidade_original: currentTask.unidade,
          unidade_retornada: updatedTask.unidade,
        })
      } else {
        console.log("✅ Unidade preservada corretamente!")
      }

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

  async getUnits(): Promise<Unit[]> {
    return fetchAllPages((page) => this.getUnitsPage(page))
  }

  async getUnitsPage(page = 1): Promise<PaginatedResponse<Unit>> {
    console.log("🌐 Buscando unidades...")

    try {
      const response = await authService.authenticatedFetch(paginatedUrl(`${API_BASE_URL}/unidades/`, page), {
        method: "GET",
      })

      await handleFetchError(response)

      return readPaginatedResponse<Unit>(await response.json())
    } catch (error) {
      console.error("❌ Erro ao buscar unidades:", error)
      throw error
    }
  }

  async getQRCodeUnits(): Promise<Unit[]> {
    return this.getUnits()
  }

  async createQRCodes(payload: QRCodePayload): Promise<any> {
    console.log("📤 Enviando solicitação de criação de QRCode:", payload)

    const response = await authService.authenticatedFetch(`${API_BASE_URL}/qrcode/criar_qrcode/`, {
      method: "POST",
      body: JSON.stringify(payload),
    })

    await handleFetchError(response)
    return response.json()
  }

  async createRFID(payload: RFIDPayload): Promise<any> {
    console.log("📤 Enviando solicitação de RFID:", payload)

    const response = await authService.authenticatedFetch(`${API_BASE_URL}/rfid/`, {
      method: "POST",
      body: JSON.stringify(payload),
    })

    await handleFetchError(response)
    return response.json()
  }

  async requestCloudAccessPasswordReset(payload: PasswordResetPayload): Promise<PasswordResetResponse> {
    const response = await authService.authenticatedFetch(`${API_BASE_URL}/reset-password/`, {
      method: "POST",
      body: JSON.stringify(payload),
    })

    await handleFetchError(response)
    return response.json()
  }

  async getPasswordResetHistoryPage(page = 1): Promise<PaginatedResponse<PasswordResetHistoryItem>> {
    const response = await authService.authenticatedFetch(paginatedUrl(`${API_BASE_URL}/reset-password/`, page), {
      method: "GET",
    })
    await handleFetchError(response)
    return readPaginatedResponse<PasswordResetHistoryItem>(await response.json())
  }

  async createCloudAccessUser(payload: CreateCloudAccessUserPayload): Promise<PasswordResetResponse> {
    const response = await authService.authenticatedFetch(`${API_BASE_URL}/create-new-user/`, {
      method: "POST",
      body: JSON.stringify(payload),
    })

    await handleFetchError(response)
    return response.json()
  }

  async getTechnicians(): Promise<Technician[]> {
    return fetchAllPages((page) => this.getTechniciansPage(page))
  }

  async getTechniciansPage(page = 1): Promise<PaginatedResponse<Technician>> {
    console.log("🌐 Buscando técnicos...")

    try {
      const response = await authService.authenticatedFetch(paginatedUrl(`${API_BASE_URL}/users/nometecnicos/`, page), {
        method: "GET",
      })

      await handleFetchError(response)

      return readPaginatedResponse<Technician>(await response.json())
    } catch (error) {
      console.error("❌ Erro ao buscar técnicos:", error)
      throw error
    }
  }

  async submitNovaTask(taskData: {
    nomeDoTecnico: number
    unidade: number
    descricao: string
    numChamado: string
    dataTarefa?: string
    status: string
  }): Promise<void> {
    console.log("📤 Enviando nova tarefa para: http://192.168.15.29:8000/api/v1/tarefas/")
    console.log("📋 Dados enviados:", taskData)

    const response = await authService.authenticatedFetch("http://192.168.15.29:8000/api/v1/tarefas/", {
      method: "POST",
      body: JSON.stringify(taskData),
    })

    await handleFetchError(response)
    console.log("✅ Nova tarefa enviada com sucesso")
  }

  async getCurrentTechnicianUsername(userId?: number, fallbackUsername = ""): Promise<string> {
    if (this.cachedCurrentTechnicianUsername) return this.cachedCurrentTechnicianUsername
    const technicians = await this.getTechnicians()
    const currentTechnician = technicians.find((technician) => technician.id === userId || technician.username === fallbackUsername)
    this.cachedCurrentTechnicianUsername = currentTechnician?.username || currentTechnician?.nome || fallbackUsername
    return this.cachedCurrentTechnicianUsername
  }

  async completeTask(taskId: number, data: TaskCompletionData): Promise<void> {
    const response = await authService.authenticatedFetch(`${API_BASE_URL}/tarefas/${taskId}/concluir/`, {
      method: "POST",
      body: JSON.stringify(data),
    })

    await handleFetchError(response)
  }

  async getCurrentUser(): Promise<CurrentUser> {
    console.log("🌐 Buscando dados do usuário atual...")

    try {
      const response = await authService.authenticatedFetch("http://192.168.15.29:8000/api/v1/unique-user", {
        method: "GET",
      })

      await handleFetchError(response)

      const data = await response.json()
      console.log("📦 Dados do usuário recebidos:", {
        email: data.email,
        username: data.username,
      })

      return {
        email: data.email || "",
        username: data.username || "",
      }
    } catch (error) {
      console.error("❌ Erro ao buscar dados do usuário:", error)
      throw error
    }
  }
}

export const apiService = new ApiService()
