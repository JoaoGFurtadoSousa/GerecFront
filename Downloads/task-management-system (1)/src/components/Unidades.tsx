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
  LocationOn,
  Phone,
  Email,
  Person,
  TrendingUp,
  CheckCircle,
  Build,
  Close,
} from "@mui/icons-material"
import { useNavigate, useLocation } from "react-router-dom"
import { authService } from "../services/authService"

const DRAWER_WIDTH = 240

interface Unidade {
  id: number
  nome: string
  endereco: string
  telefone: string
  email: string
  responsavel: string
  status: "Ativa" | "Manutenção" | "Inativa"
  totalTarefas: number
  tarefasConcluidas: number
  equipamentos: number
  descricao: string
}

// Dados mockados das unidades
const mockUnidades: Unidade[] = [
  {
    id: 1,
    nome: "Unidade Centro",
    endereco: "Rua Principal, 123 - Centro",
    telefone: "(11) 3333-1111",
    email: "centro@empresa.com",
    responsavel: "João Silva",
    status: "Ativa",
    totalTarefas: 45,
    tarefasConcluidas: 38,
    equipamentos: 25,
    descricao:
      "Unidade principal localizada no centro da cidade, responsável pelas operações administrativas e comerciais.",
  },
  {
    id: 2,
    nome: "Unidade Norte",
    endereco: "Av. Norte, 456 - Zona Norte",
    telefone: "(11) 3333-2222",
    email: "norte@empresa.com",
    responsavel: "Maria Santos",
    status: "Ativa",
    totalTarefas: 32,
    tarefasConcluidas: 28,
    equipamentos: 18,
    descricao: "Unidade estratégica na zona norte, focada em atendimento ao cliente e suporte técnico.",
  },
  {
    id: 3,
    nome: "Unidade Sul",
    endereco: "Rua Sul, 789 - Zona Sul",
    telefone: "(11) 3333-3333",
    email: "sul@empresa.com",
    responsavel: "Pedro Oliveira",
    status: "Manutenção",
    totalTarefas: 28,
    tarefasConcluidas: 20,
    equipamentos: 15,
    descricao: "Unidade em processo de modernização, temporariamente com operações reduzidas.",
  },
  {
    id: 4,
    nome: "Unidade Leste",
    endereco: "Av. Leste, 321 - Zona Leste",
    telefone: "(11) 3333-4444",
    email: "leste@empresa.com",
    responsavel: "Ana Costa",
    status: "Ativa",
    totalTarefas: 38,
    tarefasConcluidas: 35,
    equipamentos: 22,
    descricao: "Unidade moderna com foco em inovação e desenvolvimento de novos processos.",
  },
  {
    id: 5,
    nome: "Unidade Oeste",
    endereco: "Rua Oeste, 654 - Zona Oeste",
    telefone: "(11) 3333-5555",
    email: "oeste@empresa.com",
    responsavel: "Carlos Ferreira",
    status: "Ativa",
    totalTarefas: 25,
    tarefasConcluidas: 22,
    equipamentos: 12,
    descricao: "Unidade compacta especializada em operações logísticas e distribuição.",
  },
  {
    id: 6,
    nome: "Unidade Industrial",
    endereco: "Distrito Industrial, 987",
    telefone: "(11) 3333-6666",
    email: "industrial@empresa.com",
    responsavel: "Roberto Lima",
    status: "Inativa",
    totalTarefas: 15,
    tarefasConcluidas: 10,
    equipamentos: 8,
    descricao: "Unidade industrial temporariamente desativada para reformas estruturais.",
  },
]

