"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Grid,
} from "@mui/material"
import { Add, Close } from "@mui/icons-material"
import { authService } from "../services/authService"

interface NewTaskModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface Usuario {
  id: number
  nome: string
  email: string
}

interface Unidade {
  id: number
  nome_da_unidade: string
}

interface TaskFormData {
  nomeDoTecnico: string
  unidade: string
  descricao: string
  numChamado: string
  status: string
}

const STATUS_OPTIONS = [
  { value: "1", label: "Para iniciar" },
  { value: "2", label: "Em andamento" },
  { value: "3", label: "Concluído" },
]

export default function NewTaskModal({ open, onClose, onSuccess }: NewTaskModalProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    nomeDoTecnico: "",
    unidade: "",
    descricao: "",
    numChamado: "",
    status: "1", // Default para "Para iniciar"
  })

  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<TaskFormData>>({})

  // Carregar usuários e unidades quando o modal abrir
  useEffect(() => {
    if (open) {
      loadInitialData()
    }
  }, [open])

  const loadInitialData = async () => {
    setLoadingData(true)
    setError(null)

    try {
      // Carregar usuários
      const usuariosResponse = await authService.authenticatedFetch("http://192.168.15.26:8000/api/v1/usuarios/", {
        method: "GET",
        signal: AbortSignal.timeout(10000),
      })

      if (!usuariosResponse.ok) {
        throw new Error(`Erro ao carregar usuários: ${usuariosResponse.status}`)
      }

      const usuariosData = await usuariosResponse.json()
      console.log("✅ Usuários carregados:", usuariosData)
      setUsuarios(Array.isArray(usuariosData) ? usuariosData : [])

      // Carregar unidades
      const unidadesResponse = await authService.authenticatedFetch("http://192.168.15.26:8000/api/v1/unidades/", {
        method: "GET",
        signal: AbortSignal.timeout(10000),
      })

      if (!unidadesResponse.ok) {
        throw new Error(`Erro ao carregar unidades: ${unidadesResponse.status}`)
      }

      const unidadesData = await unidadesResponse.json()
      console.log("✅ Unidades carregadas:", unidadesData)
      setUnidades(Array.isArray(unidadesData) ? unidadesData : [])
    } catch (err) {
      console.error("❌ Erro ao carregar dados:", err)
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar dados"
      setError(errorMessage)
    } finally {
      setLoadingData(false)
    }
  }

  const handleInputChange = (field: keyof TaskFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Limpar erro do campo quando o usuário começar a digitar
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }

    if (error) setError(null)
  }

  const validateForm = (): boolean => {
    const errors: Partial<TaskFormData> = {}

    if (!formData.nomeDoTecnico.trim()) {
      errors.nomeDoTecnico = "Técnico é obrigatório"
    }

    if (!formData.unidade.trim()) {
      errors.unidade = "Unidade é obrigatória"
    }

    if (!formData.descricao.trim()) {
      errors.descricao = "Descrição é obrigatória"
    } else if (formData.descricao.length > 1000) {
      errors.descricao = "Descrição deve ter no máximo 1000 caracteres"
    }

    if (!formData.numChamado.trim()) {
      errors.numChamado = "Número do chamado é obrigatório"
    } else if (formData.numChamado.length > 20) {
      errors.numChamado = "Número do chamado deve ter no máximo 20 caracteres"
    }

    if (!formData.status.trim()) {
      errors.status = "Status é obrigatório"
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const parseFieldErrors = (errorData: any): string => {
    const errorMessages: string[] = []

    console.log("🔍 Analisando erros detalhados:", errorData)

    // Tratar erros específicos dos campos relacionados
    if (errorData.nomeDoTecnico) {
      if (errorData.nomeDoTecnico.non_field_errors) {
        errorMessages.push(`Técnico: ${errorData.nomeDoTecnico.non_field_errors.join(", ")}`)
      } else if (Array.isArray(errorData.nomeDoTecnico)) {
        errorMessages.push(`Técnico: ${errorData.nomeDoTecnico.join(", ")}`)
      }
    }

    if (errorData.unidade) {
      if (errorData.unidade.non_field_errors) {
        errorMessages.push(`Unidade: ${errorData.unidade.non_field_errors.join(", ")}`)
      } else if (Array.isArray(errorData.unidade)) {
        errorMessages.push(`Unidade: ${errorData.unidade.join(", ")}`)
      }
    }

    if (errorData.descricao) {
      if (Array.isArray(errorData.descricao)) {
        errorMessages.push(`Descrição: ${errorData.descricao.join(", ")}`)
      }
    }

    if (errorData.numChamado) {
      if (Array.isArray(errorData.numChamado)) {
        errorMessages.push(`Número do Chamado: ${errorData.numChamado.join(", ")}`)
      }
    }

    if (errorData.status) {
      if (Array.isArray(errorData.status)) {
        errorMessages.push(`Status: ${errorData.status.join(", ")}`)
      }
    }

    if (errorData.dataTarefa) {
      if (Array.isArray(errorData.dataTarefa)) {
        errorMessages.push(`Data da Tarefa: ${errorData.dataTarefa.join(", ")}`)
      }
    }

    return errorMessages.length > 0 ? errorMessages.join(" | ") : "Erro de validação nos campos"
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      setError("Por favor, corrija os erros nos campos")
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("📤 Enviando nova tarefa:", formData)

      // Verificar se os IDs são válidos
      const tecnicoId = Number.parseInt(formData.nomeDoTecnico)
      const unidadeId = Number.parseInt(formData.unidade)

      if (isNaN(tecnicoId) || isNaN(unidadeId)) {
        throw new Error("IDs de técnico ou unidade inválidos")
      }

      // Buscar os objetos completos
      const tecnicoSelecionado = usuarios.find((u) => u.id === tecnicoId)
      const unidadeSelecionada = unidades.find((u) => u.id === unidadeId)

      if (!tecnicoSelecionado || !unidadeSelecionada) {
        throw new Error("Técnico ou unidade não encontrados")
      }

      console.log("👤 Técnico selecionado:", tecnicoSelecionado)
      console.log("🏢 Unidade selecionada:", unidadeSelecionada)

      // Tentar diferentes formatos de payload
      const payloadFormats = [
        // Formato 1: Objetos completos
        {
          nomeDoTecnico: tecnicoSelecionado,
          unidade: unidadeSelecionada,
          descricao: formData.descricao.trim(),
          numChamado: formData.numChamado.trim(),
          dataTarefa: new Date().toISOString(),
          status: formData.status,
        },
        // Formato 2: Apenas IDs
        {
          nomeDoTecnico: tecnicoId,
          unidade: unidadeId,
          descricao: formData.descricao.trim(),
          numChamado: formData.numChamado.trim(),
          dataTarefa: new Date().toISOString(),
          status: formData.status,
        },
        // Formato 3: IDs como strings
        {
          nomeDoTecnico: tecnicoId.toString(),
          unidade: unidadeId.toString(),
          descricao: formData.descricao.trim(),
          numChamado: formData.numChamado.trim(),
          dataTarefa: new Date().toISOString(),
          status: formData.status,
        },
        // Formato 4: Campos aninhados
        {
          nomeDoTecnico: { id: tecnicoId, nome: tecnicoSelecionado.nome },
          unidade: { id: unidadeId, nome_da_unidade: unidadeSelecionada.nome_da_unidade },
          descricao: formData.descricao.trim(),
          numChamado: formData.numChamado.trim(),
          dataTarefa: new Date().toISOString(),
          status: formData.status,
        },
      ]

      let success = false
      let lastError = null

      // Tentar cada formato até um funcionar
      for (let i = 0; i < payloadFormats.length; i++) {
        const payload = payloadFormats[i]
        console.log(`📤 Tentativa ${i + 1} - Payload:`, JSON.stringify(payload, null, 2))

        try {
          const response = await authService.authenticatedFetch("http://192.168.15.26:8000/api/v1/tarefas/", {
            method: "POST",
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(15000),
          })

          console.log(`📡 Tentativa ${i + 1} - Status:`, response.status)

          if (response.ok) {
            const data = await response.json()
            console.log(`✅ Tentativa ${i + 1} - Sucesso:`, data)
            success = true
            break
          } else {
            const errorData = await response.json()
            console.log(`❌ Tentativa ${i + 1} - Erro:`, errorData)
            lastError = errorData
          }
        } catch (err) {
          console.log(`❌ Tentativa ${i + 1} - Exceção:`, err)
          lastError = err
        }
      }

      if (!success) {
        // Se nenhum formato funcionou, mostrar o último erro
        let errorMessage = "Erro ao criar tarefa"

        if (lastError && typeof lastError === "object") {
          errorMessage = parseFieldErrors(lastError)
        } else if (lastError instanceof Error) {
          errorMessage = lastError.message
        }

        throw new Error(errorMessage)
      }

      // Resetar formulário
      setFormData({
        nomeDoTecnico: "",
        unidade: "",
        descricao: "",
        numChamado: "",
        status: "1",
      })

      // Chamar callback de sucesso
      onSuccess()
    } catch (err) {
      console.error("❌ Erro ao criar tarefa:", err)
      const errorMessage = err instanceof Error ? err.message : "Erro inesperado ao criar tarefa"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      // Resetar formulário ao fechar
      setFormData({
        nomeDoTecnico: "",
        unidade: "",
        descricao: "",
        numChamado: "",
        status: "1",
      })
      setError(null)
      setFieldErrors({})
      onClose()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 2,
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Add sx={{ color: "#2196f3", fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#333" }}>
            Nova Tarefa
          </Typography>
        </Box>
        <Button onClick={handleClose} disabled={loading} sx={{ minWidth: "auto", p: 1, color: "#666" }}>
          <Close />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {loadingData ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2, color: "#666" }}>
              Carregando dados...
            </Typography>
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Erro ao criar tarefa:
                </Typography>
                <Typography variant="body2">{error}</Typography>
              </Alert>
            )}

            <Grid container spacing={3}>
              {/* Técnico Responsável */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!fieldErrors.nomeDoTecnico}>
                  <InputLabel>Técnico Responsável *</InputLabel>
                  <Select
                    value={formData.nomeDoTecnico}
                    label="Técnico Responsável *"
                    onChange={(e) => handleInputChange("nomeDoTecnico", e.target.value)}
                    disabled={loading}
                  >
                    {usuarios.map((usuario) => (
                      <MenuItem key={usuario.id} value={usuario.id.toString()}>
                        {usuario.nome} ({usuario.email})
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.nomeDoTecnico && (
                    <Typography variant="caption" sx={{ color: "#d32f2f", mt: 0.5 }}>
                      {fieldErrors.nomeDoTecnico}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Unidade */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!fieldErrors.unidade}>
                  <InputLabel>Unidade *</InputLabel>
                  <Select
                    value={formData.unidade}
                    label="Unidade *"
                    onChange={(e) => handleInputChange("unidade", e.target.value)}
                    disabled={loading}
                  >
                    {unidades.map((unidade) => (
                      <MenuItem key={unidade.id} value={unidade.id.toString()}>
                        {unidade.nome_da_unidade}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.unidade && (
                    <Typography variant="caption" sx={{ color: "#d32f2f", mt: 0.5 }}>
                      {fieldErrors.unidade}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Número do Chamado */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Número do Chamado *"
                  value={formData.numChamado}
                  onChange={(e) => handleInputChange("numChamado", e.target.value)}
                  disabled={loading}
                  error={!!fieldErrors.numChamado}
                  helperText={fieldErrors.numChamado || `${formData.numChamado.length}/20 caracteres`}
                  inputProps={{ maxLength: 20 }}
                  placeholder="Ex: CH-2024-001"
                />
              </Grid>

              {/* Status */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!fieldErrors.status}>
                  <InputLabel>Status *</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status *"
                    onChange={(e) => handleInputChange("status", e.target.value)}
                    disabled={loading}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.status && (
                    <Typography variant="caption" sx={{ color: "#d32f2f", mt: 0.5 }}>
                      {fieldErrors.status}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Descrição */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Descrição *"
                  value={formData.descricao}
                  onChange={(e) => handleInputChange("descricao", e.target.value)}
                  disabled={loading}
                  error={!!fieldErrors.descricao}
                  helperText={fieldErrors.descricao || `${formData.descricao.length}/1000 caracteres`}
                  inputProps={{ maxLength: 1000 }}
                  placeholder="Descreva detalhadamente a tarefa a ser realizada..."
                />
              </Grid>
            </Grid>

            {/* Debug info para desenvolvimento */}
            {process.env.NODE_ENV === "development" && (
              <Box sx={{ mt: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 1 }}>
                  Debug Info (apenas em desenvolvimento):
                </Typography>
                <Typography variant="caption" sx={{ display: "block", fontFamily: "monospace" }}>
                  Técnico ID: {formData.nomeDoTecnico} (
                  {usuarios.find((u) => u.id.toString() === formData.nomeDoTecnico)?.nome || "N/A"})
                </Typography>
                <Typography variant="caption" sx={{ display: "block", fontFamily: "monospace" }}>
                  Unidade ID: {formData.unidade} (
                  {unidades.find((u) => u.id.toString() === formData.unidade)?.nome_da_unidade || "N/A"})
                </Typography>
                <Typography variant="caption" sx={{ display: "block", fontFamily: "monospace" }}>
                  Status: {formData.status} ({STATUS_OPTIONS.find((s) => s.value === formData.status)?.label})
                </Typography>
                <Typography variant="caption" sx={{ display: "block", fontFamily: "monospace" }}>
                  Endpoint: http://192.168.15.26:8000/api/v1/tarefas/
                </Typography>
                <Typography variant="caption" sx={{ display: "block", fontFamily: "monospace", color: "#ff6600" }}>
                  Sistema tentará 4 formatos diferentes automaticamente
                </Typography>
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: "1px solid #e0e0e0" }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{
            color: "#666",
            textTransform: "none",
            fontWeight: 500,
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || loadingData}
          startIcon={loading ? <CircularProgress size={20} /> : <Add />}
          sx={{
            bgcolor: "#2196f3",
            "&:hover": { bgcolor: "#1976d2" },
            textTransform: "none",
            fontWeight: 600,
            px: 3,
          }}
        >
          {loading ? "Criando..." : "Criar Tarefa"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
