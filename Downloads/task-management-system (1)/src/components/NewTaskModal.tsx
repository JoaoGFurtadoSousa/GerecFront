"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Avatar,
  Badge,
} from "@mui/material"
import {
  ArrowBack,
  Save,
  Engineering,
  Dashboard,
  Add,
  Business,
  History,
  Assignment,
  Menu,
  Logout,
  Notifications,
} from "@mui/icons-material"
import { useNavigate, useLocation } from "react-router-dom"
import { authService } from "../services/authService"

const DRAWER_WIDTH = 240

interface NovaTaskForm {
  nome: string
  descricao: string
  unidade: string
  tecnico: string
}

interface Unidade {
  id: number
  nome: string
}

interface Usuario {
  id: number
  nome: string
}

export default function NovaTask() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const [form, setForm] = useState<NovaTaskForm>({
    nome: "",
    descricao: "",
    unidade: "",
    tecnico: "",
  })

  const [errors, setErrors] = useState<Partial<NovaTaskForm>>({})

  const userData = authService.getUserData() || {
    nome: "Usuário",
    email: "usuario@sistema.com",
  }

  const featuresEnabled = authService.shouldEnableFeatures()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      console.log("🔒 Token não encontrado, redirecionando para login...")
      navigate("/login", { replace: true })
      return
    }
  }, [navigate])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true)

        const token = localStorage.getItem("token")
        const headers = {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        }

        const unidadesResponse = await fetch("http://192.168.15.20:8000/api/v1/unidades/", {
          headers,
        })

        if (unidadesResponse.ok) {
          const unidadesData = await unidadesResponse.json()
          const unidadesArray = unidadesData.results || unidadesData
          setUnidades(Array.isArray(unidadesArray) ? unidadesArray : [])
        } else {
          console.error("Erro ao carregar unidades:", unidadesResponse.status)
          setUnidades([])
        }

        const usuariosResponse = await fetch("http://192.168.15.20:8000/api/v1/usuarios/", {
          headers,
        })

        if (usuariosResponse.ok) {
          const usuariosData = await usuariosResponse.json()
          const usuariosArray = usuariosData.results || usuariosData
          setUsuarios(Array.isArray(usuariosArray) ? usuariosArray : [])
        } else {
          console.error("Erro ao carregar usuários:", usuariosResponse.status)
          setUsuarios([])
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        setError("Erro ao carregar dados do sistema")
        setUnidades([])
        setUsuarios([])
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [])

  const handleInputChange = (field: keyof NovaTaskForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<NovaTaskForm> = {}

    if (!form.nome.trim()) newErrors.nome = "Nome é obrigatório"
    if (!form.descricao.trim()) newErrors.descricao = "Descrição é obrigatória"
    if (!form.unidade) newErrors.unidade = "Unidade é obrigatória"
    if (!form.tecnico) newErrors.tecnico = "Técnico é obrigatório"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      }

      const response = await fetch("http://192.168.15.20:8000/api/v1/tarefas/", {
        method: "POST",
        headers,
        body: JSON.stringify({
          nome: form.nome,
          descricao: form.descricao,
          unidade_id: Number.parseInt(form.unidade),
          tecnico_id: Number.parseInt(form.tecnico),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Erro ao criar tarefa")
      }

      const result = await response.json()
      console.log("📝 Nova tarefa criada:", result)
      setSuccess(true)

      setTimeout(() => {
        navigate("/")
      }, 2000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar tarefa. Tente novamente."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

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
    navigate("/nova-tarefa")
  }

  const handleNavigateToHistory = () => {
    if (featuresEnabled) {
      navigate("/historico")
    }
  }

  const handleNavigateToUnits = () => {
    if (featuresEnabled) {
      navigate("/unidades")
    }
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
              bgcolor: isActiveRoute("/nova-tarefa") ? "#388e3c" : "#333",
            },
            cursor: "pointer",
          }}
        >
          <ListItemIcon>
            <Add sx={{ color: isActiveRoute("/nova-tarefa") ? "white" : "#4caf50" }} />
          </ListItemIcon>
          <ListItemText
            primary="Nova Tarefa"
            primaryTypographyProps={{
              fontSize: "0.9rem",
              color: isActiveRoute("/nova-tarefa") ? "white" : "#ccc",
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
              Nova Tarefa
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

        <Box sx={{ p: 3 }}>
          {success ? (
            <Paper sx={{ p: 6, textAlign: "center", bgcolor: "white" }}>
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    bgcolor: "#4caf50",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <Assignment sx={{ fontSize: 40, color: "white" }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 600, color: "#333", mb: 1 }}>
                  Tarefa Criada com Sucesso!
                </Typography>
                <Typography variant="body1" sx={{ color: "#666" }}>
                  A tarefa "{form.nome}" foi criada e será redirecionada para o dashboard.
                </Typography>
              </Box>
              <CircularProgress size={24} />
            </Paper>
          ) : (
            <Card sx={{ maxWidth: 800, mx: "auto", bgcolor: "white", border: "1px solid #e0e0e0" }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "#333" }}>
                  Criar Nova Tarefa
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                {loadingData && (
                  <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                    <CircularProgress size={24} />
                    <Typography sx={{ ml: 2 }}>Carregando dados...</Typography>
                  </Box>
                )}

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nome da Tarefa"
                      value={form.nome}
                      onChange={(e) => handleInputChange("nome", e.target.value)}
                      error={!!errors.nome}
                      helperText={errors.nome}
                      disabled={loading || loadingData}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Descrição"
                      multiline
                      rows={4}
                      value={form.descricao}
                      onChange={(e) => handleInputChange("descricao", e.target.value)}
                      error={!!errors.descricao}
                      helperText={errors.descricao}
                      disabled={loading || loadingData}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors.unidade}>
                      <InputLabel>Unidade</InputLabel>
                      <Select
                        value={form.unidade}
                        label="Unidade"
                        onChange={(e) => handleInputChange("unidade", e.target.value)}
                        disabled={loading || loadingData}
                      >
                        {unidades.map((unidade) => (
                          <MenuItem key={unidade.id} value={unidade.id.toString()}>
                            {unidade.nome}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.unidade && (
                        <Typography variant="caption" sx={{ color: "#d32f2f", mt: 0.5, ml: 1.5 }}>
                          {errors.unidade}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors.tecnico}>
                      <InputLabel>Técnico Responsável</InputLabel>
                      <Select
                        value={form.tecnico}
                        label="Técnico Responsável"
                        onChange={(e) => handleInputChange("tecnico", e.target.value)}
                        disabled={loading || loadingData}
                      >
                        {usuarios.map((usuario) => (
                          <MenuItem key={usuario.id} value={usuario.id.toString()}>
                            {usuario.nome}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.tecnico && (
                        <Typography variant="caption" sx={{ color: "#d32f2f", mt: 0.5, ml: 1.5 }}>
                          {errors.tecnico}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>

                <Box sx={{ display: "flex", gap: 2, mt: 4, justifyContent: "flex-end" }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/")}
                    disabled={loading || loadingData}
                    sx={{ textTransform: "none" }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                    onClick={handleSubmit}
                    disabled={loading || loadingData}
                    sx={{ textTransform: "none", minWidth: 120 }}
                  >
                    {loading ? "Salvando..." : "Criar Tarefa"}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  )
}