const getStatusColor = (status: Unidade["status"]) => {
  switch (status) {
    case "Ativa":
      return "#4caf50"
    case "Manutenção":
      return "#ff9800"
    case "Inativa":
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
    case "Inativa":
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
  const [selectedUnidade, setSelectedUnidade] = useState<Unidade | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const userData = authService.getUserData() || {
    nome: "Usuário",
    email: "usuario@sistema.com",
  }

  const featuresEnabled = authService.shouldEnableFeatures()

  // Filtrar unidades
  const filteredUnidades = mockUnidades.filter(
    (unidade) =>
      unidade.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unidade.endereco.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unidade.responsavel.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Estatísticas
  const totalUnidades = mockUnidades.length
  const unidadesAtivas = mockUnidades.filter((u) => u.status === "Ativa").length
  const unidadesManutencao = mockUnidades.filter((u) => u.status === "Manutenção").length
  const totalEquipamentos = mockUnidades.reduce((sum, u) => sum + u.equipamentos, 0)

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

  const handleOpenDialog = (unidade: Unidade) => {
    setSelectedUnidade(unidade)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedUnidade(null)
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
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: "white", border: "1px solid #e0e0e0" }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
                        Total Unidades
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: "#333" }}>
                        {totalUnidades}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#4caf50", display: "flex", alignItems: "center" }}>
                        <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                        Cadastradas
                      </Typography>
                    </Box>
                    <Business sx={{ fontSize: 40, color: "#e0e0e0" }} />
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
                        Ativas
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: "#4caf50" }}>
                        {unidadesAtivas}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#4caf50" }}>
                        Operacionais
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
                        Manutenção
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: "#ff9800" }}>
                        {unidadesManutencao}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#ff9800" }}>
                        Em reforma
                      </Typography>
                    </Box>
                    <Build sx={{ fontSize: 40, color: "#fff3e0" }} />
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
                        Equipamentos
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: "#2196f3" }}>
                        {totalEquipamentos}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#2196f3" }}>
                        Total geral
                      </Typography>
                    </Box>
                    <Engineering sx={{ fontSize: 40, color: "#e3f2fd" }} />
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
                placeholder="Buscar por nome, endereço ou responsável..."
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
              Unidades ({filteredUnidades.length})
            </Typography>

            {filteredUnidades.length === 0 ? (
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
                {filteredUnidades.map((unidade) => (
                  <Grid item xs={12} sm={6} lg={4} key={unidade.id}>
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
                      onClick={() => handleOpenDialog(unidade)}
                    >
                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        {/* Header com status */}
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                          <Chip
                            label={unidade.status}
                            sx={{
                              bgcolor: getStatusBgColor(unidade.status),
                              color: getStatusColor(unidade.status),
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              height: 28,
                              borderRadius: 2,
                            }}
                          />
                          <Typography variant="caption" sx={{ color: "#999", fontWeight: 600 }}>
                            ID: {unidade.id}
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
                          {unidade.nome}
                        </Typography>

                        {/* Endereço */}
                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                          <LocationOn sx={{ fontSize: 16, color: "#666", mr: 1 }} />
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#666",
                              fontSize: "0.9rem",
                              lineHeight: 1.5,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {unidade.endereco}
                          </Typography>
                        </Box>

                        {/* Responsável */}
                        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                          <Avatar sx={{ width: 24, height: 24, bgcolor: "#2196f3", mr: 1, fontSize: "0.75rem" }}>
                            {unidade.responsavel.charAt(0)}
                          </Avatar>
                          <Typography variant="caption" sx={{ color: "#666" }}>
                            {unidade.responsavel}
                          </Typography>
                        </Box>

                        {/* Estatísticas */}
                        <Grid container spacing={2} sx={{ mt: "auto" }}>
                          <Grid item xs={4}>
                            <Box sx={{ textAlign: "center" }}>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: "#333", fontSize: "1rem" }}>
                                {unidade.totalTarefas}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "#666" }}>
                                Tarefas
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box sx={{ textAlign: "center" }}>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: "#4caf50", fontSize: "1rem" }}>
                                {unidade.tarefasConcluidas}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "#666" }}>
                                Concluídas
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box sx={{ textAlign: "center" }}>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: "#2196f3", fontSize: "1rem" }}>
                                {unidade.equipamentos}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "#666" }}>
                                Equipamentos
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Box>
      </Box>

      {/* Dialog de Detalhes da Unidade */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        {selectedUnidade && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: "#333" }}>
                  {selectedUnidade.nome}
                </Typography>
                <IconButton onClick={handleCloseDialog} size="small">
                  <Close />
                </IconButton>
              </Box>
              <Chip
                label={selectedUnidade.status}
                sx={{
                  bgcolor: getStatusBgColor(selectedUnidade.status),
                  color: getStatusColor(selectedUnidade.status),
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  height: 28,
                  borderRadius: 2,
                  mt: 1,
                }}
              />
            </DialogTitle>

            <DialogContent>
              <Typography variant="body1" sx={{ color: "#666", mb: 3, lineHeight: 1.6 }}>
                {selectedUnidade.descricao}
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: "#333", mb: 2 }}>
                    Informações de Contato
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <LocationOn sx={{ fontSize: 20, color: "#666", mr: 2 }} />
                    <Typography variant="body2" sx={{ color: "#666" }}>
                      {selectedUnidade.endereco}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Phone sx={{ fontSize: 20, color: "#666", mr: 2 }} />
                    <Typography variant="body2" sx={{ color: "#666" }}>
                      {selectedUnidade.telefone}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Email sx={{ fontSize: 20, color: "#666", mr: 2 }} />
                    <Typography variant="body2" sx={{ color: "#666" }}>
                      {selectedUnidade.email}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Person sx={{ fontSize: 20, color: "#666", mr: 2 }} />
                    <Typography variant="body2" sx={{ color: "#666" }}>
                      <strong>Responsável:</strong> {selectedUnidade.responsavel}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: "#333", mb: 2 }}>
                    Estatísticas
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Card sx={{ bgcolor: "#f8f9fa", border: "1px solid #e0e0e0" }}>
                        <CardContent sx={{ textAlign: "center", py: 2 }}>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: "#333" }}>
                            {selectedUnidade.totalTarefas}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#666" }}>
                            Total de Tarefas
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={6}>
                      <Card sx={{ bgcolor: "#f8f9fa", border: "1px solid #e0e0e0" }}>
                        <CardContent sx={{ textAlign: "center", py: 2 }}>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: "#4caf50" }}>
                            {selectedUnidade.tarefasConcluidas}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#666" }}>
                            Concluídas
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={6}>
                      <Card sx={{ bgcolor: "#f8f9fa", border: "1px solid #e0e0e0" }}>
                        <CardContent sx={{ textAlign: "center", py: 2 }}>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: "#2196f3" }}>
                            {selectedUnidade.equipamentos}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#666" }}>
                            Equipamentos
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={6}>
                      <Card sx={{ bgcolor: "#f8f9fa", border: "1px solid #e0e0e0" }}>
                        <CardContent sx={{ textAlign: "center", py: 2 }}>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: "#ff9800" }}>
                            {Math.round((selectedUnidade.tarefasConcluidas / selectedUnidade.totalTarefas) * 100)}%
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#666" }}>
                            Taxa de Conclusão
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
              <Button onClick={handleCloseDialog} variant="outlined" sx={{ textTransform: "none" }}>
                Fechar
              </Button>
              <Button variant="contained" sx={{ textTransform: "none" }}>
                Editar Unidade
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}
