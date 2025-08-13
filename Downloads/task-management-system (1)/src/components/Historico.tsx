"use client"

import { useState } from "react"
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
  Pagination,
  InputAdornment,
} from "@mui/material"
import {
  ArrowBack,
  Search,
  Engineering,
  Dashboard,
  Add,
  Business,
  History,
  Assignment,
  Menu,
  Logout,
  Notifications,
  CheckCircle,
  Cancel,
  PlayArrow,
  TrendingUp,
} from "@mui/icons-material"
import { useNavigate, useLocation } from "react-router-dom"
import { authService } from "../services/authService"

const DRAWER_WIDTH = 240
const ITEMS_PER_PAGE = 6

interface HistoricoTask {
  id: number
  nome: string
  descricao: string
  unidade: string
  tecnico: string
  status: "Concluído" | "Cancelado" | "Em andamento"
  dataInicio: string
  dataFim?: string
  prioridade: "baixa" | "media" | "alta" | "urgente"
}

// Dados mockados para o histórico
const mockHistoricoTasks: HistoricoTask[] = [
  {
    id: 1,
    nome: "Manutenção Preventiva - Ar Condicionado",
    descricao: "Limpeza e verificação do sistema de ar condicionado",
    unidade: "Unidade Centro",
    tecnico: "João Silva",
    status: "Concluído",
    dataInicio: "2024-01-15",
    dataFim: "2024-01-15",
    prioridade: "media",
  },
  {
    id: 2,
    nome: "Reparo Elétrico - Sala 201",
    descricao: "Troca de disjuntor e verificação da instalação elétrica",
    unidade: "Unidade Norte",
    tecnico: "Maria Santos",
    status: "Concluído",
    dataInicio: "2024-01-14",
    dataFim: "2024-01-14",
    prioridade: "alta",
  },
  {
    id: 3,
    nome: "Instalação de Equipamento",
    descricao: "Instalação de novo equipamento de segurança",
    unidade: "Unidade Sul",
    tecnico: "Pedro Oliveira",
    status: "Cancelado",
    dataInicio: "2024-01-13",
    prioridade: "baixa",
  },
  {
    id: 4,
    nome: "Manutenção Corretiva - Elevador",
    descricao: "Reparo do sistema de elevador principal",
    unidade: "Unidade Centro",
    tecnico: "Ana Costa",
    status: "Em andamento",
    dataInicio: "2024-01-12",
    prioridade: "urgente",
  },
  {
    id: 5,
    nome: "Limpeza de Reservatório",
    descricao: "Limpeza e desinfecção do reservatório de água",
    unidade: "Unidade Leste",
    tecnico: "Carlos Ferreira",
    status: "Concluído",
    dataInicio: "2024-01-11",
    dataFim: "2024-01-11",
    prioridade: "media",
  },
  {
    id: 6,
    nome: "Pintura Externa",
    descricao: "Pintura da fachada externa do prédio",
    unidade: "Unidade Oeste",
    tecnico: "João Silva",
    status: "Concluído",
    dataInicio: "2024-01-10",
    dataFim: "2024-01-12",
    prioridade: "baixa",
  },
  {
    id: 7,
    nome: "Manutenção de Jardim",
    descricao: "Poda e manutenção das áreas verdes",
    unidade: "Unidade Norte",
    tecnico: "Maria Santos",
    status: "Concluído",
    dataInicio: "2024-01-09",
    dataFim: "2024-01-09",
    prioridade: "baixa",
  },
  {
    id: 8,
    nome: "Reparo de Vazamento",
    descricao: "Reparo de vazamento na tubulação principal",
    unidade: "Unidade Sul",
    tecnico: "Pedro Oliveira",
    status: "Cancelado",
    dataInicio: "2024-01-08",
    prioridade: "alta",
  },
]

const getStatusColor = (status: HistoricoTask["status"]) => {
  switch (status) {
    case "Concluído":
      return "#4caf50"
    case "Cancelado":
      return "#f44336"
    case "Em andamento":
      return "#ff9800"
    default:
      return "#9e9e9e"
  }
}

const getStatusBgColor = (status: HistoricoTask["status"]) => {
  switch (status) {
    case "Concluído":
      return "#e8f5e8"
    case "Cancelado":
      return "#ffebee"
    case "Em andamento":
      return "#fff3e0"
    default:
      return "#f5f5f5"
  }
}

