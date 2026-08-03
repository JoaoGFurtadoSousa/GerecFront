"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  InputAdornment,
  Paper,
  Avatar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"
import {
  Visibility,
  Search,
  Dashboard,
  Engineering,
  Notifications,
  TrendingUp,
  CheckCircle,
  Schedule,
  PlayArrow,
  Menu,
  Logout,
  Add,
  Business,
  Inventory2,
  History,
  Assignment,
  QrCode2,
  Nfc,
  Close,
  LockReset,
} from "@mui/icons-material"
import { useNavigate, useLocation } from "react-router-dom"
import { useTask, type Task } from "../contexts/TaskContext"
import { apiService } from "../services/apiService"
import { authService } from "../services/authService"
import CreateCloudAccessUserNavigationItem from "./CreateCloudAccessUserNavigationItem"

const DRAWER_WIDTH = 0

const getStatusColor = (status: Task["status"]) => {
  switch (status) {
    case "Para iniciar":
      return "#2196f3"
    case "Em andamento":
      return "#ff9800"
    default:
      return "#9e9e9e"
  }
}

const getStatusBgColor = (status: Task["status"]) => {
  switch (status) {
    case "Para iniciar":
      return "#e3f2fd"
    case "Em andamento":
      return "#fff3e0"
    default:
      return "#f5f5f5"
  }
}

