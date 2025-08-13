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
        console.log("📍 Localização obtida:", latitude, longitude)

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
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    if (error) clearError()
  }

  const handleFileChange = (field: "fotoTotemEntrada" | "fotoTotemSaida", file: File | null) => {
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
    if (!formData.diagnostico.trim()) {
      setLocationError("Diagnóstico é obrigatório")
      return false
    }
    if (!formData.solucao.trim()) {
      setLocationError("Solução é obrigatória")
      return false
    }
    if (formData.latitude === 0 || formData.longitude === 0) {
      setLocationError("Localização é obrigatória. Clique em 'Obter Localização'")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setSubmitting(true)
    try {
      console.log("📤 Finalizando tarefa com dados adicionais:", formData)

      // Usar o token já armazenado para atualizar a tarefa
      await updateTaskWithAdditionalData(Number(id), formData)

      setSuccess(true)

      // Redirecionar para home após 2 segundos
      setTimeout(() => {
        navigate("/")
      }, 2000)
    } catch (err) {
      console.error("❌ Erro ao finalizar tarefa:", err)
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
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: "#333" }}>
                Edição da Tarefa
              </Typography>
              <Typography variant="body1" sx={{ color: "#666" }}>
                Chamado #{task.numChamado} - {task.unidade?.nome_da_unidade}
              </Typography>
            </Box>
          </Box>
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
                Diagnóstico
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
              />

              {/* Solução */}
              <Typography variant="h6" sx={{ mb: 2, color: "#333", fontWeight: 600 }}>
                Solução Aplicada
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
              />

              {/* Substituição de Peças */}
              <Typography variant="h6" sx={{ mb: 2, color: "#333", fontWeight: 600 }}>
                Substituição de Peças
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Liste as peças que foram substituídas (opcional)..."
                value={formData.substituicao_de_pecas}
                onChange={(e) => handleInputChange("substituicao_de_pecas", e.target.value)}
                sx={{ mb: 4 }}
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
                Localização
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
                  disabled={submitting || !formData.diagnostico || !formData.solucao}
                  sx={{
                    px: 4,
                    py: 1.5,
                    bgcolor: "#4caf50",
                    "&:hover": { bgcolor: "#388e3c" },
                  }}
                >
                  {submitting ? "Salvando..." : "Finalizar Tarefa"}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
