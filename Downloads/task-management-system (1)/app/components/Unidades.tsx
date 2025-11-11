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
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from "@mui/material"
import {
  ArrowBack,
  Search,
  Engineering,
  Dashboard,
  Add,
  Business,
  History,
  Menu,
  Logout,
  Notifications,
  CheckCircle,
  Warning,
  Close,
  Error as ErrorIcon,
} from "@mui/icons-material"
import { useNavigate, useLocation } from "react-router-dom"
import { authService } from "../services/authService"
import { apiService, type Unit, type UnitEquipment } from "../services/apiService"

const DRAWER_WIDTH = 240

interface Unidade {
  id: number
  nome: string
  endereco: string
  telefone: string
  email: string
  responsavel: string
  status: "Ativa" | "Manutenção" | "Desativada"
  totalTarefas: number
  tarefasConcluidas: number
  equipamentos: number
  descricao: string
}

const getStatusColor = (status: Unidade["status"]) => {
  switch (status) {
    case "Ativa":
      return "#4caf50"
    case "Manutenção":
      return "#ff9800"
    case "Desativada":
      return "#f44336"
    default:
      return "#9e9e9e"
  }
}

const getStatusBgColor = (status: Unidade["status"]) => {
  switch (status) {
    case "Ativa":
      return "#e8f5e8"
    case "Manutenção":
      return "#fff3e0"
    case "Desativada":
      return "#ffebee"
    default:
      return "#f5f5f5"
  }
}

