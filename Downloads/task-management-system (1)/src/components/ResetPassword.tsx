"use client"

import { useEffect, useState } from "react"
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
  Divider,
} from "@mui/material"
import {
  Add,
  ArrowBack,
  Business,
  Dashboard,
  Engineering,
  History,
  Inventory2,
  LockReset,
  Logout,
  Menu,
  Nfc,
  QrCode2,
  Send,
} from "@mui/icons-material"
import { useLocation, useNavigate } from "react-router-dom"
import { authService } from "../services/authService"
import { apiService, type Unit } from "../services/apiService"

const DRAWER_WIDTH = 240

interface ResetPasswordForm {
  username: string
  email: string
  unidade: string
}

export default function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [units, setUnits] = useState<Unit[]>([])
  const [loadingUnits, setLoadingUnits] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [form, setForm] = useState<ResetPasswordForm>({ username: "", email: "", unidade: "" })
  const [fieldErrors, setFieldErrors] = useState<Partial<ResetPasswordForm>>({})
  const [userData] = useState(() => authService.getUserData())

  const featuresEnabled = authService.shouldEnableFeatures()

  useEffect(() => {
    const loadUnits = async () => {
      setLoadingUnits(true)
      setError(null)

      try {
        setUnits(await apiService.getUnits())
      } catch (loadError) {
        console.error("Erro ao carregar unidades:", loadError)
        setError("Não foi possível carregar as unidades. Tente novamente.")
      } finally {
        setLoadingUnits(false)
      }
    }

    loadUnits()
  }, [])

  const handleChange = (field: keyof ResetPasswordForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined, ...(field === "username" || field === "email" ? { username: undefined, email: undefined } : {}) }))
  }

  const validate = () => {
    const errors: Partial<ResetPasswordForm> = {}

    if (!form.username.trim() && !form.email.trim()) {
      errors.username = "Informe o username ou o e-mail do usuário CloudAccess."
      errors.email = "Informe o username ou o e-mail do usuário CloudAccess."
    }

    if (!form.unidade) {
      errors.unidade = "Selecione a unidade."
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!validate()) {
      return
    }

    const userId = Number(userData?.id)
    if (!Number.isFinite(userId) || userId <= 0) {
      setError("Não foi possível identificar o usuário autenticado. Faça login novamente.")
      return
    }

    setSubmitting(true)
    try {
      await apiService.requestCloudAccessPasswordReset({
        user: userId,
        username_user_cloudaccess: form.username.trim(),
        email_user_cloudaccess: form.email.trim(),
        unidade: form.unidade,
      })
      setSuccess("Solicitação de reset de senha enviada com sucesso.")
      setForm({ username: "", email: "", unidade: "" })
    } catch (requestError) {
      console.error("Erro ao solicitar reset de senha:", requestError)
      setError(requestError instanceof Error ? requestError.message : "Não foi possível solicitar o reset de senha. Tente novamente.")
    } finally {
      setSubmitting(false)
    }
  }

  const isActiveRoute = (path: string) => location.pathname === path
  const navigationItems = [
    { label: "Dashboard", path: "/", icon: <Dashboard />, enabled: true },
    { label: "Nova Tarefa", path: "/nova-tarefa", icon: <Add />, enabled: featuresEnabled },
    { label: "Histórico", path: "/historico", icon: <History />, enabled: featuresEnabled },
    { label: "Unidades", path: "/unidades", icon: <Business />, enabled: featuresEnabled },
    { label: "Inventário", path: "/inventario", icon: <Inventory2 />, enabled: featuresEnabled },
    { label: "Qrcode", path: "/qrcode", icon: <QrCode2 />, enabled: featuresEnabled },
    { label: "RFID", path: "/rfid", icon: <Nfc />, enabled: featuresEnabled },
    { label: "Reset de Senha", path: "/reset-senha-cloudaccess", icon: <LockReset />, enabled: featuresEnabled },
  ]

  const drawer = (
    <Box sx={{ height: "100%", bgcolor: "#1a1a1a", color: "white" }}>
      <Box sx={{ p: 3, borderBottom: "1px solid #333" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Engineering sx={{ fontSize: 32, color: "#2196f3" }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>GerecTech</Typography>
        </Box>
      </Box>
      <List sx={{ px: 2, py: 1 }}>
        {navigationItems.map((item, index) => {
          const active = isActiveRoute(item.path)
          const showDivider = index === 5
          return (
            <Box key={item.path}>
              {showDivider && <Divider sx={{ my: 2, borderColor: "#333" }} />}
              <ListItem
                onClick={() => item.enabled && navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  bgcolor: active ? "#2196f3" : "transparent",
                  "&:hover": { bgcolor: item.enabled ? (active ? "#1976d2" : "#333") : "transparent" },
                  cursor: item.enabled ? "pointer" : "not-allowed",
                  opacity: item.enabled ? 1 : 0.5,
                }}
              >
                <ListItemIcon sx={{ color: active ? "white" : item.enabled ? "#ccc" : "#666" }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: "0.9rem", fontWeight: active ? 600 : 400, color: active ? "white" : item.enabled ? "#ccc" : "#666" }} />
              </ListItem>
            </Box>
          )
        })}
        <Divider sx={{ my: 2, borderColor: "#333" }} />
        <ListItem onClick={() => authService.logout()} sx={{ borderRadius: 2, "&:hover": { bgcolor: "#d32f2f" }, cursor: "pointer" }}>
          <ListItemIcon><Logout sx={{ color: "#ccc" }} /></ListItemIcon>
          <ListItemText primary="Sair" primaryTypographyProps={{ fontSize: "0.9rem", color: "#ccc" }} />
        </ListItem>
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8f9fa" }}>
      <Box sx={{ width: DRAWER_WIDTH, flexShrink: 0, display: { xs: "none", md: "block" } }}>{drawer}</Box>
      <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { width: DRAWER_WIDTH } }}>
        {drawer}
      </Drawer>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 3, bgcolor: "white", borderBottom: "1px solid #e0e0e0" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton sx={{ display: { md: "none" } }} onClick={() => setMobileOpen(true)}><Menu /></IconButton>
            <Button startIcon={<ArrowBack />} onClick={() => navigate("/")} sx={{ color: "#666" }}>Voltar</Button>
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#333" }}>Reset de Senha CloudAccess</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar sx={{ bgcolor: "#2196f3", width: 32, height: 32 }}>{userData?.username?.charAt(0) || "U"}</Avatar>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#333" }}>{userData?.username || "Usuário"}</Typography>
              <Typography variant="caption" sx={{ color: "#666" }}>{userData?.email || "usuario@sistema.com"}</Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 760, mx: "auto" }}>
          <Card sx={{ bgcolor: "white", border: "1px solid #e0e0e0" }}>
            <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#333", mb: 1 }}>Solicitar reset de senha</Typography>
              <Typography variant="body2" sx={{ color: "#666", mb: 3 }}>Informe o username, o e-mail ou ambos para localizar o usuário no CloudAccess.</Typography>
              {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>{success}</Alert>}
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Username CloudAccess" value={form.username} onChange={(event) => handleChange("username", event.target.value)} error={Boolean(fieldErrors.username)} helperText={fieldErrors.username} disabled={submitting} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth type="email" label="E-mail CloudAccess" value={form.email} onChange={(event) => handleChange("email", event.target.value)} error={Boolean(fieldErrors.email)} helperText={fieldErrors.email} disabled={submitting} />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth error={Boolean(fieldErrors.unidade)} disabled={loadingUnits || submitting}>
                      <InputLabel id="unidade-label">Unidade</InputLabel>
                      <Select labelId="unidade-label" label="Unidade" value={form.unidade} onChange={(event) => handleChange("unidade", event.target.value)}>
                        {units.filter((unit) => unit.id_garagem).map((unit) => <MenuItem key={unit.id} value={unit.id_garagem}>{unit.nome_da_unidade}</MenuItem>)}
                      </Select>
                      {fieldErrors.unidade && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>{fieldErrors.unidade}</Typography>}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Button type="submit" variant="contained" disabled={submitting || loadingUnits} startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <Send />}>
                      {submitting ? "Enviando solicitação..." : "Solicitar reset"}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  )
}
