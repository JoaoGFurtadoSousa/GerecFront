"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Card,
  CardContent,
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
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  TrendingUp,
  Refresh,
  CalendarToday,
  Person,
  LocationOn,
  Image as ImageIcon,
  Close,
  Visibility,
  CheckCircleOutline,
  Warning,
  Build,
  ArrowForward,
} from "@mui/icons-material"
import { useNavigate, useLocation } from "react-router-dom"
import { authService } from "../services/authService"
import { apiService, type Task, type Equipment } from "../services/apiService"

const DRAWER_WIDTH = 240
const ITEMS_PER_PAGE = 6

export default function Historico() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [historyTasks, setHistoryTasks] = useState<Task[]>([])

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [equipmentLoading, setEquipmentLoading] = useState(false)
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([])
  const [showEquipment, setShowEquipment] = useState(false)

  const userData = authService.getUserData() || {
    nome: "Usuário",
    email: "usuario@sistema.com",
  }

  const featuresEnabled = authService.shouldEnableFeatures()

  useEffect(() => {
    loadHistorico()
  }, [])

  const loadHistorico = async () => {
    console.log("🔄 Carregando histórico de tarefas...")
    setLoading(true)
    setError(null)

    try {
      const data = await apiService.getHistorico()
      console.log("✅ Histórico carregado com sucesso:", data.length, "tarefas")

      const sortedData = data.sort((a, b) => {
        if (!a.dataTarefaFinalizada || !b.dataTarefaFinalizada) return 0

        const dateA = new Date(a.dataTarefaFinalizada).getTime()
        const dateB = new Date(b.dataTarefaFinalizada).getTime()

        return dateB - dateA // descending order (most recent first)
      })

      setHistoryTasks(sortedData)
      setCurrentPage(1)
    } catch (err) {
      console.error("❌ Erro ao carregar histórico:", err)
      setError(err instanceof Error ? err.message : "Erro ao carregar histórico")
    } finally {
      setLoading(false)
    }
  }

  const handleCardClick = (task: Task) => {
    console.log("🖱️ Botão Ver Detalhes clicado! ID da tarefa:", task.id)
    setSelectedTask(task)
    setModalOpen(true)
    setShowEquipment(false)
    setEquipmentList([])
  }

  const handleLoadEquipment = async () => {
    if (!selectedTask) return

    console.log("🔍 Carregando equipamentos da unidade:", selectedTask.unidade.id)
    setEquipmentLoading(true)

    try {
      const equipment = await apiService.getEquipmentByUnitId(selectedTask.unidade.id)
      console.log("✅ Equipamentos carregados:", equipment.length)
      setEquipmentList(equipment)
      setShowEquipment(true)
    } catch (err) {
      console.error("❌ Erro ao carregar equipamentos:", err)
      alert("Erro ao carregar equipamentos da unidade")
    } finally {
      setEquipmentLoading(false)
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedTask(null)
    setShowEquipment(false)
    setEquipmentList([])
  }

  const getEquipmentStatus = (equipment: Equipment) => {
    if (equipment.danificado_a_entrada || equipment.danificado_a_saida) {
      return {
        label: "Danificado",
        color: "#f44336",
        bgColor: "#ffebee",
        icon: <Warning sx={{ fontSize: 20 }} />,
      }
    }
    return {
      label: "OK",
      color: "#4caf50",
      bgColor: "#e8f5e8",
      icon: <CheckCircleOutline sx={{ fontSize: 20 }} />,
    }
  }

  const getStatusColor = (status: string) => {
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

  const getStatusBgColor = (status: string) => {
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

  const filteredTasks = historyTasks.filter((task) => {
    const matchesSearch =
      task.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.unidade.nome_da_unidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.nomeDoTecnico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.numChamado.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedTasks = filteredTasks.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const totalTasks = historyTasks.length
  const completedTasks = historyTasks.filter((task) => task.status === "Concluído").length

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleLogout = () => {
    authService.logout()
  }

  const isActiveRoute = (path: string) => {
    return location.pathname === path
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Data não disponível"
    try {
      return new Date(dateString).toLocaleDateString("pt-BR", {
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

  const hasPhotos = (task: Task): boolean => {
    return !!(task.fotoTotemEntrada || task.fotoTotemSaida)
  }

  const getPhotoCount = (task: Task): number => {
    let count = 0
    if (task.fotoTotemEntrada) count++
    if (task.fotoTotemSaida) count++
    return count
  }

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
          onClick={() => featuresEnabled && navigate("/nova-tarefa")}
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
          onClick={() => navigate("/historico")}
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
          onClick={() => featuresEnabled && navigate("/unidades")}
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
      <Box
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          display: { xs: "none", md: "block" },
        }}
      >
        {drawer}
      </Box>

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

      <Box sx={{ flexGrow: 1, overflow: "auto" }}>
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
            <IconButton onClick={loadHistorico} disabled={loading} color="primary" title="Atualizar lista">
              <Refresh />
            </IconButton>
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

        <Box sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
              <CircularProgress size={60} />
            </Box>
          ) : (
            <>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
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
                          <Typography
                            variant="caption"
                            sx={{ color: "#4caf50", display: "flex", alignItems: "center" }}
                          >
                            <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                            Histórico completo
                          </Typography>
                        </Box>
                        <Assignment sx={{ fontSize: 48, color: "#e0e0e0" }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ bgcolor: "white", border: "1px solid #e0e0e0" }}>
                    <CardContent>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Box>
                          <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
                            Tarefas Concluídas
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: "#4caf50" }}>
                            {completedTasks}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#4caf50" }}>
                            {totalTasks > 0 ? `${((completedTasks / totalTasks) * 100).toFixed(1)}% do total` : "0%"}
                          </Typography>
                        </Box>
                        <CheckCircle sx={{ fontSize: 48, color: "#e8f5e8" }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Card sx={{ mb: 3, bgcolor: "white", border: "1px solid #e0e0e0" }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={8}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Buscar por descrição, unidade, técnico ou número do chamado..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value)
                          setCurrentPage(1)
                        }}
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
                          onChange={(e) => {
                            setStatusFilter(e.target.value)
                            setCurrentPage(1)
                          }}
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

              <Box>
                <Typography variant="h6" sx={{ mb: 3, color: "#333", fontWeight: 600 }}>
                  Tarefas Finalizadas ({filteredTasks.length})
                </Typography>

                {paginatedTasks.length === 0 ? (
                  <Paper sx={{ p: 6, textAlign: "center", bgcolor: "white" }}>
                    <History sx={{ fontSize: 64, color: "#e0e0e0", mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Nenhuma tarefa encontrada
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {searchTerm || statusFilter !== "all"
                        ? "Tente ajustar os filtros de busca"
                        : "Não há tarefas no histórico"}
                    </Typography>
                    <Button variant="outlined" onClick={loadHistorico} startIcon={<Refresh />}>
                      Recarregar
                    </Button>
                  </Paper>
                ) : (
                  <>
                    <Grid container spacing={3}>
                      {paginatedTasks.map((task) => (
                        <Grid item xs={12} lg={6} key={`task-${task.id}`}>
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
                                borderColor: "#2196f3",
                              },
                            }}
                          >
                            <CardContent
                              sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%", gap: 2 }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                }}
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
                                  label={`#${task.numChamado}`}
                                  size="small"
                                  sx={{
                                    bgcolor: "#f5f5f5",
                                    color: "#666",
                                    fontWeight: 600,
                                  }}
                                />
                              </Box>

                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 600,
                                  color: "#333",
                                  lineHeight: 1.3,
                                  fontSize: "1rem",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {task.descricao}
                              </Typography>

                              <Box sx={{ mb: 1 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                  <Business sx={{ fontSize: 16, color: "#666" }} />
                                  <Typography variant="body2" sx={{ color: "#666" }}>
                                    {task.unidade.nome_da_unidade}
                                  </Typography>
                                </Box>

                                {task.nomeDoTecnico.nome && (
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                    <Person sx={{ fontSize: 16, color: "#666" }} />
                                    <Typography variant="body2" sx={{ color: "#666" }}>
                                      {task.nomeDoTecnico.nome}
                                    </Typography>
                                  </Box>
                                )}

                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                  <LocationOn sx={{ fontSize: 16, color: "#666" }} />
                                  <Typography
                                    variant="body2"
                                    sx={{ color: "#666", fontSize: "0.85rem", lineHeight: 1.2 }}
                                  >
                                    Lat: {task.latitude.toFixed(5)}, Long: {task.longitude.toFixed(5)}
                                  </Typography>
                                </Box>
                              </Box>

                              {(task.diagnostico || task.solucao) && (
                                <Box sx={{ p: 2, bgcolor: "#f8f9fa", borderRadius: 1 }}>
                                  {task.diagnostico && (
                                    <Typography variant="caption" sx={{ display: "block", mb: 1, color: "#666" }}>
                                      <strong>Diagnóstico:</strong> {task.diagnostico}
                                    </Typography>
                                  )}
                                  {task.solucao && (
                                    <Typography variant="caption" sx={{ display: "block", color: "#666" }}>
                                      <strong>Solução:</strong> {task.solucao}
                                    </Typography>
                                  )}
                                </Box>
                              )}

                              <Box
                                sx={{
                                  flex: 1,
                                  minHeight: 200,
                                  p: 2,
                                  bgcolor: "#f8f9fa",
                                  borderRadius: 1,
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  border: "1px solid #e0e0e0",
                                }}
                              >
                                {hasPhotos(task) ? (
                                  <Box sx={{ width: "100%", textAlign: "center" }}>
                                    <Typography variant="caption" sx={{ color: "#666", fontWeight: 600 }}>
                                      {getPhotoCount(task) === 2 ? "2 fotos anexadas" : "1 foto anexada"}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      sx={{ color: "#999", display: "block", fontSize: "0.8rem", mt: 0.5 }}
                                    >
                                      Clique em "Ver Detalhes da Tarefa" para visualizar
                                    </Typography>
                                  </Box>
                                ) : (
                                  <Box sx={{ textAlign: "center" }}>
                                    <ImageIcon sx={{ fontSize: 32, color: "#ccc", mb: 1, display: "block" }} />
                                    <Typography
                                      variant="body2"
                                      sx={{ color: "#999", fontWeight: 500, lineHeight: 1.4 }}
                                    >
                                      Sem fotos anexadas.
                                    </Typography>
                                  </Box>
                                )}
                              </Box>

                              <Divider sx={{ my: 1 }} />

                              <Box sx={{ marginTop: "auto" }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 2,
                                    gap: 1,
                                  }}
                                >
                                  <Box>
                                    <Typography variant="caption" sx={{ color: "#999", display: "block" }}>
                                      <CalendarToday sx={{ fontSize: 12, mr: 0.5, verticalAlign: "middle" }} />
                                      Criada
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      sx={{ color: "#666", fontWeight: 500, display: "block" }}
                                    >
                                      {formatDate(task.dataTarefa)}
                                    </Typography>
                                  </Box>
                                  {task.dataTarefaFinalizada && (
                                    <Box sx={{ textAlign: "right" }}>
                                      <Typography variant="caption" sx={{ color: "#999", display: "block" }}>
                                        <CheckCircle sx={{ fontSize: 12, mr: 0.5, verticalAlign: "middle" }} />
                                        Finalizada
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{ color: "#666", fontWeight: 500, display: "block" }}
                                      >
                                        {formatDate(task.dataTarefaFinalizada)}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>

                                <Button
                                  fullWidth
                                  variant="contained"
                                  endIcon={<ArrowForward />}
                                  onClick={() => {
                                    console.log("[v0] Botão Ver Detalhes clicado! Tarefa ID:", task.id)
                                    handleCardClick(task)
                                  }}
                                  sx={{
                                    bgcolor: "#2196f3",
                                    color: "white",
                                    textTransform: "none",
                                    fontWeight: 600,
                                    py: 1.5,
                                    borderRadius: 2,
                                    boxShadow: "0 2px 8px rgba(33, 150, 243, 0.3)",
                                    "&:hover": {
                                      bgcolor: "#1976d2",
                                      boxShadow: "0 4px 12px rgba(33, 150, 243, 0.4)",
                                    },
                                  }}
                                >
                                  Ver Detalhes da Tarefa
                                </Button>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>

                    {totalPages > 1 && (
                      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                        <Pagination
                          count={totalPages}
                          page={currentPage}
                          onChange={(_, page) => setCurrentPage(page)}
                          color="primary"
                          size="large"
                          showFirstButton
                          showLastButton
                        />
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </>
          )}
        </Box>
      </Box>

      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Detalhes da Tarefa
            </Typography>
            {selectedTask && (
              <Chip label={`#${selectedTask.numChamado}`} size="small" sx={{ bgcolor: "#f5f5f5", fontWeight: 600 }} />
            )}
          </Box>
          <IconButton onClick={handleCloseModal} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {selectedTask && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Chip
                  label={selectedTask.status}
                  sx={{
                    bgcolor: getStatusBgColor(selectedTask.status),
                    color: getStatusColor(selectedTask.status),
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    height: 32,
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: "#666", mb: 1 }}>
                  Descrição
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedTask.descricao}
                </Typography>
              </Box>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: "#666", mb: 1 }}>
                    Técnico
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Person sx={{ fontSize: 20, color: "#2196f3" }} />
                    <Typography variant="body1">{selectedTask.nomeDoTecnico.nome}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: "#666", mb: 1 }}>
                    Unidade
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Business sx={{ fontSize: 20, color: "#2196f3" }} />
                    <Typography variant="body1">{selectedTask.unidade.nome_da_unidade}</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: "#666", mb: 1 }}>
                  Localização
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LocationOn sx={{ fontSize: 20, color: "#2196f3" }} />
                  <Typography variant="body2">
                    Latitude: {selectedTask.latitude.toFixed(6)}, Longitude: {selectedTask.longitude.toFixed(6)}
                  </Typography>
                </Box>
              </Box>

              {(selectedTask.diagnostico || selectedTask.solucao) && (
                <Box sx={{ mb: 3, p: 2, bgcolor: "#f8f9fa", borderRadius: 2 }}>
                  {selectedTask.diagnostico && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ color: "#666", mb: 1 }}>
                        Diagnóstico
                      </Typography>
                      <Typography variant="body2">{selectedTask.diagnostico}</Typography>
                    </Box>
                  )}
                  {selectedTask.solucao && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: "#666", mb: 1 }}>
                        Solução
                      </Typography>
                      <Typography variant="body2">{selectedTask.solucao}</Typography>
                    </Box>
                  )}
                </Box>
              )}

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: "#666", mb: 2 }}>
                  Fotos Anexadas
                </Typography>
                <Grid container spacing={2}>
                  {selectedTask.fotoTotemEntrada && (
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography variant="caption" sx={{ color: "#666", mb: 1, display: "block" }}>
                          Foto de Entrada
                        </Typography>
                        <Box
                          component="img"
                          src={selectedTask.fotoTotemEntrada}
                          alt="Foto de entrada"
                          sx={{
                            width: "100%",
                            height: 200,
                            objectFit: "cover",
                            borderRadius: 2,
                            border: "1px solid #e0e0e0",
                          }}
                        />
                      </Box>
                    </Grid>
                  )}
                  {selectedTask.fotoTotemSaida && (
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography variant="caption" sx={{ color: "#666", mb: 1, display: "block" }}>
                          Foto de Saída
                        </Typography>
                        <Box
                          component="img"
                          src={selectedTask.fotoTotemSaida}
                          alt="Foto de saída"
                          sx={{
                            width: "100%",
                            height: 200,
                            objectFit: "cover",
                            borderRadius: 2,
                            border: "1px solid #e0e0e0",
                          }}
                        />
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>

              {!hasPhotos(selectedTask) && (
                <Box sx={{ mb: 3, p: 3, bgcolor: "#f8f9fa", borderRadius: 2, textAlign: "center" }}>
                  <ImageIcon sx={{ fontSize: 48, color: "#ccc", mb: 1, display: "block" }} />
                  <Typography variant="body2" sx={{ color: "#999", fontWeight: 500 }}>
                    Sem fotos anexadas.
                  </Typography>
                </Box>
              )}

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: "#666", mb: 1 }}>
                    Data de Criação
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CalendarToday sx={{ fontSize: 18, color: "#666" }} />
                    <Typography variant="body2">{formatDate(selectedTask.dataTarefa)}</Typography>
                  </Box>
                </Grid>
                {selectedTask.dataTarefaFinalizada && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" sx={{ color: "#666", mb: 1 }}>
                      Data de Finalização
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CheckCircle sx={{ fontSize: 18, color: "#4caf50" }} />
                      <Typography variant="body2">{formatDate(selectedTask.dataTarefaFinalizada)}</Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Equipamentos da Unidade
                  </Typography>
                  {!showEquipment && (
                    <Button
                      variant="contained"
                      startIcon={equipmentLoading ? <CircularProgress size={20} /> : <Visibility />}
                      onClick={handleLoadEquipment}
                      disabled={equipmentLoading}
                    >
                      Ver Situação da Unidade
                    </Button>
                  )}
                </Box>

                {showEquipment && (
                  <Box>
                    {equipmentList.length === 0 ? (
                      <Paper sx={{ p: 3, textAlign: "center", bgcolor: "#f8f9fa" }}>
                        <Build sx={{ fontSize: 48, color: "#e0e0e0", mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Nenhum equipamento encontrado para esta unidade
                        </Typography>
                      </Paper>
                    ) : (
                      <Grid container spacing={2}>
                        {equipmentList.map((equipment) => {
                          const status = getEquipmentStatus(equipment)
                          return (
                            <Grid item xs={12} key={equipment.id}>
                              <Card
                                sx={{
                                  border: `1px solid ${status.color}`,
                                  bgcolor: status.bgColor,
                                }}
                              >
                                <CardContent sx={{ py: 2 }}>
                                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                      <Box sx={{ color: status.color }}>{status.icon}</Box>
                                      <Box>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                          {equipment.nome_do_equipamento}
                                        </Typography>
                                        <Box sx={{ display: "flex", gap: 2, mt: 0.5 }}>
                                          <Typography variant="caption" sx={{ color: "#666" }}>
                                            Entrada:{" "}
                                            {equipment.danificado_a_entrada ? (
                                              <span style={{ color: "#f44336", fontWeight: 600 }}>Danificado</span>
                                            ) : (
                                              <span style={{ color: "#4caf50", fontWeight: 600 }}>OK</span>
                                            )}
                                          </Typography>
                                          <Typography variant="caption" sx={{ color: "#666" }}>
                                            Saída:{" "}
                                            {equipment.danificado_a_saida ? (
                                              <span style={{ color: "#f44336", fontWeight: 600 }}>Danificado</span>
                                            ) : (
                                              <span style={{ color: "#4caf50", fontWeight: 600 }}>OK</span>
                                            )}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    </Box>
                                    <Chip
                                      label={status.label}
                                      size="small"
                                      sx={{
                                        bgcolor: status.color,
                                        color: "white",
                                        fontWeight: 600,
                                      }}
                                    />
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                          )
                        })}
                      </Grid>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseModal} variant="outlined">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
