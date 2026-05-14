"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import {
  Add,
  ArrowBack,
  Business,
  Inventory2,
  Dashboard,
  Engineering,
  History,
  Logout,
  Menu,
  Nfc,
  QrCode2,
  Save,
} from "@mui/icons-material"
import { useLocation, useNavigate } from "react-router-dom"
import { apiService, type Unit } from "../services/apiService"
import { authService } from "../services/authService"

const DRAWER_WIDTH = 240
type AdditionMode = "Unitario" | "Lista"

const extractTickets = (value: string): string[] => {
  const matches = value.match(/\d+/g) || []
  return matches.filter((item) => item.length > 0)
}

const uniqueTickets = (tickets: string[]) => Array.from(new Set(tickets))

export default function RFIDPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [unidades, setUnidades] = useState<Unit[]>([])
  const [loadingUnidades, setLoadingUnidades] = useState(true)
  const [selectedGaragem, setSelectedGaragem] = useState("")
  const [adicaoCartao, setAdicaoCartao] = useState<AdditionMode>("Unitario")
  const [rawTickets, setRawTickets] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [userData] = useState<{ username: string; email: string }>({
    username: authService.getUserData()?.username || "Usuario",
    email: authService.getUserData()?.email || "usuario@sistema.com",
  })

  const featuresEnabled = authService.shouldEnableFeatures()

  useEffect(() => {
    const loadPageData = async () => {
      setLoadingUnidades(true)
      setError(null)

      try {
        const units = await apiService.getQRCodeUnits()
        setUnidades(units)
      } catch (err) {
        console.error("Erro ao carregar tela de RFID:", err)
        setError("Erro ao carregar dados da tela. Verifique a conexao com o servidor.")
      } finally {
        setLoadingUnidades(false)
      }
    }

    loadPageData()
  }, [])

  const identifiedTickets = useMemo(() => uniqueTickets(extractTickets(rawTickets)), [rawTickets])
  const normalizedTicketString = useMemo(() => identifiedTickets.join(","), [identifiedTickets])

  const validateForm = (): string | null => {
    if (!selectedGaragem) {
      return "Selecione uma unidade"
    }

    if (identifiedTickets.length === 0) {
      return "Informe ao menos um cartao valido"
    }

    if (adicaoCartao === "Unitario" && identifiedTickets.length !== 1) {
      return "No modo Unitario, informe exatamente um cartao valido"
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    const ticketCartao = adicaoCartao === "Unitario" ? identifiedTickets[0] : normalizedTicketString

    setSubmitting(true)

    try {
      await apiService.createRFID({
        ticket_cartao: ticketCartao,
        id_garagem: selectedGaragem,
        adicao_cartao: adicaoCartao,
      })

      setSuccess(
        adicaoCartao === "Unitario"
          ? "Cartao RFID enviado com sucesso!"
          : `${identifiedTickets.length} cartao(oes) RFID enviado(s) com sucesso!`,
      )
      setRawTickets("")
      setSelectedGaragem("")
      setAdicaoCartao("Unitario")
    } catch (err: any) {
      console.error("Erro ao enviar RFID:", err)
      setError(err.message || "Erro ao enviar RFID")
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

  const isActiveRoute = (path: string) => location.pathname === path

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

        <ListItem
          onClick={() => featuresEnabled && navigate("/inventario")}
          sx={{
            borderRadius: 2,
            mb: 1,
            bgcolor: isActiveRoute("/inventario") ? "#2196f3" : "transparent",
            "&:hover": { bgcolor: featuresEnabled ? (isActiveRoute("/inventario") ? "#1976d2" : "#333") : "transparent" },
            cursor: featuresEnabled ? "pointer" : "not-allowed",
            opacity: featuresEnabled ? 1 : 0.5,
          }}
        >
          <ListItemIcon>
            <Inventory2 sx={{ color: isActiveRoute("/inventario") ? "white" : featuresEnabled ? "#ccc" : "#666" }} />
          </ListItemIcon>
          <ListItemText primary="Inventário" primaryTypographyProps={{ fontSize: "0.9rem", fontWeight: isActiveRoute("/inventario") ? 600 : 400, color: isActiveRoute("/inventario") ? "white" : featuresEnabled ? "#ccc" : "#666" }} />
        </ListItem>

        <Divider sx={{ my: 2, borderColor: "#333" }} />

        <ListItem
          onClick={() => featuresEnabled && navigate("/qrcode")}
          sx={{
            borderRadius: 2,
            mb: 1,
            bgcolor: isActiveRoute("/qrcode") ? "#2196f3" : "transparent",
            "&:hover": { bgcolor: featuresEnabled ? "#333" : "transparent" },
            cursor: featuresEnabled ? "pointer" : "not-allowed",
            opacity: featuresEnabled ? 1 : 0.5,
          }}
        >
          <ListItemIcon>
            <QrCode2 sx={{ color: featuresEnabled ? "#ccc" : "#666" }} />
          </ListItemIcon>
          <ListItemText primary="Qrcode" primaryTypographyProps={{ fontSize: "0.9rem", color: featuresEnabled ? "#ccc" : "#666" }} />
        </ListItem>

        <ListItem
          onClick={() => featuresEnabled && navigate("/rfid")}
          sx={{
            borderRadius: 2,
            mb: 1,
            bgcolor: isActiveRoute("/rfid") ? "#2196f3" : "transparent",
            "&:hover": { bgcolor: featuresEnabled ? (isActiveRoute("/rfid") ? "#1976d2" : "#333") : "transparent" },
            cursor: featuresEnabled ? "pointer" : "not-allowed",
            opacity: featuresEnabled ? 1 : 0.5,
          }}
        >
          <ListItemIcon>
            <Nfc sx={{ color: isActiveRoute("/rfid") ? "white" : featuresEnabled ? "#ccc" : "#666" }} />
          </ListItemIcon>
          <ListItemText primary="RFID" primaryTypographyProps={{ fontSize: "0.9rem", fontWeight: isActiveRoute("/rfid") ? 600 : 400, color: isActiveRoute("/rfid") ? "white" : featuresEnabled ? "#ccc" : "#666" }} />
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
              RFID
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "#2196f3", width: 32, height: 32 }}>{userData.username?.charAt(0) || "U"}</Avatar>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#333" }}>
                {userData.username || "Usuario"}
              </Typography>
              <Typography variant="caption" sx={{ color: "#666" }}>
                {userData.email || "usuario@sistema.com"}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: 3, maxWidth: 920, mx: "auto" }}>
          <Card sx={{ bgcolor: "white", border: "1px solid #e0e0e0" }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
                <Nfc sx={{ fontSize: 48, color: "#2196f3" }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: "#333" }}>
                    Cadastro RFID
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#666" }}>
                    Cole um ou mais cartoes. O sistema extrai apenas os numeros e monta o payload automaticamente.
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
                      <InputLabel id="unidade-rfid-label">Unidade *</InputLabel>
                      <Select
                        labelId="unidade-rfid-label"
                        value={selectedGaragem}
                        label="Unidade *"
                        onChange={(e) => setSelectedGaragem(e.target.value)}
                        disabled={loadingUnidades || submitting}
                        sx={{
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#d0d7de",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#4285f4",
                          },
                        }}
                      >
                        {loadingUnidades ? (
                          <MenuItem disabled>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Carregando unidades...
                          </MenuItem>
                        ) : (
                          unidades.map((unidade) => (
                            <MenuItem key={unidade.id} value={unidade.id_garagem || ""}>
                              {unidade.nome_da_unidade}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Card
                      sx={{
                        border: "1px solid #e0e0e0",
                        boxShadow: "none",
                        bgcolor: "#fcfcfc",
                      }}
                    >
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#333", mb: 2 }}>
                          Adicao de cartao
                        </Typography>
                        <FormControl>
                          <RadioGroup
                            row
                            value={adicaoCartao}
                            onChange={(e) => {
                              setAdicaoCartao(e.target.value as AdditionMode)
                              setError(null)
                              setSuccess(null)
                            }}
                          >
                            <FormControlLabel
                              value="Unitario"
                              control={<Radio sx={{ "&.Mui-checked": { color: "#4285f4" } }} />}
                              label="Unitario"
                            />
                            <FormControlLabel
                              value="Lista"
                              control={<Radio sx={{ "&.Mui-checked": { color: "#4285f4" } }} />}
                              label="Lista"
                            />
                          </RadioGroup>
                        </FormControl>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="ticket_cartao *"
                      multiline
                      minRows={8}
                      value={rawTickets}
                      onChange={(e) => {
                        setRawTickets(e.target.value)
                        setError(null)
                        setSuccess(null)
                      }}
                      disabled={submitting}
                      placeholder={`Cole aqui os cartoes, mensagens ou listas.\n\nExemplo:\n\n0004543693\n0005170726`}
                      helperText="Textos, espacos e caracteres invalidos sao ignorados automaticamente."
                      sx={{
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#4285f4",
                        },
                        "& .MuiFormLabel-root.Mui-focused": {
                          color: "#4285f4",
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Stack
                      spacing={1.5}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "#eef4ff",
                        border: "1px solid #c9dafc",
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ color: "#244a9b", fontWeight: 700 }}>
                        Cartoes identificados:
                      </Typography>
                      {identifiedTickets.length > 0 ? (
                        identifiedTickets.map((ticket) => (
                          <Typography key={ticket} variant="body2" sx={{ color: "#244a9b", fontWeight: 500 }}>
                            {"\u2714"} {ticket}
                          </Typography>
                        ))
                      ) : (
                        <Typography variant="body2" sx={{ color: "#244a9b" }}>
                          Nenhum cartao numerico identificado ainda.
                        </Typography>
                      )}
                    </Stack>
                  </Grid>

                  <Grid item xs={12}>
                    <Card
                      sx={{
                        border: "1px dashed #e0e0e0",
                        boxShadow: "none",
                        bgcolor: "#fafafa",
                      }}
                    >
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#333", mb: 1 }}>
                          Payload normalizado
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#666", wordBreak: "break-all" }}>
                          {adicaoCartao === "Unitario"
                            ? identifiedTickets[0] || "-"
                            : normalizedTicketString || "-"}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#888", display: "block", mt: 1 }}>
                          No modo Lista, duplicados sao removidos automaticamente e os cartoes ficam separados por virgula.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={submitting || loadingUnidades}
                      startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Save />}
                      sx={{
                        bgcolor: "#4285f4",
                        "&:hover": { bgcolor: "#3367d6" },
                        py: 1.5,
                        fontSize: "1rem",
                      }}
                    >
                      {submitting ? "Enviando RFID..." : "Enviar RFID"}
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
