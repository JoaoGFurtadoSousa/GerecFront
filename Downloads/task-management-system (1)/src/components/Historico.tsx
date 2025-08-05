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
} from "@mui/material"
import {
  Search,
  Settings,
  Dashboard,
  Engineering,
  Analytics,
  CheckCircle,
  Menu,
  Logout,
  ArrowBack,
  History,
  CalendarToday,
  Person,
} from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { authService } from "../services/authService"

const DRAWER_WIDTH = 240

interface HistoricoTask {
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
  descricao_realizada?: string
  data_inicio?: string
  data_finalizacao?: string
}

export default function Historico() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<HistoricoTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [mobileOpen, setMobileOpen] = useState(false)

  // Adicionar após os outros estados
  const [userInfo, setUserInfo] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)

  // Obter dados do usuário
  const userData = authService.getUserData()

  // Função para buscar informações do usuário
  const fetchUserInfo = async () => {
    try {
      setLoadingUser(true)
      console.log("🔄 Buscando informações do usuário...")

      const response = await authService.authenticatedFetch("http://192.168.0.102:8000/api/v1/usuario/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
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

  // Função para buscar dados do histórico
  const fetchHistorico = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("🔄 Buscando histórico de tarefas...")

      const response = await authService.authenticatedFetch("http://192.168.0.102:8000/api/v1/historico/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Erro ao buscar histórico: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("✅ Histórico recebido:", data)

      // Garantir que sempre retornamos um array
      if (Array.isArray(data)) {
        setTasks(data)
      } else {
        console.warn("⚠️ API não retornou um array, definindo array vazio")
        setTasks([])
      }
    } catch (err) {
      console.error("❌ Erro ao buscar histórico:", err)
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar histórico"
      setError(errorMessage)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  // Carregar dados ao montar o componente
  useEffect(() => {
    fetchHistorico()
  }, [])

  // Carregar dados do usuário ao montar o componente
  useEffect(() => {
    fetchUserInfo()
  }, [])

  // Filtrar tarefas baseado na busca
  const filteredTasks = tasks.filter((task) => {
    if (!task) return false

    const taskDesc = String(task.descricao || "").toLowerCase()
    const unitName = String(task.unidade?.nome_da_unidade || "").toLowerCase()
    const numChamado = String(task.numChamado || "").toLowerCase()
    const tecnicoNome = String(task.nomeDoTecnico?.nome || "").toLowerCase()
    const searchLower = searchTerm.toLowerCase()

    return (
      taskDesc.includes(searchLower) ||
      unitName.includes(searchLower) ||
      numChamado.includes(searchLower) ||
      tecnicoNome.includes(searchLower)
    )
  })

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
          onClick={() => navigate("/")}
          sx={{
            borderRadius: 2,
            mb: 1,
            "&:hover": { bgcolor: "#333" },
            cursor: "pointer",
          }}
        >
          <ListItemIcon>
            <Dashboard sx={{ color: "#ccc" }} />
          </ListItemIcon>
          <ListItemText
            primary="Dashboard"
            primaryTypographyProps={{
              fontSize: "0.9rem",
              color: "#ccc",
            }}
          />
        </ListItem>

        <ListItem
          sx={{
            borderRadius: 2,
            mb: 1,
            bgcolor: "#2196f3",
            "&:hover": { bgcolor: "#1976d2" },
          }}
        >
          <ListItemIcon>
            <History sx={{ color: "white" }} />
          </ListItemIcon>
          <ListItemText
            primary="Histórico"
            primaryTypographyProps={{
              fontSize: "0.9rem",
              fontWeight: 500,
              color: "white",
            }}
          />
        </ListItem>

        <ListItem
          sx={{
            borderRadius: 2,
            mb: 1,
            "&:hover": { bgcolor: "#333" },
            cursor: "pointer",
          }}
        >
          <ListItemIcon>
            <Engineering sx={{ color: "#ccc" }} />
          </ListItemIcon>
          <ListItemText
            primary="Equipamentos"
            primaryTypographyProps={{
              fontSize: "0.9rem",
              color: "#ccc",
            }}
          />
        </ListItem>

        <ListItem
          sx={{
            borderRadius: 2,
            mb: 1,
            "&:hover": { bgcolor: "#333" },
            cursor: "pointer",
          }}
        >
          <ListItemIcon>
            <Analytics sx={{ color: "#ccc" }} />
          </ListItemIcon>
          <ListItemText
            primary="Relatórios"
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

  // Função para formatar data
  const formatDate = (dateString: string) => {
    if (!dateString) return "Data não informada"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Data inválida"
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", height: "100vh" }}>
        <Box sx={{ width: DRAWER_WIDTH, flexShrink: 0 }}>{drawer}</Box>
        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "#f8f9fa" }}>
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Carregando histórico...
            </Typography>
          </Box>
        </Box>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", height: "100vh" }}>
        <Box sx={{ width: DRAWER_WIDTH, flexShrink: 0 }}>{drawer}</Box>
        <Box sx={{ flexGrow: 1, p: 3, bgcolor: "#f8f9fa" }}>
          <Alert severity="error" action={<Button onClick={fetchHistorico}>Tentar Novamente</Button>}>
            <Typography variant="h6">Erro ao carregar histórico</Typography>
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
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate("/")}
              sx={{ color: "#666", textTransform: "none" }}
            >
              Voltar ao Dashboard
            </Button>
          </Box>

          {/* Na seção Top Bar, substituir o Box com notificações e avatar por: */}
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
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <History sx={{ fontSize: 32, color: "#4caf50" }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: "#333" }}>
                Histórico de Tarefas
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ color: "#666" }}>
              Visualize todas as tarefas que foram concluídas com sucesso
            </Typography>
          </Box>

          {/* Estatísticas */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ bgcolor: "white", border: "1px solid #e0e0e0" }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
                        Total Concluídas
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: "#4caf50" }}>
                        {tasks.length}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#4caf50" }}>
                        Tarefas finalizadas
                      </Typography>
                    </Box>
                    <CheckCircle sx={{ fontSize: 40, color: "#e8f5e8" }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ bgcolor: "white", border: "1px solid #e0e0e0" }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
                        Filtradas
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: "#2196f3" }}>
                        {filteredTasks.length}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#2196f3" }}>
                        Resultados da busca
                      </Typography>
                    </Box>
                    <Search sx={{ fontSize: 40, color: "#e3f2fd" }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filtro de Busca */}
          <Card sx={{ mb: 3, bgcolor: "white", border: "1px solid #e0e0e0" }}>
            <CardContent>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Buscar por descrição, unidade, chamado ou técnico..."
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
            </CardContent>
          </Card>

          {/* Lista de Tarefas do Histórico */}
          <Box>
            <Typography variant="h6" sx={{ mb: 3, color: "#333", fontWeight: 600 }}>
              Tarefas Concluídas ({filteredTasks.length})
            </Typography>

            {tasks.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: "center", bgcolor: "white" }}>
                <History sx={{ fontSize: 64, color: "#e0e0e0", mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Nenhuma tarefa concluída encontrada
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  As tarefas finalizadas aparecerão aqui
                </Typography>
                <Button variant="contained" onClick={fetchHistorico}>
                  Recarregar
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {filteredTasks.map((task) => (
                  <Grid item xs={12} sm={6} lg={4} key={`historico-${task.id}`}>
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
                        },
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        {/* Header com status */}
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                          <Chip
                            label="Concluído"
                            sx={{
                              bgcolor: "#e8f5e8",
                              color: "#4caf50",
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
                          variant="h6"
                          component="h3"
                          sx={{
                            fontWeight: 600,
                            color: "#333",
                            mb: 2,
                            lineHeight: 1.3,
                            fontSize: "1.1rem",
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
                            mb: 2,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {String(task.descricao)}
                        </Typography>

                        {/* Técnico */}
                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                          <Person sx={{ fontSize: 16, color: "#999", mr: 1 }} />
                          <Typography variant="caption" sx={{ color: "#666" }}>
                            {task.nomeDoTecnico?.nome || "Não informado"}
                          </Typography>
                        </Box>

                        {/* Data de conclusão */}
                        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                          <CalendarToday sx={{ fontSize: 16, color: "#999", mr: 1 }} />
                          <Typography variant="caption" sx={{ color: "#666" }}>
                            Concluído em: {formatDate(task.data_finalizacao || task.dataTarefa)}
                          </Typography>
                        </Box>

                        {/* Descrição realizada (se disponível) */}
                        {task.descricao_realizada && (
                          <Box
                            sx={{
                              bgcolor: "#f8f9fa",
                              p: 2,
                              borderRadius: 1,
                              border: "1px solid #e9ecef",
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ color: "#666", fontWeight: 600, display: "block", mb: 1 }}
                            >
                              Trabalho Realizado:
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#333",
                                fontSize: "0.85rem",
                                lineHeight: 1.4,
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {task.descricao_realizada}
                            </Typography>
                          </Box>
                        )}
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
                <Button variant="outlined" onClick={() => setSearchTerm("")}>
                  Limpar Busca
                </Button>
              </Paper>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