export default function Unidades() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [equipment, setEquipment] = useState<UnitEquipment[]>([])
  const [loadingEquipment, setLoadingEquipment] = useState(false)
  const [equipmentError, setEquipmentError] = useState<string | null>(null)

  const userData = authService.getUserData() || {
    nome: "Usuário",
    email: "usuario@sistema.com",
  }

  const featuresEnabled = authService.shouldEnableFeatures()

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiService.getUnits()
        setUnits(data)
        console.log("✅ Unidades carregadas:", data)
      } catch (err) {
        console.error("❌ Erro ao carregar unidades:", err)
        setError(err instanceof Error ? err.message : "Erro ao carregar unidades")
      } finally {
        setLoading(false)
      }
    }

    fetchUnits()
  }, [])

  const filteredUnits = units.filter((unit) => unit.nome_da_unidade.toLowerCase().includes(searchTerm.toLowerCase()))

  const totalUnits = units.length
  const activeUnits = units.filter((u) => u.status === true).length
  const inactiveUnits = units.filter((u) => u.status === false).length

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
    if (featuresEnabled) {
      navigate("/historico")
    }
  }

  const handleNavigateToUnits = () => {
    navigate("/unidades")
  }

  const handleOpenDialog = async (unit: Unit) => {
    setSelectedUnit(unit)
    setDialogOpen(true)
    setLoadingEquipment(true)
    setEquipmentError(null)
    setEquipment([])

    try {
      console.log("🔍 Buscando equipamentos para unidade:", unit.id)
      const equipmentData = await apiService.getEquipmentByUnit(unit.id)
      setEquipment(equipmentData)
      console.log("✅ Equipamentos carregados:", equipmentData)
    } catch (err) {
      console.error("❌ Erro ao carregar equipamentos:", err)
      setEquipmentError(err instanceof Error ? err.message : "Erro ao carregar equipamentos")
    } finally {
      setLoadingEquipment(false)
    }
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedUnit(null)
    setEquipment([])
    setEquipmentError(null)
  }

  const getEquipmentStatus = (eq: UnitEquipment) => {
    if (eq.danificado_a_entrada || eq.danificado_a_saida) {
      return { label: "Danificado", color: "#ff9800", icon: <Warning sx={{ fontSize: 16 }} /> }
    }
    return { label: "OK", color: "#4caf50", icon: <CheckCircle sx={{ fontSize: 16 }} /> }
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
              bgcolor: featuresEnabled ? (isActiveRoute("/historico") ? "#1976d2" : "#333") : "transparent",
            },
            cursor: featuresEnabled ? "pointer" : "not-allowed",
            opacity: featuresEnabled ? 1 : 0.5,
          }}
        >
          <ListItemIcon>
            <History sx={{ color: featuresEnabled ? (isActiveRoute("/historico") ? "white" : "#ccc") : "#666" }} />
          </ListItemIcon>
          <ListItemText
            primary="Histórico"
            primaryTypographyProps={{
              fontSize: "0.9rem",
              color: featuresEnabled ? (isActiveRoute("/historico") ? "white" : "#ccc") : "#666",
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
              bgcolor: isActiveRoute("/unidades") ? "#1976d2" : "#333",
            },
            cursor: "pointer",
          }}
        >
          <ListItemIcon>
            <Business sx={{ color: isActiveRoute("/unidades") ? "white" : "#ccc" }} />
          </ListItemIcon>
          <ListItemText
            primary="Unidades"
            primaryTypographyProps={{
              fontSize: "0.9rem",
              color: isActiveRoute("/unidades") ? "white" : "#ccc",
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

  if (loading) {
    return (
      <Box sx={{ display: "flex", height: "100vh" }}>
        <Box sx={{ width: DRAWER_WIDTH, flexShrink: 0, display: { xs: "none", md: "block" } }}>{drawer}</Box>
        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "#f8f9fa" }}>
          <CircularProgress size={60} />
        </Box>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", height: "100vh" }}>
        <Box sx={{ width: DRAWER_WIDTH, flexShrink: 0, display: { xs: "none", md: "block" } }}>{drawer}</Box>
        <Box sx={{ flexGrow: 1, p: 3, bgcolor: "#f8f9fa" }}>
          <Alert
            severity="error"
            action={
              <Button onClick={() => window.location.reload()} color="inherit">
                Tentar Novamente
              </Button>
            }
          >
            <Typography variant="h6">Erro ao carregar unidades</Typography>
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
              sx={{ textTransform: "none", color: "#666" }}
            >
              Voltar
            </Button>
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#333" }}>
              Gerenciar Unidades
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
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ bgcolor: "white", border: "1px solid #e0e0e0" }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
                        Total Unidades
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: "#333" }}>
                        {totalUnits}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#2196f3" }}>
                        Cadastradas
                      </Typography>
                    </Box>
                    <Business sx={{ fontSize: 40, color: "#e0e0e0" }} />
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
                       Unidades Ativadas
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: "#4caf50" }}>
                        {activeUnits}
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
                        Unidades Desativadas
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: "#f44336" }}>
                        {inactiveUnits}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#f44336" }}>
                        Unidades Desativadas
                      </Typography>
                    </Box>
                    <ErrorIcon sx={{ fontSize: 40, color: "#ffebee" }} />
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
                placeholder="Buscar por nome da unidade..."
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
            </CardContent>
          </Card>

          {/* Lista de Unidades */}
          <Box>
            <Typography variant="h6" sx={{ mb: 3, color: "#333", fontWeight: 600 }}>
              Unidades ({filteredUnits.length})
            </Typography>

            {filteredUnits.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: "center", bgcolor: "white" }}>
                <Business sx={{ fontSize: 64, color: "#e0e0e0", mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Nenhuma unidade encontrada
                </Typography>
                <Button variant="outlined" onClick={() => setSearchTerm("")}>
                  Limpar Busca
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {filteredUnits.map((unit) => (
                  <Grid item xs={12} sm={6} lg={4} key={unit.id}>
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
                          cursor: "pointer",
                        },
                      }}
                      onClick={() => handleOpenDialog(unit)}
                    >
                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        {/* Header com status */}
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                          <Chip
                            label={unit.status ? "Ativa" : "Desativada"}
                            sx={{
                              bgcolor: unit.status ? "#e8f5e8" : "#ffebee",
                              color: unit.status ? "#4caf50" : "#f44336",
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              height: 28,
                              borderRadius: 2,
                            }}
                          />
                          <Typography variant="caption" sx={{ color: "#999", fontWeight: 600 }}>
                            ID: {unit.id}
                          </Typography>
                        </Box>

                        {/* Nome da Unidade */}
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
                          {unit.nome_da_unidade}
                        </Typography>

                        {/* Botão para ver equipamentos */}
                        <Button
                          variant="outlined"
                          fullWidth
                          sx={{
                            mt: 2,
                            textTransform: "none",
                            borderColor: "#e0e0e0",
                            color: "#666",
                            "&:hover": {
                              borderColor: "#2196f3",
                              color: "#2196f3",
                            },
                          }}
                        >
                          Ver Equipamentos
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Box>
      </Box>

      {/* Dialog de Equipamentos da Unidade */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        {selectedUnit && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: "#333" }}>
                  {selectedUnit.nome_da_unidade}
                </Typography>
                <IconButton onClick={handleCloseDialog} size="small">
                  <Close />
                </IconButton>
              </Box>
              <Chip
                label={selectedUnit.status ? "Ativa" : "Desativada"}
                sx={{
                  bgcolor: selectedUnit.status ? "#e8f5e8" : "#ffebee",
                  color: selectedUnit.status ? "#4caf50" : "#f44336",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  height: 28,
                  borderRadius: 2,
                  mt: 1,
                }}
              />
            </DialogTitle>

            <DialogContent>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#333", mb: 2 }}>
                Equipamentos
              </Typography>

              {loadingEquipment ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : equipmentError ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {equipmentError}
                </Alert>
              ) : equipment.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: "center", bgcolor: "#f8f9fa" }}>
                  <Engineering sx={{ fontSize: 48, color: "#e0e0e0", mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Nenhum equipamento encontrado para esta unidade.
                  </Typography>
                </Paper>
              ) : (
                <Grid container spacing={2}>
                  {equipment.map((eq) => {
                    const status = getEquipmentStatus(eq)
                    return (
                      <Grid item xs={12} key={eq.id}>
                        <Card sx={{ bgcolor: "#f8f9fa", border: "1px solid #e0e0e0" }}>
                          <CardContent sx={{ py: 2 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Engineering sx={{ fontSize: 20, color: "#666" }} />
                                <Typography variant="body1" sx={{ fontWeight: 500, color: "#333" }}>
                                  {eq.nome_do_equipamento}
                                </Typography>
                              </Box>
                              <Chip
                                icon={status.icon}
                                label={status.label}
                                sx={{
                                  bgcolor: status.color === "#4caf50" ? "#e8f5e8" : "#fff3e0",
                                  color: status.color,
                                  fontWeight: 600,
                                  fontSize: "0.75rem",
                                  height: 28,
                                }}
                              />
                            </Box>
                            {(eq.danificado_a_entrada || eq.danificado_a_saida) && (
                              <Box sx={{ mt: 1, ml: 3 }}>
                                {eq.danificado_a_entrada && (
                                  <Typography variant="caption" sx={{ color: "#ff9800", display: "block" }}>
                                    • Danificado na entrada
                                  </Typography>
                                )}
                                {eq.danificado_a_saida && (
                                  <Typography variant="caption" sx={{ color: "#ff9800", display: "block" }}>
                                    • Danificado na saída
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    )
                  })}
                </Grid>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
              <Button onClick={handleCloseDialog} variant="contained" sx={{ textTransform: "none" }}>
                Fechar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}