export default function TaskList() {
  const { tasks, loading, error, refreshTasks } = useTask()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userData, setUserData] = useState<{ username: string; email: string }>({
    username: "Usuário",
    email: "usuario@sistema.com",
  })
  const [dashboardUsername, setDashboardUsername] = useState("")
  const [generatingPdfTaskId, setGeneratingPdfTaskId] = useState<number | null>(null)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null)
  const [previewPdfFileName, setPreviewPdfFileName] = useState("")

  // Estado para controlar o auto-refresh
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date())

  // Registrar callback de navegação no authService
  useEffect(() => {
    const loadDashboardUsername = async () => {
      const authenticatedUser = authService.getUserData()
      try {
        setDashboardUsername(await apiService.getCurrentTechnicianUsername(authenticatedUser?.id, authenticatedUser?.username || ""))
      } catch {
        setDashboardUsername(authenticatedUser?.username || "")
      }
    }
    loadDashboardUsername()
  }, [])

  useEffect(() => {
    authService.setNavigationCallback((path: string) => {
      navigate(path, { replace: true })
    })
  }, [navigate])

  // Função para salvar dados no backend
  const saveDataToBackend = async () => {
    try {
      console.log("🔄 Enviando requisição POST para salvar dados...")

      const response = await authService.authenticatedFetch("http://192.168.15.29:7000/api/v1/historico/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        throw new Error(`Erro ao salvar dados: ${response.status} ${response.statusText}`)
      }

      console.log("✅ Dados salvos com sucesso no backend")

      // Após salvar, buscar dados atualizados
      await refreshTasks()
      setLastUpdateTime(new Date())
    } catch (error) {
      console.error("❌ Erro ao salvar dados:", error)
      // Não mostrar erro para o usuário, apenas logar
    }
  }

  // useEffect para configurar o intervalo de 10 segundos
  useEffect(() => {
    let intervalId: NodeJS.Timeout

    if (autoRefreshEnabled) {
      // Executar imediatamente na primeira vez
      saveDataToBackend()

      // Configurar intervalo de 10 segundos
      intervalId = setInterval(() => {
        saveDataToBackend()
      }, 10000)

      console.log("⏰ Auto-refresh ativado - executando a cada 10 segundos")
    }

    // Cleanup function para limpar o intervalo
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
        console.log("🛑 Auto-refresh desativado")
      }
    }
  }, [autoRefreshEnabled])

  // Função para toggle do auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled)
  }

  // ✅ CORREÇÃO: Obter dados do usuário com fallback robusto
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = authService.getUserData()
        if (user) {
          setUserData(user)
        }
      } catch (error) {
        console.error("❌ Erro ao carregar dados do usuário:", error)
        // Fallback para dados padrão se falhar
        setUserData({
          username: authService.getUserData()?.username || "Usuário",
          email: authService.getUserData()?.email || "usuario@sistema.com",
        })
      }
    }

    loadUserData()
  }, [])

  useEffect(() => {
    return () => {
      if (previewPdfUrl) {
        window.URL.revokeObjectURL(previewPdfUrl)
      }
    }
  }, [previewPdfUrl])

  console.log("👤 Dados do usuário no TaskList:", userData)

  const filteredTasks = tasks.filter((task) => {
    if (!task) return false

    const taskDesc = String(task.descricao || "").toLowerCase()
    const unitName = String(task.unidade?.nome_da_unidade || "").toLowerCase()
    const numChamado = String(task.numChamado || "").toLowerCase()
    const searchLower = searchTerm.toLowerCase()

    const matchesSearch =
      taskDesc.includes(searchLower) || unitName.includes(searchLower) || numChamado.includes(searchLower)
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Estatísticas
  const totalTasks = tasks.length
  const pendingTasks = tasks.filter((task) => task.status === "Para iniciar").length
  const inProgressTasks = tasks.filter((task) => task.status === "Em andamento").length

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleLogout = () => {
    authService.logout()
  }

  const handleClosePdfPreview = () => {
    if (previewPdfUrl) {
      window.URL.revokeObjectURL(previewPdfUrl)
    }

    setPreviewPdfUrl(null)
    setPreviewPdfFileName("")
  }

  const handleDownloadPdf = () => {
    if (!previewPdfUrl) {
      return
    }

    const downloadLink = document.createElement("a")
    downloadLink.href = previewPdfUrl
    downloadLink.download = previewPdfFileName || "checklist-tarefa.pdf"
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }

  const handleGenerateChecklist = async (taskId: number) => {
    try {
      setPdfError(null)
      setGeneratingPdfTaskId(taskId)
      const { blob, fileName } = await apiService.generateTaskChecklistPdf(taskId)

      if (previewPdfUrl) {
        window.URL.revokeObjectURL(previewPdfUrl)
      }

      const pdfUrl = window.URL.createObjectURL(blob)
      setPreviewPdfUrl(pdfUrl)
      setPreviewPdfFileName(fileName)
    } catch (err) {
      console.error("Erro ao gerar checklist em PDF:", err)
      setPdfError(err instanceof Error ? err.message : "Erro ao gerar checklist em PDF")
    } finally {
      setGeneratingPdfTaskId(null)
    }
  }

  // ✅ NOVO: Funções de navegação
  const handleNavigateToNewTask = () => {
    if (authService.shouldEnableFeatures()) {
      console.log("🚀 Navegando para Nova Tarefa")
      navigate("/nova-tarefa")
    }
  }

  const handleNavigateToHistory = () => {
    if (authService.shouldEnableFeatures()) {
      console.log("🚀 Navegando para Histórico")
      navigate("/historico")
    }
  }

  const handleNavigateToUnits = () => {
    if (authService.shouldEnableFeatures()) {
      console.log("🚀 Navegando para Unidades")
      navigate("/unidades")
    }
  }

  const handleNavigateToDashboard = () => {
    console.log("🚀 Navegando para Dashboard")
    navigate("/")
  }

  // ✅ NOVO: Verificar rota ativa
  const handleNavigateToQRCode = () => {
    if (authService.shouldEnableFeatures()) {
      navigate("/qrcode")
    }
  }

  const handleNavigateToRFID = () => {
    if (authService.shouldEnableFeatures()) {
      navigate("/rfid")
    }
  }

  const handleNavigateToPasswordReset = () => {
    if (authService.shouldEnableFeatures()) {
      navigate("/reset-senha-cloudaccess")
    }
  }

  const isActiveRoute = (path: string) => {
    return location.pathname === path
  }

  // Sidebar content - COM NAVEGAÇÃO FUNCIONAL
  const drawer = null

  if (loading) {
    return (
      <Box sx={{ display: "flex", height: "100vh" }}>
        <Box sx={{ width: DRAWER_WIDTH, flexShrink: 0 }}>{null}</Box>
        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "#f8f9fa" }}>
          <CircularProgress size={60} />
        </Box>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", height: "100vh" }}>
        <Box sx={{ width: DRAWER_WIDTH, flexShrink: 0 }}>{null}</Box>
        <Box sx={{ flexGrow: 1, p: 3, bgcolor: "#f8f9fa" }}>
          <Alert severity="error" action={<Button onClick={refreshTasks}>Tentar Novamente</Button>}>
            <Typography variant="h6">Erro ao carregar tarefas</Typography>
            <Typography variant="body2">{error}</Typography>
          </Alert>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#f8f9fa" }}>
      {/* Sidebar Desktop */}
      <Box
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          display: { xs: "none", md: "block" },
        }}
      >
        {null}
      </Box>

      {/* Sidebar Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH },
        }}
      >
        {null}
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, overflow: "auto" }}>
        {/* Top Bar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 3,
            bgcolor: "white",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton sx={{ display: { md: "none" } }} onClick={handleDrawerToggle}>
              <Menu />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#333" }}>
              Dashboard de Tarefas
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar sx={{ bgcolor: "#2196f3", width: 32, height: 32 }}>{userData.username?.charAt(0) || "U"}</Avatar>
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#333" }}>
                  {dashboardUsername || userData.username || "Usuário"}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          {/* Status de Autenticação */}
         

          {/* Métricas */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: "white", border: "1px solid #e0e0e0" }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
                        Total de Tarefas
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: "#333" }}>
                        {totalTasks}
                      </Typography>
                  
                    </Box>
                    <Assignment sx={{ fontSize: 40, color: "#e0e0e0" }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: "white", border: "1px solid #e0e0e0" }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
                        Em Andamento
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: "#ff9800" }}>
                        {inProgressTasks}
                      </Typography>
                    
                    </Box>
                    <PlayArrow sx={{ fontSize: 40, color: "#fff3e0" }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: "white", border: "1px solid #e0e0e0" }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
                        Pendentes
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: "#2196f3" }}>
                        {pendingTasks}
                      </Typography>
      
                    </Box>
                    <Schedule sx={{ fontSize: 40, color: "#e3f2fd" }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filtros */}
          <Card sx={{ mb: 3, bgcolor: "white", border: "1px solid #e0e0e0" }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Buscar por descrição, unidade ou número do chamado..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ color: "#999", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        fontSize: "0.95rem",
                        "&:hover": {
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#ccc",
                          },
                        },
                        "&.Mui-focused": {
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#2196f3",
                          },
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      displayEmpty
                      sx={{
                        borderRadius: 2,
                        fontSize: "0.95rem",
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#ccc",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#2196f3",
                        },
                      }}
                    >
                      <MenuItem value="all">Todos os status</MenuItem>
                      <MenuItem value="Para iniciar">Para iniciar</MenuItem>
                      <MenuItem value="Em andamento">Em andamento</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Indicador de Auto-refresh */}
          <Card sx={{ mb: 3, bgcolor: "white", border: "1px solid #e0e0e0" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: autoRefreshEnabled ? "#4caf50" : "#f44336",
                    }}
                  />
                  <Typography variant="body2" sx={{ color: "#666" }}>
                    Auto-atualização: {autoRefreshEnabled ? "Ativa" : "Inativa"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#999" }}>
                    Última atualização: {lastUpdateTime.toLocaleTimeString("pt-BR")}
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={toggleAutoRefresh}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.8rem",
                    borderColor: autoRefreshEnabled ? "#f44336" : "#4caf50",
                    color: autoRefreshEnabled ? "#f44336" : "#4caf50",
                    "&:hover": {
                      borderColor: autoRefreshEnabled ? "#d32f2f" : "#388e3c",
                      bgcolor: "transparent",
                    },
                  }}
                >
                  {autoRefreshEnabled ? "Pausar" : "Ativar"}
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Lista de Tarefas */}
          <Box>
            {pdfError && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setPdfError(null)}>
                {pdfError}
              </Alert>
            )}

            <Typography variant="h6" sx={{ mb: 3, color: "#333", fontWeight: 600 }}>
              Lista de Tarefas ({filteredTasks.length})
            </Typography>

            {tasks.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: "center", bgcolor: "white" }}>
                <Assignment sx={{ fontSize: 64, color: "#e0e0e0", mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Nenhuma tarefa encontrada
                </Typography>
                <Button variant="contained" onClick={refreshTasks}>
                  Recarregar
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {filteredTasks.map((task) => (
                  <Grid item xs={12} sm={6} lg={4} key={`task-${task.id}`}>
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        bgcolor: "white",
                        border: "1px solid #e0e0e0",
                        borderRadius: 2,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                          transform: "translateY(-2px)",
                          "& .task-title": {
                            color: "#2196f3",
                          },
                        },
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        {/* Header com status */}
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                          <Chip
                            label={task.status}
                            sx={{
                              bgcolor: getStatusBgColor(task.status),
                              color: getStatusColor(task.status),
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              height: 28,
                              borderRadius: 2,
                            }}
                          />
                          <Typography variant="caption" sx={{ color: "#999", fontWeight: 600 }}>
                            #{task.numChamado}
                          </Typography>
                        </Box>

                        {/* Título */}
                        <Typography
                          className="task-title"
                          variant="h6"
                          component="h3"
                          sx={{
                            fontWeight: 600,
                            color: "#333",
                            mb: 2,
                            lineHeight: 1.3,
                            fontSize: "1.1rem",
                            transition: "color 0.2s ease",
                          }}
                        >
                          {task.unidade?.nome_da_unidade || "Sem unidade"}
                        </Typography>

                        {/* Descrição */}
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#666",
                            fontSize: "0.9rem",
                            lineHeight: 1.5,
                            mb: 3,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {String(task.descricao)}
                        </Typography>

                        {/* Técnico */}
                        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                          <Avatar sx={{ width: 24, height: 24, bgcolor: "#2196f3", mr: 1, fontSize: "0.75rem" }}>
                            {task.nomeDoTecnico?.username?.charAt(0) || "T"}
                          </Avatar>
                          <Typography variant="caption" sx={{ color: "#999" }}>
                            {task.nomeDoTecnico?.username || "Não atribuído"}
                          </Typography>
                        </Box>

                        {/* Botão */}
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                          {task.status === "Em andamento" && (
                            <Button
                              variant="contained"
                              onClick={() => handleGenerateChecklist(task.id)}
                              disabled={generatingPdfTaskId === task.id}
                              fullWidth
                              sx={{
                                bgcolor: "#2196f3",
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: "0.9rem",
                                py: 1,
                                "&:hover": {
                                  bgcolor: "#1976d2",
                                },
                                "&:disabled": {
                                  bgcolor: "#90caf9",
                                  color: "white",
                                },
                              }}
                            >
                              {generatingPdfTaskId === task.id ? "Gerando PDF..." : "Gerar Checklist Automatico"}
                            </Button>
                          )}

                          <Button
                            variant="outlined"
                            startIcon={<Visibility sx={{ fontSize: 18 }} />}
                            onClick={() => navigate(`/task/${task.id}`)}
                            fullWidth
                            sx={{
                              borderColor: "#e0e0e0",
                              color: "#666",
                              textTransform: "none",
                              fontWeight: 500,
                              fontSize: "0.9rem",
                              py: 1,
                              "&:hover": {
                                borderColor: "#2196f3",
                                color: "#2196f3",
                                bgcolor: "transparent",
                              },
                            }}
                          >
                            Ver detalhes
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {filteredTasks.length === 0 && tasks.length > 0 && (
              <Paper sx={{ p: 6, textAlign: "center", bgcolor: "white" }}>
                <Search sx={{ fontSize: 64, color: "#e0e0e0", mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Nenhuma tarefa encontrada com os filtros aplicados
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                  }}
                >
                  Limpar Filtros
                </Button>
              </Paper>
            )}
          </Box>
        </Box>
      </Box>

      <Dialog
        open={!!previewPdfUrl}
        onClose={handleClosePdfPreview}
        fullWidth
        maxWidth="lg"
        sx={{
          "& .MuiDialog-paper": {
            width: { xs: "100%", sm: "90%" },
            maxHeight: { xs: "100vh", sm: "90vh" },
            m: { xs: 0, sm: 2 },
            borderRadius: { xs: 0, sm: 2 },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            pr: 1.5,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Preview do Checklist
          </Typography>
          <IconButton onClick={handleClosePdfPreview} aria-label="Fechar preview do checklist">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0, bgcolor: "#f5f7fa" }}>
          {previewPdfUrl ? (
            <Box sx={{ height: { xs: "70vh", md: "75vh" }, overflow: "auto" }}>
              <Box
                component="iframe"
                src={previewPdfUrl}
                title="Preview do Checklist"
                sx={{
                  width: "100%",
                  height: "100%",
                  border: 0,
                  bgcolor: "white",
                }}
              />
            </Box>
          ) : (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 320 }}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
          <Button onClick={handleClosePdfPreview} sx={{ textTransform: "none" }}>
            Fechar
          </Button>
          <Button variant="contained" onClick={handleDownloadPdf} disabled={!previewPdfUrl} sx={{ textTransform: "none" }}>
            Baixar PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
