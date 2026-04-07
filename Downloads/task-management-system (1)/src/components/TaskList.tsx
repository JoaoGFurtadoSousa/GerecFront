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
  History,
  Assignment,
  QrCode2,
  Nfc,
} from "@mui/icons-material"
import { useNavigate, useLocation } from "react-router-dom"
import { useTask, type Task } from "../contexts/TaskContext"
import { authService } from "../services/authService"

const DRAWER_WIDTH = 240

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

  // Estado para controlar o auto-refresh
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date())

  // Registrar callback de navegação no authService
  useEffect(() => {
    authService.setNavigationCallback((path: string) => {
      navigate(path, { replace: true })
    })
  }, [navigate])

  // Função para salvar dados no backend
  const saveDataToBackend = async () => {
    try {
      console.log("🔄 Enviando requisição POST para salvar dados...")

      const response = await authService.authenticatedFetch("http://192.168.0.101:8000/api/v1/historico/", {
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

  const isActiveRoute = (path: string) => {
    return location.pathname === path
  }

  // Sidebar content - COM NAVEGAÇÃO FUNCIONAL
  const drawer = (
    <Box sx={{ height: "100%", bgcolor: "#1a1a1a", color: "white" }}>
      <Box sx={{ p: 3, borderBottom: "1px solid #333" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Engineering sx={{ fontSize: 32, color: "#2196f3" }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: "white" }}>
            GerecTech
          </Typography>
        </Box>
      </Box>

      <List sx={{ px: 2, py: 1 }}>
        {/* 1. Dashboard - ATIVO */}
        <ListItem
          onClick={handleNavigateToDashboard}
          sx={{
            borderRadius: 2,
            mb: 1,
            bgcolor: isActiveRoute("/") ? "#2196f3" : "transparent",
            "&:hover": { bgcolor: isActiveRoute("/") ? "#1976d2" : "#333" },
            cursor: "pointer",
          }}
        >
          <ListItemIcon>
            <Dashboard sx={{ color: "white" }} />
          </ListItemIcon>
          <ListItemText
            primary="Dashboard"
            primaryTypographyProps={{
              fontSize: "0.9rem",
              fontWeight: 500,
              color: "white",
            }}
          />
        </ListItem>

        {/* 2. Nova Tarefa */}
        <ListItem
          onClick={handleNavigateToNewTask}
          sx={{
            borderRadius: 2,
            mb: 1,
            bgcolor: isActiveRoute("/nova-tarefa") ? "#4caf50" : "transparent",
            "&:hover": {
              bgcolor: authService.shouldEnableFeatures() ? (isActiveRoute("/nova-tarefa") ? "#388e3c" : "#333") : "transparent",
            },
            cursor: authService.shouldEnableFeatures() ? "pointer" : "not-allowed",
            opacity: authService.shouldEnableFeatures() ? 1 : 0.5,
          }}
        >
          <ListItemIcon>
            <Add sx={{ color: authService.shouldEnableFeatures() ? (isActiveRoute("/nova-tarefa") ? "white" : "#4caf50") : "#666" }} />
          </ListItemIcon>
          <ListItemText
            primary="Nova Tarefa"
            primaryTypographyProps={{
              fontSize: "0.9rem",
              color: authService.shouldEnableFeatures() ? (isActiveRoute("/nova-tarefa") ? "white" : "#ccc") : "#666",
            }}
          />
          {!authService.shouldEnableFeatures() && (
            <Typography variant="caption" sx={{ color: "#666", fontSize: "0.7rem" }}>
              Tokens válidos
            </Typography>
          )}
        </ListItem>

        {/* 3. Histórico */}
        <ListItem
          onClick={handleNavigateToHistory}
          sx={{
            borderRadius: 2,
            mb: 1,
            bgcolor: isActiveRoute("/historico") ? "#2196f3" : "transparent",
            "&:hover": {
              bgcolor: authService.shouldEnableFeatures() ? (isActiveRoute("/historico") ? "#1976d2" : "#333") : "transparent",
            },
            cursor: authService.shouldEnableFeatures() ? "pointer" : "not-allowed",
            opacity: authService.shouldEnableFeatures() ? 1 : 0.5,
          }}
        >
          <ListItemIcon>
            <History sx={{ color: authService.shouldEnableFeatures() ? (isActiveRoute("/historico") ? "white" : "#ccc") : "#666" }} />
          </ListItemIcon>
          <ListItemText
            primary="Histórico"
            primaryTypographyProps={{
              fontSize: "0.9rem",
              color: authService.shouldEnableFeatures() ? (isActiveRoute("/historico") ? "white" : "#ccc") : "#666",
            }}
          />
        </ListItem>

        {/* 4. Unidades */}
        <ListItem
          onClick={handleNavigateToUnits}
          sx={{
            borderRadius: 2,
            mb: 1,
            bgcolor: isActiveRoute("/unidades") ? "#2196f3" : "transparent",
            "&:hover": {
              bgcolor: authService.shouldEnableFeatures() ? (isActiveRoute("/unidades") ? "#1976d2" : "#333") : "transparent",
            },
            cursor: authService.shouldEnableFeatures() ? "pointer" : "not-allowed",
            opacity: authService.shouldEnableFeatures() ? 1 : 0.5,
          }}
        >
          <ListItemIcon>
            <Business sx={{ color: authService.shouldEnableFeatures() ? (isActiveRoute("/unidades") ? "white" : "#ccc") : "#666" }} />
          </ListItemIcon>
          <ListItemText
            primary="Unidades"
            primaryTypographyProps={{
              fontSize: "0.9rem",
              color: authService.shouldEnableFeatures() ? (isActiveRoute("/unidades") ? "white" : "#ccc") : "#666",
            }}
          />
        </ListItem>

        <Divider sx={{ my: 2, borderColor: "#333" }} />

        <ListItem
          onClick={handleNavigateToQRCode}
          sx={{
            borderRadius: 2,
            mb: 1,
            bgcolor: isActiveRoute("/qrcode") ? "#2196f3" : "transparent",
            "&:hover": {
              bgcolor: authService.shouldEnableFeatures() ? (isActiveRoute("/qrcode") ? "#1976d2" : "#333") : "transparent",
            },
            cursor: authService.shouldEnableFeatures() ? "pointer" : "not-allowed",
            opacity: authService.shouldEnableFeatures() ? 1 : 0.5,
          }}
        >
          <ListItemIcon>
            <QrCode2 sx={{ color: authService.shouldEnableFeatures() ? (isActiveRoute("/qrcode") ? "white" : "#ccc") : "#666" }} />
          </ListItemIcon>
          <ListItemText
            primary="Qrcode"
            primaryTypographyProps={{
              fontSize: "0.9rem",
              color: authService.shouldEnableFeatures() ? (isActiveRoute("/qrcode") ? "white" : "#ccc") : "#666",
            }}
          />
        </ListItem>

        <ListItem
          onClick={handleNavigateToRFID}
          sx={{
            borderRadius: 2,
            mb: 1,
            bgcolor: isActiveRoute("/rfid") ? "#2196f3" : "transparent",
            "&:hover": {
              bgcolor: authService.shouldEnableFeatures() ? (isActiveRoute("/rfid") ? "#1976d2" : "#333") : "transparent",
            },
            cursor: authService.shouldEnableFeatures() ? "pointer" : "not-allowed",
            opacity: authService.shouldEnableFeatures() ? 1 : 0.5,
          }}
        >
          <ListItemIcon>
            <Nfc sx={{ color: authService.shouldEnableFeatures() ? (isActiveRoute("/rfid") ? "white" : "#ccc") : "#666" }} />
          </ListItemIcon>
          <ListItemText
            primary="RFID"
            primaryTypographyProps={{
              fontSize: "0.9rem",
              color: authService.shouldEnableFeatures() ? (isActiveRoute("/rfid") ? "white" : "#ccc") : "#666",
            }}
          />
        </ListItem>

        {/* Divider antes do Sair */}
        <Divider sx={{ my: 2, borderColor: "#333" }} />

        {/* Sair - MANTIDO */}
        <ListItem
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            mb: 1,
            "&:hover": { bgcolor: "#d32f2f" },
            cursor: "pointer",
          }}
        >
          <ListItemIcon>
            <Logout sx={{ color: "#ccc" }} />
          </ListItemIcon>
          <ListItemText
            primary="Sair"
            primaryTypographyProps={{
              fontSize: "0.9rem",
              color: "#ccc",
            }}
          />
        </ListItem>
      </List>
    </Box>
  )

  if (loading) {
    return (
      <Box sx={{ display: "flex", height: "100vh" }}>
        <Box sx={{ width: DRAWER_WIDTH, flexShrink: 0 }}>{drawer}</Box>
        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "#f8f9fa" }}>
          <CircularProgress size={60} />
        </Box>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", height: "100vh" }}>
        <Box sx={{ width: DRAWER_WIDTH, flexShrink: 0 }}>{drawer}</Box>
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
        {drawer}
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
        {drawer}
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
                  {userData.username || "Usuário"}
                </Typography>
                <Typography variant="caption" sx={{ color: "#666" }}>
                  {userData.email || "usuario@sistema.com"}
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
                      <Typography variant="caption" sx={{ color: "#4caf50", display: "flex", alignItems: "center" }}>
                        <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                        +2.5%
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
                      <Typography variant="caption" sx={{ color: "#ff9800" }}>
                        Hoje
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
                      <Typography variant="caption" sx={{ color: "#2196f3", display: "flex", alignItems: "center" }}>
                        <Schedule sx={{ fontSize: 16, mr: 0.5 }} />
                        Para iniciar
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
    </Box>
  )
}
