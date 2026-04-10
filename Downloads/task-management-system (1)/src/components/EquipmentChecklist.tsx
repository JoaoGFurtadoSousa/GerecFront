"use client"

import React from "react"
import { useState, useEffect } from "react"
import {
  Typography,
  Button,
  Box,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  Divider,
  Fab,
  Slide,
  useTheme,
  useMediaQuery,
  Paper,
  Stack,
  LinearProgress,
  Fade,
  Zoom,
} from "@mui/material"
import {
  ArrowBack,
  Send,
  Assessment,
  Warning,
  CheckCircleOutline,
  ErrorOutline,
  Inventory,
  VerifiedUser,
  ReportProblem,
  NavigateNext,
  NavigateBefore,
  SwipeLeft,
  SwipeRight,
  CheckCircle,
  Build,
} from "@mui/icons-material"
import { useParams, useNavigate } from "react-router-dom"
import { useTask, type Equipment } from "../contexts/TaskContext"
import { authService } from "../services/authService"

export default function EquipmentChecklist() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getTaskById, getEquipmentByUnitId, submitEquipmentChecklist, error, clearError, refreshTasks } = useTask()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  // Estados para paginação e navegação
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right")
  const [isAnimating, setIsAnimating] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [loadingEquipment, setLoadingEquipment] = useState(true)

  // Configuração de paginação
  const itemsPerPage = 10
  const totalPages = Math.ceil(equipment.length / itemsPerPage)
  const startIndex = currentPage * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = equipment.slice(startIndex, endIndex)

  const task = getTaskById(Number(id))

  // Touch/Swipe handling para mobile
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && currentPage < totalPages - 1) {
      handleNextPage()
    }
    if (isRightSwipe && currentPage > 0) {
      handlePrevPage()
    }
  }

  // Carregar equipamentos reais da unidade
  useEffect(() => {
    const loadEquipmentFromUnit = async () => {
      if (!task) {
        console.log("⚠️ Tarefa não encontrada, aguardando...")
        return
      }

      if (!task.unidade || !task.unidade.id) {
        console.log("⚠️ Dados da unidade não disponíveis:", {
          task: !!task,
          unidade: !!task.unidade,
          unidadeId: task.unidade?.id,
          taskStatus: task.status,
        })

        if (task.status === "Em andamento") {
          console.log("🔄 Tentando recarregar dados da tarefa...")
          try {
            await refreshTasks()
          } catch (error) {
            console.error("❌ Erro ao recarregar tarefas:", error)
          }
        }
        return
      }

      console.log("🔄 Carregando equipamentos da unidade:", {
        unidadeId: task.unidade.id,
        unidadeNome: task.unidade.nome_da_unidade,
        taskStatus: task.status,
      })

      setLoadingEquipment(true)
      setLocalError(null)

      try {
        const realEquipment = await getEquipmentByUnitId(task.unidade.id)
        console.log("✅ Equipamentos carregados:", realEquipment.length, "itens")
        console.log("📋 Primeiro equipamento:", realEquipment[0])
        console.log("📋 Último equipamento:", realEquipment[realEquipment.length - 1])

        setEquipment(realEquipment)
      } catch (error) {
        console.error("❌ Erro ao carregar equipamentos:", error)
        setLocalError("Erro ao carregar equipamentos da unidade. Tente novamente.")
      } finally {
        setLoadingEquipment(false)
      }
    }

    loadEquipmentFromUnit()
  }, [task])

  // Adicionar uma referência para o container de scroll
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  const handleNextPage = () => {
    if (currentPage < totalPages - 1 && !isAnimating) {
      setIsAnimating(true)
      setSlideDirection("left")
      setTimeout(() => {
        setCurrentPage(currentPage + 1)
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0
        }
        setIsAnimating(false)
      }, 150)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 0 && !isAnimating) {
      setIsAnimating(true)
      setSlideDirection("right")
      setTimeout(() => {
        setCurrentPage(currentPage - 1)
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0
        }
        setIsAnimating(false)
      }, 150)
    }
  }

  const handleSwitchChange = (
    equipmentId: number,
    field: "danificado_a_entrada" | "danificado_a_saida",
    checked: boolean,
  ) => {
    console.log("🔄 Alterando equipamento:", equipmentId, field, checked)
    setEquipment((prevEquipment) =>
      prevEquipment.map((item) => (item.id === equipmentId ? { ...item, [field]: checked } : item)),
    )
  }

  const handleSubmit = async () => {
    console.log("🚀 Iniciando envio do checklist...")

    setLocalError(null)
    clearError()

    if (!task) {
      setLocalError("Tarefa não encontrada. Recarregue a página.")
      return
    }

    if (!task.unidade?.id) {
      setLocalError("ID da unidade não encontrado. Recarregue a página.")
      return
    }

    console.log("🔍 Verificando autenticação antes do envio...")

    if (!authService.isAuthenticated()) {
      console.error("❌ Usuário não autenticado")
      setLocalError("Sessão expirada. Redirecionando para login...")
      setTimeout(() => {
        authService.logout()
      }, 2000)
      return
    }

    const accessToken = localStorage.getItem("access_token")
    const refreshToken = localStorage.getItem("refresh_token")

    console.log("🔍 Estado dos tokens antes do envio:", {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenLength: accessToken?.length || 0,
      refreshTokenLength: refreshToken?.length || 0,
    })

    if (!accessToken || !refreshToken) {
      console.error("❌ Tokens não encontrados no localStorage")
      setLocalError("Tokens de autenticação não encontrados. Faça login novamente.")
      setTimeout(() => {
        authService.logout()
      }, 2000)
      return
    }

    authService.forceReinitialize()

    setSubmitting(true)

    try {
      const equipmentArray = equipment.map((item) => ({
        id: item.id,
        nome_do_equipamento: item.nome_do_equipamento,
        unidade: task.unidade.id,
        danificado_a_entrada: item.danificado_a_entrada,
        danificado_a_saida: item.danificado_a_saida,
      }))

      console.log("📤 Enviando checklist com IDs corretos:", {
        unitId: task.unidade.id,
        equipmentCount: equipmentArray.length,
        firstEquipmentId: equipmentArray[0]?.id,
        lastEquipmentId: equipmentArray[equipmentArray.length - 1]?.id,
        sampleEquipment: equipmentArray.slice(0, 3),
      })

      await submitEquipmentChecklist(task.unidade.id, equipmentArray)

      console.log("✅ Checklist enviado com sucesso, redirecionando...")
      navigate(`/task/${id}/additional-data`)
    } catch (err) {
      console.error("❌ Erro detalhado ao enviar checklist:", err)

      let errorMessage = "Erro ao enviar checklist"
      if (err instanceof Error) {
        errorMessage = err.message

        if (errorMessage.includes("Token não encontrado") || errorMessage.includes("Sessão expirada")) {
          setLocalError("Sessão expirada. Redirecionando para login...")
          setTimeout(() => {
            authService.logout()
          }, 2000)
          return
        }
      }

      setLocalError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  // Verificar autenticação ao carregar o componente
  useEffect(() => {
    console.log("🔍 EquipmentChecklist: Verificando autenticação inicial...")

    const accessToken = localStorage.getItem("access_token")
    const refreshToken = localStorage.getItem("refresh_token")

    console.log("🔍 Tokens no carregamento:", {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
    })

    if (!accessToken || !refreshToken) {
      console.error("❌ Tokens não encontrados ao carregar checklist")
      setLocalError("Sessão expirada. Redirecionando para login...")
      setTimeout(() => {
        authService.logout()
      }, 2000)
      return
    }

    if (!authService.isAuthenticated()) {
      console.log("🔄 Re-inicializando AuthService...")
      authService.forceReinitialize()
    }

    console.log("✅ Autenticação verificada no checklist")
  }, [])

  // Debug da tarefa
  useEffect(() => {
    console.log("🔍 Debug - Dados da tarefa no checklist:", {
      taskId: id,
      task: task,
      unidadeId: task?.unidade?.id,
      unidadeNome: task?.unidade?.nome_da_unidade,
      userData: authService.getUserData(),
      hasToken: !!authService.getAccessToken(),
    })
  }, [task, id])

  // Estatísticas dos equipamentos
  const totalEquipment = equipment.length
  const verifiedEntryCount = equipment.filter((item) => !item.danificado_a_entrada).length
  const damagedEntryCount = equipment.filter((item) => item.danificado_a_entrada).length
  const damagedExitCount = equipment.filter((item) => item.danificado_a_saida).length
  const checkedItemsCount = equipment.filter((item) => item.danificado_a_entrada || item.danificado_a_saida).length
  const progressPercentage = totalEquipment > 0 ? (checkedItemsCount / totalEquipment) * 100 : 0

  // Injetar CSS no head
  useEffect(() => {
    const pulseKeyframes = `
      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
        }
        70% {
          box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
        }
      }
    `
    const style = document.createElement("style")
    style.textContent = pulseKeyframes
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  if (!task) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Tarefa não encontrada</Alert>
      </Box>
    )
  }

  if (loadingEquipment) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f8f9fa",
        }}
      >
        <CircularProgress size={60} sx={{ mb: 2, color: "#2196f3" }} />
        <Typography variant="h6" color="text.secondary">
          Carregando equipamentos da unidade...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {task.unidade?.nome_da_unidade}
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f8f9fa",
      }}
    >
      {/* 📌 ÁREA FIXA SUPERIOR */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          bgcolor: "#f8f9fa",
          borderBottom: "1px solid #e5e7eb",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          height: "45vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ px: { xs: 2, md: 3 }, py: 1, flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Botão Voltar */}
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(`/task/${id}`)}
            sx={{
              mb: 1,
              color: "#64748b",
              fontSize: "0.85rem",
              textTransform: "none",
              fontWeight: 500,
              alignSelf: "flex-start",
              minHeight: "32px",
              "&:hover": {
                bgcolor: "rgba(100, 116, 139, 0.08)",
              },
            }}
          >
            Voltar para detalhes
          </Button>

          {/* Header com Título */}
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: "#e0f2fe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Assessment sx={{ fontSize: 20, color: "#0277bd" }} />
            </Box>
            <Box>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                sx={{ fontWeight: 700, color: "#1e293b", mb: 0.25, lineHeight: 1.2 }}
              >
                Checklist de Equipamentos
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500, fontSize: "0.75rem" }}>
                Chamado #{task.numChamado} • {task.unidade?.nome_da_unidade}
              </Typography>
            </Box>
          </Stack>


          {/* Progresso da Verificação */}
          <Paper
            elevation={0}
            sx={{
              mb: 1.5,
              p: 1.5,
              borderRadius: 2,
              border: "1px solid #e5e7eb",
              bgcolor: "white",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b", fontSize: "0.875rem" }}>
                Progresso da Verificação
              </Typography>
              <Chip
                label={`${checkedItemsCount}/${totalEquipment}`}
                size="small"
                sx={{
                  bgcolor: progressPercentage > 50 ? "#dcfce7" : "#fef3c7",
                  color: progressPercentage > 50 ? "#16a34a" : "#d97706",
                  fontWeight: 600,
                  height: 20,
                  fontSize: "0.7rem",
                }}
              />
            </Stack>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: "#f1f5f9",
                "& .MuiLinearProgress-bar": {
                  bgcolor: progressPercentage > 50 ? "#16a34a" : "#d97706",
                  borderRadius: 3,
                },
              }}
            />
            <Typography variant="caption" sx={{ color: "#64748b", mt: 0.5, display: "block", fontSize: "0.7rem" }}>
              {progressPercentage.toFixed(0)}% concluído
            </Typography>
          </Paper>

          {/* Cards de Status */}
          <Grid container spacing={1} sx={{ mb: 1.5 }}>
            <Grid item xs={6} sm={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: "white",
                  border: "1px solid #e5e7eb",
                  textAlign: "center",
                  minHeight: "60px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Inventory sx={{ fontSize: 16, color: "#6b7280", mb: 0.25 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#374151", fontSize: "0.95rem", lineHeight: 1 }}>
                  {totalEquipment}
                </Typography>
                <Typography variant="caption" sx={{ color: "#6b7280", fontSize: "0.65rem", lineHeight: 1 }}>
                  Total
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  textAlign: "center",
                  minHeight: "60px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <VerifiedUser sx={{ fontSize: 16, color: "#16a34a", mb: 0.25 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#15803d", fontSize: "0.95rem", lineHeight: 1 }}>
                  {verifiedEntryCount}
                </Typography>
                <Typography variant="caption" sx={{ color: "#16a34a", fontSize: "0.65rem", lineHeight: 1 }}>
                  OK
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: "#fef2f2",
                  border: "1px solid #fecaca",
                  textAlign: "center",
                  minHeight: "60px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <ReportProblem sx={{ fontSize: 16, color: "#dc2626", mb: 0.25 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#dc2626", fontSize: "0.95rem", lineHeight: 1 }}>
                  {damagedEntryCount}
                </Typography>
                <Typography variant="caption" sx={{ color: "#dc2626", fontSize: "0.65rem", lineHeight: 1 }}>
                  Entrada
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: "#fffbeb",
                  border: "1px solid #fed7aa",
                  textAlign: "center",
                  minHeight: "60px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Warning sx={{ fontSize: 16, color: "#d97706", mb: 0.25 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#d97706", fontSize: "0.95rem", lineHeight: 1 }}>
                  {damagedExitCount}
                </Typography>
                <Typography variant="caption" sx={{ color: "#d97706", fontSize: "0.65rem", lineHeight: 1 }}>
                  Saída
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Indicador de Página */}
          <Paper
            elevation={0}
            sx={{
              p: 1,
              borderRadius: 2,
              border: "1px solid #e5e7eb",
              bgcolor: "white",
              mt: "auto",
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500, fontSize: "0.75rem" }}>
                Página {currentPage + 1} de {totalPages}
              </Typography>
              <Stack direction="row" spacing={0.5}>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: index === currentPage ? "#2563eb" : "#cbd5e1",
                      transition: "all 0.2s ease",
                    }}
                  />
                ))}
                {totalPages > 5 && (
                  <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.7rem", ml: 0.5 }}>
                    ...
                  </Typography>
                )}
              </Stack>
              {isMobile && (
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <SwipeLeft sx={{ fontSize: 12, color: "#94a3b8" }} />
                  <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.65rem" }}>
                    Deslize
                  </Typography>
                  <SwipeRight sx={{ fontSize: 12, color: "#94a3b8" }} />
                </Stack>
              )}
            </Stack>
          </Paper>
        </Box>
      </Box>

      {/* 🔽 ÁREA ROLÁVEL - LISTA DE EQUIPAMENTOS */}
      <Box
        sx={{
          flex: 1,
          marginTop: { xs: "48vh", md: "45vh" }, // Margem extra no mobile
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {(error || localError) && (
          <Box sx={{ px: { xs: 2, md: 3 }, pt: 2 }}>
            <Alert
              severity="error"
              sx={{ borderRadius: 3 }}
              onClose={() => {
                clearError()
                setLocalError(null)
              }}
            >
              {error || localError}
            </Alert>
          </Box>
        )}

        {/* ✅ CORREÇÃO ROBUSTA: Container da Lista com Espaçador Dedicado */}
        <Box
          ref={scrollContainerRef}
          sx={{
            flex: 1,
            overflow: "auto",
            px: { xs: 2, md: 3 },
            py: 2,
            "&::-webkit-scrollbar": {
              width: 6,
            },
            "&::-webkit-scrollbar-track": {
              bgcolor: "#f1f5f9",
              borderRadius: 3,
            },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "#cbd5e1",
              borderRadius: 3,
              "&:hover": {
                bgcolor: "#94a3b8",
              },
            },
          }}
          onTouchStart={isMobile ? onTouchStart : undefined}
          onTouchMove={isMobile ? onTouchMove : undefined}
          onTouchEnd={isMobile ? onTouchEnd : undefined}
        >
          {/* ✅ ESPAÇADOR DEDICADO - Usa mesma unidade do header (45vh + margem extra) */}
          <Box
            sx={{
              height: { xs: "12vh", md: "8vh" }, // Espaço proporcional à viewport
              width: "100%",
              mb: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "transparent",
              minHeight: { xs: "100px", md: "60px" }, // Altura mínima de segurança
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "#94a3b8",
                fontSize: "0.75rem",
                textAlign: "center",
                fontStyle: "italic",
              }}
            >
              ↓ Lista de Equipamentos ↓
            </Typography>
          </Box>

          <Fade in={!isAnimating} timeout={300}>
            <Box>
              {currentItems.map((item, index) => {
                const globalIndex = startIndex + index
                const isChecked = item.danificado_a_entrada || item.danificado_a_saida

                return (
                  <Zoom
                    in={true}
                    timeout={200 + index * 100}
                    key={item.id}
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        mb: 3,
                        p: 3,
                        borderRadius: 3,
                        bgcolor: "white",
                        border: `2px solid ${isChecked ? "#22c55e" : "#f1f5f9"}`,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                          borderColor: isChecked ? "#16a34a" : "#e2e8f0",
                        },
                      }}
                    >
                      {/* Header do equipamento */}
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            bgcolor: isChecked ? "#dcfce7" : "#f1f5f9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.3s ease",
                          }}
                        >
                          {isChecked ? (
                            <CheckCircle sx={{ color: "#16a34a", fontSize: 20 }} />
                          ) : (
                            <Build sx={{ color: "#94a3b8", fontSize: 20 }} />
                          )}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              color: "#1e293b",
                              fontSize: isMobile ? "0.95rem" : "1rem",
                              mb: 0.5,
                              lineHeight: 1.3,
                            }}
                          >
                            {item.nome_do_equipamento}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              label={`${globalIndex + 1} de ${totalEquipment}`}
                              size="small"
                              sx={{
                                bgcolor: "#f8fafc",
                                color: "#64748b",
                                fontSize: "0.75rem",
                                height: 22,
                                fontWeight: 500,
                              }}
                            />
                            <Chip
                              label={`ID: ${item.id}`}
                              size="small"
                              sx={{
                                bgcolor: "#e0f2fe",
                                color: "#0277bd",
                                fontSize: "0.75rem",
                                height: 22,
                                fontWeight: 500,
                              }}
                            />
                            {isChecked && (
                              <Chip
                                label="Verificado"
                                size="small"
                                sx={{
                                  bgcolor: "#dcfce7",
                                  color: "#16a34a",
                                  fontSize: "0.75rem",
                                  height: 22,
                                  fontWeight: 600,
                                }}
                              />
                            )}
                          </Stack>
                        </Box>
                      </Stack>

                      <Divider sx={{ mb: 3, borderColor: "#f1f5f9" }} />

                      {/* Switches com layout melhorado */}
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2.5,
                              borderRadius: 2,
                              bgcolor: item.danificado_a_entrada ? "#fef2f2" : "#f0fdf4",
                              border: `1px solid ${item.danificado_a_entrada ? "#fecaca" : "#bbf7d0"}`,
                              transition: "all 0.2s ease",
                            }}
                          >
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={item.danificado_a_entrada}
                                  onChange={(e) =>
                                    handleSwitchChange(item.id, "danificado_a_entrada", e.target.checked)
                                  }
                                  sx={{
                                    "& .MuiSwitch-switchBase.Mui-checked": {
                                      color: "#dc2626",
                                      "&:hover": {
                                        bgcolor: "rgba(220, 38, 38, 0.08)",
                                      },
                                    },
                                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                      bgcolor: "#dc2626",
                                    },
                                    "& .MuiSwitch-track": {
                                      bgcolor: "#16a34a",
                                    },
                                    "& .MuiSwitch-switchBase": {
                                      color: "#16a34a",
                                      "&:hover": {
                                        bgcolor: "rgba(22, 163, 74, 0.08)",
                                      },
                                    },
                                  }}
                                />
                              }
                              label={
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                  {item.danificado_a_entrada ? (
                                    <ErrorOutline sx={{ color: "#dc2626", fontSize: 18 }} />
                                  ) : (
                                    <CheckCircleOutline sx={{ color: "#16a34a", fontSize: 18 }} />
                                  )}
                                  <Box>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontSize: "0.875rem",
                                        fontWeight: 600,
                                        color: item.danificado_a_entrada ? "#dc2626" : "#16a34a",
                                        lineHeight: 1.2,
                                      }}
                                    >
                                      {item.danificado_a_entrada ? "Danificado" : "OK"}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: item.danificado_a_entrada ? "#b91c1c" : "#15803d",
                                        fontSize: "0.75rem",
                                      }}
                                    >
                                      na Entrada
                                    </Typography>
                                  </Box>
                                </Stack>
                              }
                              sx={{ m: 0, width: "100%" }}
                            />
                          </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2.5,
                              borderRadius: 2,
                              bgcolor: item.danificado_a_saida ? "#fffbeb" : "#f0fdf4",
                              border: `1px solid ${item.danificado_a_saida ? "#fed7aa" : "#bbf7d0"}`,
                              transition: "all 0.2s ease",
                            }}
                          >
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={item.danificado_a_saida}
                                  onChange={(e) => handleSwitchChange(item.id, "danificado_a_saida", e.target.checked)}
                                  sx={{
                                    "& .MuiSwitch-switchBase.Mui-checked": {
                                      color: "#d97706",
                                      "&:hover": {
                                        bgcolor: "rgba(217, 119, 6, 0.08)",
                                      },
                                    },
                                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                      bgcolor: "#d97706",
                                    },
                                    "& .MuiSwitch-track": {
                                      bgcolor: "#16a34a",
                                    },
                                    "& .MuiSwitch-switchBase": {
                                      color: "#16a34a",
                                      "&:hover": {
                                        bgcolor: "rgba(22, 163, 74, 0.08)",
                                      },
                                    },
                                  }}
                                />
                              }
                              label={
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                  {item.danificado_a_saida ? (
                                    <Warning sx={{ color: "#d97706", fontSize: 18 }} />
                                  ) : (
                                    <CheckCircleOutline sx={{ color: "#16a34a", fontSize: 18 }} />
                                  )}
                                  <Box>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontSize: "0.875rem",
                                        fontWeight: 600,
                                        color: item.danificado_a_saida ? "#d97706" : "#16a34a",
                                        lineHeight: 1.2,
                                      }}
                                    >
                                      {item.danificado_a_saida ? "Danificado" : "OK"}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: item.danificado_a_saida ? "#c2410c" : "#15803d",
                                        fontSize: "0.75rem",
                                      }}
                                    >
                                      na Saída
                                    </Typography>
                                  </Box>
                                </Stack>
                              }
                              sx={{ m: 0, width: "100%" }}
                            />
                          </Paper>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Zoom>
                )
              })}
            </Box>
          </Fade>

          {/* Navegação entre páginas */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid #e5e7eb",
              mb: 2,
              bgcolor: "white",
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Button
                variant="outlined"
                startIcon={<NavigateBefore />}
                onClick={handlePrevPage}
                disabled={currentPage === 0 || isAnimating}
                sx={{
                  borderColor: "#e5e7eb",
                  color: "#64748b",
                  "&:hover": {
                    borderColor: "#2563eb",
                    color: "#2563eb",
                  },
                  "&:disabled": {
                    borderColor: "#f1f5f9",
                    color: "#cbd5e1",
                  },
                }}
              >
                Anterior
              </Button>

              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  {startIndex + 1}-{Math.min(endIndex, totalEquipment)} de {totalEquipment}
                </Typography>
              </Stack>

              <Button
                variant="outlined"
                endIcon={<NavigateNext />}
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1 || isAnimating}
                sx={{
                  borderColor: "#e5e7eb",
                  color: "#64748b",
                  "&:hover": {
                    borderColor: "#2563eb",
                    color: "#2563eb",
                  },
                  "&:disabled": {
                    borderColor: "#f1f5f9",
                    color: "#cbd5e1",
                  },
                }}
              >
                Próximo
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Box>

      {/* Botão de envio flutuante - APENAS NA ÚLTIMA PÁGINA */}
      {currentPage === totalPages - 1 && (
        <Slide direction="up" in={true} mountOnEnter unmountOnExit>
          <Fab
            variant="extended"
            onClick={handleSubmit}
            disabled={submitting}
            sx={{
              position: "fixed",
              bottom: 24,
              right: 24,
              bgcolor: "#16a34a",
              color: "white",
              px: 4,
              py: 1.5,
              fontSize: "1rem",
              fontWeight: 600,
              boxShadow: "0 8px 32px rgba(22, 163, 74, 0.3)",
              "&:hover": {
                bgcolor: "#15803d",
                boxShadow: "0 12px 40px rgba(22, 163, 74, 0.4)",
                transform: "translateY(-2px)",
              },
              "&:disabled": {
                bgcolor: "#9ca3af",
                color: "white",
              },
              transition: "all 0.3s ease",
              zIndex: 1001,
            }}
          >
            {submitting ? (
              <>
                <CircularProgress size={24} color="inherit" sx={{ mr: 2 }} />
                Processando...
              </>
            ) : (
              <>
                <Send sx={{ mr: 2 }} />
                Prosseguir ({checkedItemsCount}/{totalEquipment})
              </>
            )}
          </Fab>
        </Slide>
      )}
    </Box>
  )
}
