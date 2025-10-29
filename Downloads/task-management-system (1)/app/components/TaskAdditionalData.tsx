"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  TextField,
  Alert,
  CircularProgress,
  Grid,
  Paper,
  IconButton,
  Chip,
} from "@mui/material"
import {
  ArrowBack,
  Save,
  LocationOn,
  CameraAlt,
  Delete,
  MyLocation,
  CheckCircle,
  Engineering,
  Warning,
  Business,
} from "@mui/icons-material"
import { useParams, useNavigate } from "react-router-dom"
import { useTask } from "../contexts/TaskContext"

interface AdditionalDataForm {
  diagnostico: string
  solucao: string
  substituicao_de_pecas: string
  fotoTotemEntrada: File | null
  fotoTotemSaida: File | null
  latitude: number
  longitude: number
}

export default function TaskAdditionalData() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getTaskById, updateTaskWithAdditionalData, loading, error, clearError } = useTask()

  const [formData, setFormData] = useState<AdditionalDataForm>({
    diagnostico: "",
    solucao: "",
    substituicao_de_pecas: "",
    fotoTotemEntrada: null,
    fotoTotemSaida: null,
    latitude: 0,
    longitude: 0,
  })

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [previewUrls, setPreviewUrls] = useState<{
    entrada: string | null
    saida: string | null
  }>({
    entrada: null,
    saida: null,
  })

  const task = getTaskById(Number(id))

  // Log da tarefa carregada
  useEffect(() => {
    if (task) {
      console.log("=".repeat(80))
      console.log("📋 TAREFA CARREGADA NO COMPONENTE")
      console.log("=".repeat(80))
      console.log({
        id: task.id,
        numChamado: task.numChamado,
        unidade: task.unidade,
        unidade_id: task.unidade?.id,
        unidade_nome: task.unidade?.nome_da_unidade,
        status: task.status,
        diagnostico_atual: task.diagnostico,
        solucao_atual: task.solucao,
      })
      console.log("=".repeat(80))
    }
  }, [task])

  // Obter localização automaticamente ao carregar a página
  useEffect(() => {
    getCurrentLocation()
  }, [])

  const getCurrentLocation = () => {
    setLocationLoading(true)
    setLocationError(null)

    if (!navigator.geolocation) {
      setLocationError("Geolocalização não é suportada neste navegador")
      setLocationLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        console.log("📍 Localização obtida:", {
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
        })

        setFormData((prev) => ({
          ...prev,
          latitude: Number.parseFloat(latitude.toFixed(6)),
          longitude: Number.parseFloat(longitude.toFixed(6)),
        }))

        setLocationLoading(false)
      },
      (error) => {
        console.error("❌ Erro ao obter localização:", error)
        let errorMessage = "Erro ao obter localização"

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permissão de localização negada pelo usuário"
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Informações de localização não disponíveis"
            break
          case error.TIMEOUT:
            errorMessage = "Tempo limite para obter localização excedido"
            break
        }

        setLocationError(errorMessage)
        setLocationLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )
  }

  const handleInputChange = (field: keyof AdditionalDataForm, value: string | number) => {
    console.log(`📝 Campo "${field}" alterado:`, {
      valor: value,
      tipo: typeof value,
      tamanho: typeof value === "string" ? value.length : "N/A",
    })

    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      }

      console.log("📋 Estado COMPLETO do formulário após alteração:", {
        diagnostico: newData.diagnostico,
        diagnostico_length: newData.diagnostico?.length,
        diagnostico_empty: !newData.diagnostico || newData.diagnostico.trim() === "",
        solucao: newData.solucao,
        solucao_length: newData.solucao?.length,
        solucao_empty: !newData.solucao || newData.solucao.trim() === "",
        substituicao_de_pecas: newData.substituicao_de_pecas,
        latitude: newData.latitude,
        longitude: newData.longitude,
      })

      return newData
    })

    if (error) clearError()
  }

  const handleFileChange = (field: "fotoTotemEntrada" | "fotoTotemSaida", file: File | null) => {
    console.log(`📷 Arquivo selecionado para ${field}:`, file ? file.name : "removido")

    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }))

    // Criar preview da imagem
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const previewKey = field === "fotoTotemEntrada" ? "entrada" : "saida"
        setPreviewUrls((prev) => ({
          ...prev,
          [previewKey]: e.target?.result as string,
        }))
      }
      reader.readAsDataURL(file)
    } else {
      const previewKey = field === "fotoTotemEntrada" ? "entrada" : "saida"
      setPreviewUrls((prev) => ({
        ...prev,
        [previewKey]: null,
      }))
    }
  }

  const removeImage = (field: "fotoTotemEntrada" | "fotoTotemSaida") => {
    handleFileChange(field, null)
  }

  const validateForm = (): boolean => {
    console.log("=".repeat(80))
    console.log("🔍 VALIDANDO FORMULÁRIO")
    console.log("=".repeat(80))

    const diagnostico_trimmed = formData.diagnostico?.trim() || ""
    const solucao_trimmed = formData.solucao?.trim() || ""

    console.log("📋 Dados do formulário para validação:", {
      diagnostico_original: formData.diagnostico,
      diagnostico_trimmed,
      diagnostico_length: diagnostico_trimmed.length,
      diagnostico_is_empty: diagnostico_trimmed === "",
      solucao_original: formData.solucao,
      solucao_trimmed,
      solucao_length: solucao_trimmed.length,
      solucao_is_empty: solucao_trimmed === "",
      latitude: formData.latitude,
      longitude: formData.longitude,
      latitude_is_zero: formData.latitude === 0,
      longitude_is_zero: formData.longitude === 0,
    })

    if (diagnostico_trimmed === "") {
      setLocationError("❌ Diagnóstico é obrigatório e não pode estar vazio")
      console.log("❌ VALIDAÇÃO FALHOU: Diagnóstico vazio")
      return false
    }

    if (solucao_trimmed === "") {
      setLocationError("❌ Solução é obrigatória e não pode estar vazia")
      console.log("❌ VALIDAÇÃO FALHOU: Solução vazia")
      return false
    }

    if (formData.latitude === 0 || formData.longitude === 0) {
      setLocationError("❌ Localização é obrigatória. Clique em 'Obter Localização'")
      console.log("❌ VALIDAÇÃO FALHOU: Localização não obtida")
      return false
    }

    console.log("✅ VALIDAÇÃO PASSOU COM SUCESSO")
    console.log("=".repeat(80))
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("=".repeat(80))
    console.log("🚀 INICIANDO ENVIO DO FORMULÁRIO")
    console.log("=".repeat(80))

    console.log("📋 Estado FINAL do formulário antes da validação:", {
      diagnostico: formData.diagnostico,
      diagnostico_length: formData.diagnostico?.length,
      solucao: formData.solucao,
      solucao_length: formData.solucao?.length,
      substituicao_de_pecas: formData.substituicao_de_pecas,
      latitude: formData.latitude,
      longitude: formData.longitude,
      fotoTotemEntrada: formData.fotoTotemEntrada ? `File: ${formData.fotoTotemEntrada.name}` : null,
      fotoTotemSaida: formData.fotoTotemSaida ? `File: ${formData.fotoTotemSaida.name}` : null,
    })

    if (!validateForm()) {
      console.log("❌ Formulário inválido, envio cancelado")
      return
    }

    if (!task) {
      console.error("❌ Tarefa não encontrada, envio cancelado")
      setLocationError("Tarefa não encontrada")
      return
    }

    console.log("📦 Informações da tarefa atual:", {
      id: task.id,
      unidade_id: task.unidade?.id,
      unidade_nome: task.unidade?.nome_da_unidade,
    })

    setSubmitting(true)
    setLocationError(null)

    try {
      console.log("📤 Chamando updateTaskWithAdditionalData...")
      console.log("📋 Dados que serão enviados:", formData)

      await updateTaskWithAdditionalData(Number(id), formData)

      console.log("✅ Tarefa atualizada com sucesso!")
      setSuccess(true)

      // Redirecionar para home após 2 segundos
      setTimeout(() => {
        console.log("🔄 Redirecionando para a página inicial...")
        navigate("/")
      }, 2000)
    } catch (err) {
      console.error("❌ Erro ao finalizar tarefa:", err)
      setLocationError(err instanceof Error ? err.message : "Erro desconhecido ao finalizar tarefa")
    } finally {
      setSubmitting(false)
    }
  }

  if (!task) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">Tarefa não encontrada</Alert>
      </Container>
    )
  }

  if (success) {
    return (
      <Container maxWidth="md">
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <CheckCircle sx={{ fontSize: 80, color: "success.main", mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Tarefa Finalizada com Sucesso!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              A tarefa "{task.unidade?.nome_da_unidade}" foi atualizada com todos os dados.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Redirecionando para a página inicial...
            </Typography>
          </CardContent>
        </Card>
      </Container>
    )
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa" }}>
      <Container maxWidth="md" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate(`/task/${id}/checklist`)} sx={{ mb: 2 }}>
            Voltar para checklist
          </Button>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Engineering sx={{ color: "#2196f3", fontSize: 32 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: "#333" }}>
                Finalização da Tarefa
              </Typography>
              <Typography variant="body1" sx={{ color: "#666" }}>
                Chamado #{task.numChamado}
              </Typography>
            </Box>
          </Box>

          {/* Informação da Unidade */}
          <Alert severity="info" icon={<Business />} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Unidade desta tarefa:
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label={task.unidade?.nome_da_unidade || "Sem unidade"}
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 600 }}
                />
                <Typography variant="caption" color="text.secondary">
                  (ID: {task.unidade?.id})
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                ⚠️ A unidade será preservada automaticamente e não será alterada
              </Typography>
            </Box>
          </Alert>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        {locationError && (
          <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setLocationError(null)}>
            {locationError}
          </Alert>
        )}

        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={handleSubmit}>
              {/* Diagnóstico */}
              <Typography variant="h6" sx={{ mb: 2, color: "#333", fontWeight: 600 }}>
                Diagnóstico *
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Descreva o diagnóstico detalhado do problema encontrado..."
                value={formData.diagnostico}
                onChange={(e) => handleInputChange("diagnostico", e.target.value)}
                required
                sx={{ mb: 4 }}
                helperText={`${formData.diagnostico.length} caracteres digitados`}
                error={formData.diagnostico.trim() === "" && formData.diagnostico.length > 0}
              />

              {/* Solução */}
              <Typography variant="h6" sx={{ mb: 2, color: "#333", fontWeight: 600 }}>
                Solução Aplicada *
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Descreva a solução aplicada para resolver o problema..."
                value={formData.solucao}
                onChange={(e) => handleInputChange("solucao", e.target.value)}
                required
                sx={{ mb: 4 }}
                helperText={`${formData.solucao.length} caracteres digitados`}
                error={formData.solucao.trim() === "" && formData.solucao.length > 0}
              />

              {/* Substituição de Peças */}
              <Typography variant="h6" sx={{ mb: 2, color: "#333", fontWeight: 600 }}>
                Substituição de Peças (opcional)
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Liste as peças que foram substituídas..."
                value={formData.substituicao_de_pecas}
                onChange={(e) => handleInputChange("substituicao_de_pecas", e.target.value)}
                sx={{ mb: 4 }}
                helperText="Campo opcional - deixe em branco se não houver substituição"
              />

              {/* Fotos */}
              <Typography variant="h6" sx={{ mb: 3, color: "#333", fontWeight: 600 }}>
                Fotos do Totem
              </Typography>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Foto Entrada */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, border: "2px dashed #e0e0e0", textAlign: "center" }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                      Foto do Totem - Entrada
                    </Typography>

                    {previewUrls.entrada ? (
                      <Box sx={{ position: "relative" }}>
                        <img
                          src={previewUrls.entrada || "/placeholder.svg"}
                          alt="Preview Entrada"
                          style={{
                            width: "100%",
                            maxHeight: 200,
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />
                        <IconButton
                          onClick={() => removeImage("fotoTotemEntrada")}
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            bgcolor: "rgba(0,0,0,0.7)",
                            color: "white",
                            "&:hover": { bgcolor: "rgba(0,0,0,0.9)" },
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box>
                        <CameraAlt sx={{ fontSize: 48, color: "#ccc", mb: 2 }} />
                        <Button variant="outlined" component="label" startIcon={<CameraAlt />}>
                          Selecionar Foto
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null
                              handleFileChange("fotoTotemEntrada", file)
                            }}
                          />
                        </Button>
                      </Box>
                    )}
                  </Paper>
                </Grid>

                {/* Foto Saída */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, border: "2px dashed #e0e0e0", textAlign: "center" }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                      Foto do Totem - Saída
                    </Typography>

                    {previewUrls.saida ? (
                      <Box sx={{ position: "relative" }}>
                        <img
                          src={previewUrls.saida || "/placeholder.svg"}
                          alt="Preview Saída"
                          style={{
                            width: "100%",
                            maxHeight: 200,
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />
                        <IconButton
                          onClick={() => removeImage("fotoTotemSaida")}
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            bgcolor: "rgba(0,0,0,0.7)",
                            color: "white",
                            "&:hover": { bgcolor: "rgba(0,0,0,0.9)" },
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box>
                        <CameraAlt sx={{ fontSize: 48, color: "#ccc", mb: 2 }} />
                        <Button variant="outlined" component="label" startIcon={<CameraAlt />}>
                          Selecionar Foto
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null
                              handleFileChange("fotoTotemSaida", file)
                            }}
                          />
                        </Button>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>

              {/* Localização */}
              <Typography variant="h6" sx={{ mb: 3, color: "#333", fontWeight: 600 }}>
                Localização *
              </Typography>

              <Paper sx={{ p: 3, mb: 4, bgcolor: "#f8f9fa" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocationOn sx={{ color: "#2196f3" }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Coordenadas GPS
                    </Typography>
                  </Box>

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={locationLoading ? <CircularProgress size={16} /> : <MyLocation />}
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                  >
                    {locationLoading ? "Obtendo..." : "Obter Localização"}
                  </Button>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Latitude"
                      type="number"
                      value={formData.latitude}
                      onChange={(e) => handleInputChange("latitude", Number.parseFloat(e.target.value) || 0)}
                      inputProps={{ step: "any" }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Longitude"
                      type="number"
                      value={formData.longitude}
                      onChange={(e) => handleInputChange("longitude", Number.parseFloat(e.target.value) || 0)}
                      inputProps={{ step: "any" }}
                      required
                    />
                  </Grid>
                </Grid>

                {formData.latitude !== 0 && formData.longitude !== 0 && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Localização obtida: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                  </Alert>
                )}
              </Paper>

              {/* Resumo antes de enviar */}
              <Paper sx={{ p: 3, mb: 4, bgcolor: "#fff3e0", border: "2px solid #ff9800" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <Warning sx={{ color: "#ff9800" }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: "#ff9800" }}>
                    Resumo da Finalização
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Unidade:</strong> {task.unidade?.nome_da_unidade} (ID: {task.unidade?.id})
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Diagnóstico:</strong> {formData.diagnostico.length} caracteres
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Solução:</strong> {formData.solucao.length} caracteres
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Localização:</strong>{" "}
                      {formData.latitude !== 0 && formData.longitude !== 0 ? "Obtida ✓" : "Pendente ✗"}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Botões */}
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button variant="outlined" onClick={() => navigate(`/task/${id}/checklist`)} disabled={submitting}>
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Save />}
                  disabled={
                    submitting ||
                    !formData.diagnostico.trim() ||
                    !formData.solucao.trim() ||
                    formData.latitude === 0 ||
                    formData.longitude === 0
                  }
                  sx={{
                    px: 4,
                    py: 1.5,
                    bgcolor: "#4caf50",
                    "&:hover": { bgcolor: "#388e3c" },
                  }}
                >
                  {submitting ? "Enviando..." : "Finalizar Tarefa"}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
