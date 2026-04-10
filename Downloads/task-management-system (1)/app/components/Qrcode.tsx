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
  InputLabel,
  CircularProgress,
  Alert,
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
  Dashboard,
  Engineering,
  Notifications,
  Menu,
  Logout,
  Add,
  Business,
  History,
  ArrowBack,
  QrCode2,
  Nfc,
  Send,
} from "@mui/icons-material"
import { useNavigate, useLocation } from "react-router-dom"
import { authService } from "../services/authService"

const DRAWER_WIDTH = 240
const QRCODE_API_URL = "http://192.168.15.20:8000/api/v1"

interface Unidade {
  id: number
  nome_da_unidade: string
  status: boolean
  id_garagem: string
}

export default function QRCodePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Estados do formulario
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [loadingUnidades, setLoadingUnidades] = useState(true)
  const [selectedGaragem, setSelectedGaragem] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [quantidade, setQuantidade] = useState<number>(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const userData = authService.getUserData() || {
    nome: "Usuario",
    email: "usuario@sistema.com",
  }

  const featuresEnabled = authService.shouldEnableFeatures()

  // Buscar unidades ao carregar
  useEffect(() => {
    loadUnidades()
  }, [])

  const loadUnidades = async () => {
    setLoadingUnidades(true)
    setError(null)

    try {
      const response = await authService.authenticatedFetch(`${QRCODE_API_URL}/unidades/`, {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Unidades carregadas:", data)
      setUnidades(data)
    } catch (err) {
      console.error("Erro ao carregar unidades:", err)
      setError("Erro ao carregar unidades. Verifique a conexao com o servidor.")
    } finally {
      setLoadingUnidades(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validacoes
    if (!selectedGaragem) {
      setError("Selecione uma unidade")
      return
    }

    if (!selectedStatus) {
      setError("Selecione o status")
      return
    }

    if (quantidade < 1 || quantidade > 10) {
      setError("A quantidade deve ser entre 1 e 10")
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        id_garagem: selectedGaragem,
        status: selectedStatus,
        quantidade: quantidade,
      }

      console.log("Enviando payload:", payload)

      const response = await authService.authenticatedFetch(`${QRCODE_API_URL}/qrcode/criar_qrcode/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || errorData.message || `Erro ${response.status}`)
      }

      const result = await response.json()
      console.log("QRCodes criados:", result)

      setSuccess(`${quantidade} QRCode(s) criado(s) com sucesso!`)
      setSelectedGaragem("")
      setSelectedStatus("")
      setQuantidade(1)
    } catch (err: any) {
      console.error("Erro ao criar QRCodes:", err)
      setError(err.message || "Erro ao criar QRCodes")
    } finally {
      setSubmitting(false)
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
          <ListItemText primary="Dashboard" primaryTypographyProps={{ fontSize: "0.9rem", fontWeight: 500, color: "white" }} />
        </ListItem>

        <ListItem
          onClick={() => featuresEnabled && navigate("/nova-tarefa")}
          sx={{
            borderRadius: 2,
            mb: 1,
            bgcolor: isActiveRoute("/nova-tarefa") ? "#4caf50" : "transparent",
            "&:hover": { bgcolor: featuresEnabled ? "#333" : "transparent" },
            cursor: featuresEnabled ? "pointer" : "not-allowed",
            opacity: featuresEnabled ? 1 : 0.5,
          }}
        >
          <ListItemIcon>
            <Add sx={{ color: featuresEnabled ? "#4caf50" : "#666" }} />
          </ListItemIcon>
          <ListItemText primary="Nova Tarefa" primaryTypographyProps={{ fontSize: "0.9rem", color: featuresEnabled ? "#ccc" : "#666" }} />
        </ListItem>

        <ListItem
          onClick={() => featuresEnabled && navigate("/historico")}
          sx={{
            borderRadius: 2,
            mb: 1,
            bgcolor: isActiveRoute("/historico") ? "#2196f3" : "transparent",
            "&:hover": { bgcolor: featuresEnabled ? "#333" : "transparent" },
            cursor: featuresEnabled ? "pointer" : "not-allowed",
            opacity: featuresEnabled ? 1 : 0.5,
          }}
        >
          <ListItemIcon>
            <History sx={{ color: featuresEnabled ? "#ccc" : "#666" }} />
          </ListItemIcon>
          <ListItemText primary="Historico" primaryTypographyProps={{ fontSize: "0.9rem", color: featuresEnabled ? "#ccc" : "#666" }} />
        </ListItem>

        <ListItem
          onClick={() => featuresEnabled && navigate("/unidades")}
          sx={{
            borderRadius: 2,
            mb: 1,
            bgcolor: isActiveRoute("/unidades") ? "#2196f3" : "transparent",
            "&:hover": { bgcolor: featuresEnabled ? "#333" : "transparent" },
            cursor: featuresEnabled ? "pointer" : "not-allowed",
            opacity: featuresEnabled ? 1 : 0.5,
          }}
        >
          <ListItemIcon>
            <Business sx={{ color: featuresEnabled ? "#ccc" : "#666" }} />
          </ListItemIcon>
          <ListItemText primary="Unidades" primaryTypographyProps={{ fontSize: "0.9rem", color: featuresEnabled ? "#ccc" : "#666" }} />
        </ListItem>

        <Divider sx={{ my: 2, borderColor: "#333" }} />

        <ListItem
          onClick={() => featuresEnabled && navigate("/qrcode")}
          sx={{
            borderRadius: 2,
            mb: 1,
            bgcolor: isActiveRoute("/qrcode") ? "#9c27b0" : "transparent",
            "&:hover": { bgcolor: featuresEnabled ? (isActiveRoute("/qrcode") ? "#7b1fa2" : "#333") : "transparent" },
            cursor: featuresEnabled ? "pointer" : "not-allowed",
            opacity: featuresEnabled ? 1 : 0.5,
          }}
        >
          <ListItemIcon>
            <QrCode2 sx={{ color: isActiveRoute("/qrcode") ? "white" : featuresEnabled ? "#9c27b0" : "#666" }} />
          </ListItemIcon>
          <ListItemText primary="QRCode" primaryTypographyProps={{ fontSize: "0.9rem", fontWeight: isActiveRoute("/qrcode") ? 600 : 400, color: isActiveRoute("/qrcode") ? "white" : featuresEnabled ? "#ccc" : "#666" }} />
        </ListItem>

        <ListItem
          onClick={() => featuresEnabled && navigate("/rfid")}
          sx={{
            borderRadius: 2,
            mb: 1,
            bgcolor: isActiveRoute("/rfid") ? "#ff5722" : "transparent",
            "&:hover": { bgcolor: featuresEnabled ? "#333" : "transparent" },
            cursor: featuresEnabled ? "pointer" : "not-allowed",
            opacity: featuresEnabled ? 1 : 0.5,
          }}
        >
          <ListItemIcon>
            <Nfc sx={{ color: featuresEnabled ? "#ff5722" : "#666" }} />
          </ListItemIcon>
          <ListItemText primary="RFID" primaryTypographyProps={{ fontSize: "0.9rem", color: featuresEnabled ? "#ccc" : "#666" }} />
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
          <ListItemText primary="Sair" primaryTypographyProps={{ fontSize: "0.9rem", color: "#ccc" }} />
        </ListItem>
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#f8f9fa" }}>
      <Box sx={{ width: DRAWER_WIDTH, flexShrink: 0, display: { xs: "none", md: "block" } }}>
        {drawer}
      </Box>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { width: DRAWER_WIDTH } }}
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
            <Button startIcon={<ArrowBack />} onClick={() => navigate("/")} sx={{ color: "#666" }}>
              Voltar
            </Button>
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#333" }}>
              Gerar QRCodes
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton>
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            <Avatar sx={{ bgcolor: "#2196f3", width: 32, height: 32 }}>{userData.nome?.charAt(0) || "U"}</Avatar>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#333" }}>
                {userData.nome || "Usuario"}
              </Typography>
              <Typography variant="caption" sx={{ color: "#666" }}>
                {userData.email || "usuario@sistema.com"}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
          <Card sx={{ bgcolor: "white", border: "1px solid #e0e0e0" }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
                <QrCode2 sx={{ fontSize: 48, color: "#9c27b0" }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: "#333" }}>
                    Gerador de QRCodes
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#666" }}>
                    Preencha os campos abaixo para gerar QRCodes
                  </Typography>
                </Box>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
                  {success}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel id="unidade-label">Unidade *</InputLabel>
                      <Select
                        labelId="unidade-label"
                        value={selectedGaragem}
                        label="Unidade *"
                        onChange={(e) => setSelectedGaragem(e.target.value)}
                        disabled={loadingUnidades}
                      >
                        {loadingUnidades ? (
                          <MenuItem disabled>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Carregando unidades...
                          </MenuItem>
                        ) : (
                          unidades.map((unidade) => (
                            <MenuItem key={unidade.id} value={unidade.id_garagem}>
                              {unidade.nome_da_unidade} (Garagem: {unidade.id_garagem})
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel id="status-label">Status *</InputLabel>
                      <Select
                        labelId="status-label"
                        value={selectedStatus}
                        label="Status *"
                        onChange={(e) => setSelectedStatus(e.target.value)}
                      >
                        <MenuItem value="0">Para entrar</MenuItem>
                        <MenuItem value="2">Para sair</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Quantidade *"
                      type="number"
                      value={quantidade}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10)
                        if (!isNaN(val)) {
                          setQuantidade(Math.min(10, Math.max(1, val)))
                        }
                      }}
                      inputProps={{ min: 1, max: 10 }}
                      helperText="Maximo de 10 QRCodes por vez"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={submitting || loadingUnidades}
                      startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
                      sx={{
                        bgcolor: "#9c27b0",
                        "&:hover": { bgcolor: "#7b1fa2" },
                        py: 1.5,
                        fontSize: "1rem",
                      }}
                    >
                      {submitting ? "Gerando QRCodes..." : "Gerar QRCodes"}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  )
}