const getPriorityColor = (prioridade: HistoricoTask["prioridade"]) => {
  switch (prioridade) {
    case "urgente":
      return "#f44336"
    case "alta":
      return "#ff9800"
    case "media":
      return "#2196f3"
    case "baixa":
      return "#4caf50"
    default:
      return "#9e9e9e"
  }
}

export default function Historico() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)

  const userData = authService.getUserData() || {
    nome: "Usuário",
    email: "usuario@sistema.com",
  }

  const featuresEnabled = authService.shouldEnableFeatures()

  // Filtrar tarefas
  const filteredTasks = mockHistoricoTasks.filter((task) => {
    const matchesSearch =
      task.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.unidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.tecnico.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Paginação
  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedTasks = filteredTasks.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Estatísticas
  const totalTasks = mockHistoricoTasks.length
  const completedTasks = mockHistoricoTasks.filter((task) => task.status === "Concluído").length
  const canceledTasks = mockHistoricoTasks.filter((task) => task.status === "Cancelado").length
  const inProgressTasks = mockHistoricoTasks.filter((task) => task.status === "Em andamento").length

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleLogout = () => {
    authService.logout()
  }

  const isActiveRoute = (path: string) => {
    return location.pathname === path
  }

  const handleNavigateToDashboard = () => {
    navigate("/")
  }

  const handleNavigateToNewTask = () => {
    if (featuresEnabled) {
      navigate("/nova-tarefa")
    }
  }

  const handleNavigateToHistory = () => {
    navigate("/historico")
  }

  const handleNavigateToUnits = () => {
    if (featuresEnabled) {
      navigate("/unidades")
    }
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

        <ListItem
          onClick={handleNavigateToNewTask}
          sx={{
            borderRadius: 2,
            mb: 1,
            bgcolor: isActiveRoute("/nova-tarefa") ? "#4caf50" : "transparent",
            "&:hover": {
              bgcolor: featuresEnabled ? (isActiveRoute("/nova-tarefa") ? "#388e3c" : "#333") : "transparent",
            },
            cursor: featuresEnabled ? "pointer" : "not-allowed",
            opacity: featuresEnabled ? 1 : 0.5,
          }}
        >
          <ListItemIcon>
            <Add sx={{ color: featuresEnabled ? (isActiveRoute("/nova-tarefa") ? "white" : "#4caf50") : "#666" }} />
          </ListItemIcon>
          <ListItemText
            primary="Nova Tarefa"
            primaryTypographyProps={{
              fontSize: "0.9rem",
              color: featuresEnabled ? (isActiveRoute("/nova-tarefa") ? "white" : "#ccc") : "#666",
            }}
          />
        </ListItem>

        <ListItem
          onClick={handleNavigateToHistory}
          sx={{
            borderRadius: 2,
            mb: 1,
            bgcolor: isActiveRoute("/historico") ? "#2196f3" : "transparent",
            "&:hover": {
              bgcolor: isActiveRoute("/historico") ? "#1976d2" : "#333",
            },
            cursor: "pointer",
          }}
        >
          <ListItemIcon>
            <History sx={{ color: isActiveRoute("/historico") ? "white" : "#ccc" }} />
          </ListItemIcon>
          <ListItemText
            primary="Histórico"
            primaryTypographyProps={{
              fontSize: "0.9rem",
              color: isActiveRoute("/historico") ? "white" : "#ccc",
            }}
          />
        </ListItem>

        <ListItem
          onClick={handleNavigateToUnits}
          sx={{
            borderRadius: 2,
            mb: 1,
            bgcolor: isActiveRoute("/unidades") ? "#2196f3" : "transparent",
            "&:hover": {
              bgcolor: featuresEnabled ? (isActiveRoute("/unidades") ? "#1976d2" : "#333") : "transparent",
            },
            cursor: featuresEnabled ? "pointer" : "not-allowed",
            opacity: featuresEnabled ? 1 : 0.5,
          }}
        >
          <ListItemIcon>
            <Business sx={{ color: featuresEnabled ? (isActiveRoute("/unidades") ? "white" : "#ccc") : "#666" }} />
          </ListItemIcon>
          <ListItemText
            primary="Unidades"
            primaryTypographyProps={{
              fontSize: "0.9rem",
              color: featuresEnabled ? (isActiveRoute("/unidades") ? "white" : "#ccc") : "#666",
            }}
          />
        </ListItem>

        <Divider sx={{ my: 2, borderColor: "#333" }} />

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
              sx={{ textTransform: "none", color: "#666" }}
            >
              Voltar
            </Button>
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#333" }}>
              Histórico de Tarefas
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton>
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar sx={{ bgcolor: "#2196f3", width: 32, height: 32 }}>{userData.nome?.charAt(0) || "U"}</Avatar>
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#333" }}>
                  {userData.nome || "Usuário"}
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
          {/* Estatísticas */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: "white", border: "1px solid #e0e0e0" }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
                        Total
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: "#333" }}>
                        {totalTasks}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#4caf50", display: "flex", alignItems: "center" }}>
                        <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                        Histórico
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
                        Concluídas
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: "#4caf50" }}>
                        {completedTasks}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#4caf50" }}>
                        Finalizadas
                      </Typography>
                    </Box>
                    <CheckCircle sx={{ fontSize: 40, color: "#e8f5e8" }} />
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
                        Canceladas
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: "#f44336" }}>
                        {canceledTasks}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#f44336" }}>
                        Não realizadas
                      </Typography>
                    </Box>
                    <Cancel sx={{ fontSize: 40, color: "#ffebee" }} />
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
                        Ativas
                      </Typography>
                    </Box>
                    <PlayArrow sx={{ fontSize: 40, color: "#fff3e0" }} />
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
                    placeholder="Buscar por nome, unidade ou técnico..."
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
                      sx={{ borderRadius: 2, fontSize: "0.95rem" }}
                    >
                      <MenuItem value="all">Todos os status</MenuItem>
                      <MenuItem value="Concluído">Concluído</MenuItem>
                      <MenuItem value="Cancelado">Cancelado</MenuItem>
                      <MenuItem value="Em andamento">Em andamento</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Lista de Tarefas */}
          <Box>
            <Typography variant="h6" sx={{ mb: 3, color: "#333", fontWeight: 600 }}>
              Tarefas ({filteredTasks.length})
            </Typography>

            {paginatedTasks.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: "center", bgcolor: "white" }}>
                <History sx={{ fontSize: 64, color: "#e0e0e0", mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Nenhuma tarefa encontrada
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
            ) : (
              <>
                <Grid container spacing={3}>
                  {paginatedTasks.map((task) => (
                    <Grid item xs={12} sm={6} lg={4} key={task.id}>
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
                          {/* Header com status e prioridade */}
                          <Box
                            sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}
                          >
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
                            <Chip
                              label={task.prioridade.toUpperCase()}
                              size="small"
                              sx={{
                                bgcolor: getPriorityColor(task.prioridade),
                                color: "white",
                                fontWeight: 600,
                                fontSize: "0.7rem",
                              }}
                            />
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
                            {task.nome}
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
                            {task.descricao}
                          </Typography>

                          {/* Unidade */}
                          <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
                            <strong>Unidade:</strong> {task.unidade}
                          </Typography>

                          {/* Técnico */}
                          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                            <Avatar sx={{ width: 24, height: 24, bgcolor: "#2196f3", mr: 1, fontSize: "0.75rem" }}>
                              {task.tecnico.charAt(0)}
                            </Avatar>
                            <Typography variant="caption" sx={{ color: "#666" }}>
                              {task.tecnico}
                            </Typography>
                          </Box>

                          {/* Datas */}
                          <Box sx={{ mt: "auto" }}>
                            <Typography variant="caption" sx={{ color: "#999", display: "block" }}>
                              Início: {new Date(task.dataInicio).toLocaleDateString("pt-BR")}
                            </Typography>
                            {task.dataFim && (
                              <Typography variant="caption" sx={{ color: "#999", display: "block" }}>
                                Fim: {new Date(task.dataFim).toLocaleDateString("pt-BR")}
                              </Typography>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {/* Paginação */}
                {totalPages > 1 && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={(_, page) => setCurrentPage(page)}
                      color="primary"
                      size="large"
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
