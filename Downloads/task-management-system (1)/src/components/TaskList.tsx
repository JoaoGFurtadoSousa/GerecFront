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
  AlertTitle,
} from "@mui/material"
import {
  Visibility,
  Search,
  Settings,
  Dashboard,
  Assignment,
  Engineering,
  Analytics,
  TrendingUp,
  CheckCircle,
  Schedule,
  PlayArrow,
  Menu,
  Logout,
  Sync,
  Add,
  Warning,
  Wifi,
  WifiOff,
  Business,
} from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { useTask, type Task } from "../contexts/TaskContext"
import { authService } from "../services/authService"
import NewTaskModal from "./NewTaskModal"

const DRAWER_WIDTH = 240
const API_BASE_URL = "http://192.168.15.17:8000/api/v1"

const getStatusColor = (status: Task["status"]) => {
  switch (status) {
    case "Para iniciar":
      return "#2196f3"
    case "Em andamento":
      return "#ff9800"
    case "Concluído":
      return "#4caf50"
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
    case "Concluído":
      return "#e8f5e8"
    default:
      return "#f5f5f5"
  }
}

// Adicionar estilos CSS para animação
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

export default function TaskList() {
  const { tasks, loading, error, refreshTasks, clearError } = useTask()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [mobileOpen, setMobileOpen] = useState(false)

  // Estado para controlar o auto-refresh
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date())
  const [isUpdating, setIsUpdating] = useState(false)

  // Estados para conectividade
  const [serverOnline, setServerOnline] = useState<boolean | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Estados para usuário
  const [userInfo, setUserInfo] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [showNewTaskModal, setShowNewTaskModal] = useState(false)

  // Função para verificar conectividade do servidor
  const checkServerStatus = async () => {
    try {
      // Fazer uma requisição simples para testar conectividade
      await authService.authenticatedFetch(`${API_BASE_URL}/tarefas/`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      })
      setServerOnline(true)
      setConnectionError(null)
      return true
    } catch (error) {
      setServerOnline(false)
      setConnectionError("Erro ao verificar conectividade")
      return false
    }
  }

  // Função para buscar informações do usuário
  const fetchUserInfo = async () => {
    try {
      setLoadingUser(true)
      console.log("🔄 Buscando informações do usuário...")
      const response = await authService.authenticatedFetch("http://192.168.15.17:8000/api/v1/usuario/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(10000),
      })
      if (!response.ok) {
        throw new Error(`Erro ao buscar usuário: ${response.status} ${response.statusText}`)
      }
      const userData = await response.json()
      console.log("✅ Dados do usuário recebidos:", userData)
      setUserInfo(userData)
    } catch (err) {
      console.error("❌ Erro ao buscar dados do usuário:", err)
      // Em caso de erro, usar dados do localStorage como fallback
      const fallbackUser = authService.getUserData()
      setUserInfo(fallbackUser)
    } finally {
      setLoadingUser(false)
    }
  }

  // Função para atualizar apenas as tarefas E fazer ping na migração
  const saveDataAndRefreshTasks = async () => {
    try {
      setIsUpdating(true)
      console.log("🔄 Atualizando lista de tarefas...")
      // 1. Fazer ping no endpoint de migração PRIMEIRO
      try {
        console.log("📡 Fazendo ping no endpoint de migração...")
        const migrationResponse = await authService.authenticatedFetch("http://192.168.15.17:8000/api/v1/enviar/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({}), // Corpo vazio para o POST
          signal: AbortSignal.timeout(5000), // Timeout menor para migração
        })
        if (migrationResponse.ok) {
          console.log("✅ Ping de migração enviado com sucesso")
        } else {
          console.warn("⚠️ Ping de migração falhou:", migrationResponse.status, migrationResponse.statusText)
        }
      } catch (migrationError) {
        console.warn("⚠️ Erro no ping de migração (continuando com refresh):", migrationError)
        // Não interromper o processo se a migração falhar
      }
      // 2. Buscar as tarefas atualizadas
      await refreshTasks()
      setLastUpdateTime(new Date())
      console.log("✅ Lista de tarefas atualizada com sucesso")
    } catch (error) {
      console.error("❌ Erro ao atualizar tarefas:", error)
      setConnectionError(error instanceof Error ? error.message : "Erro ao atualizar tarefas")
    } finally {
      setIsUpdating(false)
    }
  }

  // Função para refresh manual (incluindo migração)
  const handleManualRefresh = () => {
    clearError()
    setConnectionError(null)
    console.log("🔄 Refresh manual iniciado - incluindo ping de migração")
    saveDataAndRefreshTasks()
  }

  // useEffect para configurar o intervalo de 10 segundos
  useEffect(() => {
    let intervalId
    if (autoRefreshEnabled) {
      // Executar imediatamente na primeira vez
      saveDataAndRefreshTasks()
      // Configurar intervalo de 10 segundos
      intervalId = setInterval(() => {
        saveDataAndRefreshTasks()
      }, 10000) // 10 segundos
      console.log("⏰ Auto-refresh ativado - executando a cada 10 segundos")
    }
    // Cleanup function para limpar o intervalo
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
        console.log("🛑 Auto-refresh desativado")
      }
    }
  }, [autoRefreshEnabled]) // Dependência para recriar o intervalo se o estado mudar

  // Carregar dados do usuário ao montar o componente
  useEffect(() => {
    fetchUserInfo()
  }, [])

  // Verificar conectividade inicial
  useEffect(() => {
    checkServerStatus()
  }, [])

  // Função para toggle do auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled)
  }

  // Obter dados do usuário
  const userData = authService.getUserData()

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
  const completedTasks = tasks.filter((task) => task.status === "Concluído").length

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleLogout = () => {
    authService.logout()
  }

  // Sidebar content
  const drawer = (
    <Box sx={{ height: "100%", bgcolor: "#1a1a1a", color: "white" }}>
      <Box sx={{ p: 3, borderBottom: "1px solid #333" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Engineering sx={{ fontSize: 32, color: "#2196f3" }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: "white" }}>
            TaskPulse
          </Typography>
        </Box>
      </Box>
      <List sx={{ px: 2, py: 1 }}>
        <ListItem
          sx={{
            borderRadius: 2,
            mb: 1,
            bgcolor: "#2196f3",
            "&:hover": { bgcolor: "#1976d2" },
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
        <ListItem
          onClick={() => navigate("/historico")}
          sx={{
            borderRadius: 2,
            mb: 1,
            "&:hover": { bgcolor: "#333" },
            cursor: "pointer",
          }}
        >
          <ListItemIcon>
            <Assignment sx={{ color: "#ccc" }} />
          </ListItemIcon>
          <ListItemText
            primary="Histórico"
            primaryTypographyProps={{
              fontSize: "0.9rem",
              color: "#ccc",
            }}
          />
        </ListItem>
        <ListItem
          onClick={() => setShowNewTaskModal(true)}
          sx={{
            borderRadius: 2,
            mb: 1,
            "&:hover": { bgcolor: "#333" },
            cursor: "pointer",
          }}
        >
          <ListItemIcon>
            <Add sx={{ color: "#ccc" }} />
          </ListItemIcon>
          <ListItemText
            primary="Nova Tarefa"
            primaryTypographyProps={{
              fontSize: "0.9rem",
              color: "#ccc",
            }}
          />
        </ListItem>
        <ListItem
          onClick={() => navigate("/unidades")}
          sx={{
            borderRadius: 2,
            mb: 1,
            "&:hover": { bgcolor: "#333" },
            cursor: "pointer",
          }}
        >
          <ListItemIcon>
            <Business sx={{ color: "#ccc" }} />
          </ListItemIcon>
          <ListItemText
            primary="Unidades"
            primaryTypographyProps={{
              fontSize: "0.9rem",
              color: "#ccc",
            }}
          />
        </ListItem>
        <Divider sx={{ my: 2, borderColor: "#333" }} />
        <ListItem
          sx={{
            borderRadius: 2,
            mb: 1,
            "&:hover": { bgcolor: "#333" },
            cursor: "pointer",
          }}
        >
          <ListItemIcon>
            <Settings sx={{ color: "#ccc" }} />
          </ListItemIcon>
          <ListItemText
            primary="Configurações"
            primaryTypographyProps={{
              fontSize: "0.9rem",
              color: "#ccc",
            }}
          />
        </ListItem>
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

  // Injetar CSS no head
  useEffect(() => {
    const style = document.createElement("style")
    style.textContent = pulseKeyframes
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  if (loading) {
    return (
      <Box sx={{ display: "flex", height: "100vh" }}>
        <Box sx={{ width: DRAWER_WIDTH, flexShrink: 0 }}>{drawer}</Box>
        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "#f8f9fa" }}>
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Carregando tarefas...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Conectando ao servidor...
            </Typography>
          </Box>
        </Box>
      </Box>
    )
  }

  if (error || connectionError) {
    return (
      <Box sx={{ display: "flex", height: "100vh" }}>
        <Box sx={{ width: DRAWER_WIDTH, flexShrink: 0 }}>{drawer}</Box>
        <Box sx={{ flexGrow: 1, p: 3, bgcolor: "#f8f9fa" }}>
          <Alert
            severity="error"
            icon={<WifiOff />}
            action={
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button onClick={checkServerStatus} size="small">
                  Verificar Conexão
                </Button>
                <Button onClick={handleManualRefresh} size="small">
                  Tentar Novamente
                </Button>
              </Box>
            }
          >
            <AlertTitle>Erro de Conexão</AlertTitle>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {error || connectionError}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "0.85rem", color: "#666" }}>
              Verifique se:
            </Typography>
            <Box component="ul" sx={{ fontSize: "0.85rem", color: "#666", mt: 1, pl: 2 }}>
              <li>O servidor está rodando no IP 192.168.15.17:8000</li>
              <li>Sua conexão com a internet está funcionando</li>
              <li>Não há bloqueios de firewall</li>
            </Box>
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
            {/* Indicador de conectividade */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {serverOnline === true && <Wifi sx={{ color: "#4caf50", fontSize: 20 }} />}
              {serverOnline === false && <WifiOff sx={{ color: "#f44336", fontSize: 20 }} />}
              {serverOnline === null && <CircularProgress size={16} />}
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ bgcolor: "#2196f3", width: 32, height: 32 }}>
                {loadingUser ? "..." : userInfo?.nome?.charAt(0) || userData?.nome?.charAt(0) || "U"}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#333" }}>
                  {loadingUser ? "Carregando..." : userInfo?.nome || userData?.nome || "Usuário"}
                </Typography>
                <Typography variant="caption" sx={{ color: "#666" }}>
                  {userInfo?.email || userData?.email || ""}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        {/* Content */}
        <Box sx={{ p: 3 }}>
          {/* Alerta de conectividade se houver problemas */}
          {(connectionError || serverOnline === false) && (
            <Alert severity="warning" sx={{ mb: 3 }} icon={<Warning />}>
              <Typography variant="body2">
                Problemas de conectividade detectados. Algumas funcionalidades podem não estar disponíveis.
              </Typography>
            </Alert>
          )}

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
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: "white", border: "1px solid #e0e0e0" }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
                        Concluídas
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: "#4caf50" }}>
                        {completedTasks}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#4caf50", display: "flex", alignItems: "center" }}>
                        <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                        +12.3%
                      </Typography>
                    </Box>
                    <CheckCircle sx={{ fontSize: 40, color: "#e8f5e8" }} />
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
                      <MenuItem value="Concluído">Concluído</MenuItem>
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
                      bgcolor: autoRefreshEnabled && serverOnline ? "#4caf50" : "#f44336",
                      animation: autoRefreshEnabled && serverOnline ? "pulse 2s infinite" : "none",
                    }}
                  />
                  <Typography variant="body2" sx={{ color: "#666" }}>
                    Auto-atualização: {autoRefreshEnabled && serverOnline ? "Ativa" : "Inativa"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#999" }}>
                    Última atualização: {lastUpdateTime.toLocaleTimeString("pt-BR")} | Migração: Ativa
                  </Typography>
                  {isUpdating && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="caption" sx={{ color: "#2196f3" }}>
                        Atualizando...
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Sync />}
                    onClick={handleManualRefresh}
                    disabled={isUpdating}
                    sx={{
                      textTransform: "none",
                      fontSize: "0.8rem",
                      borderColor: "#2196f3",
                      color: "#2196f3",
                      "&:hover": {
                        borderColor: "#1976d2",
                        bgcolor: "transparent",
                      },
                    }}
                  >
                    Atualizar Agora
                  </Button>
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
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {serverOnline === false
                    ? "Verifique a conexão com o servidor"
                    : "As tarefas aparecerão aqui quando disponíveis"}
                </Typography>
                <Button variant="contained" onClick={handleManualRefresh} disabled={isUpdating}>
                  {isUpdating ? "Carregando..." : "Recarregar"}
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
                            {task.nomeDoTecnico?.nome?.charAt(0) || "T"}
                          </Avatar>
                          <Typography variant="caption" sx={{ color: "#666" }}>
                            {task.nomeDoTecnico?.nome || "Não atribuído"}
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
      {/* Modal Nova Tarefa */}
      <NewTaskModal
        open={showNewTaskModal}
        onClose={() => setShowNewTaskModal(false)}
        onSuccess={() => {
          setShowNewTaskModal(false)
          handleManualRefresh()
        }}
      />
    </Box>
  )
}
