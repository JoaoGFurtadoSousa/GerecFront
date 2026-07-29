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
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
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
  PersonAdd,
  Logout,
  Menu,
  Nfc,
  QrCode2,
  Send,
} from "@mui/icons-material"
import { useLocation, useNavigate } from "react-router-dom"
import { authService } from "../services/authService"
import { apiService, type PasswordResetResponse, type Unit } from "../services/apiService"
import MultiUnitSelect from "./MultiUnitSelect"

const DRAWER_WIDTH = 0

interface ResetPasswordForm {
  username: string
  email: string
  unidades: number[]
}

type ResetPasswordFieldErrors = Partial<Record<keyof ResetPasswordForm, string>>

export default function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [units, setUnits] = useState<Unit[]>([])
  const [loadingUnits, setLoadingUnits] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PasswordResetResponse | null>(null)
  const [form, setForm] = useState<ResetPasswordForm>({ username: "", email: "", unidades: [] })
  const [fieldErrors, setFieldErrors] = useState<ResetPasswordFieldErrors>({})
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

  const handleChange = (field: "username" | "email", value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined, ...(field === "username" || field === "email" ? { username: undefined, email: undefined } : {}) }))
  }

  const validate = () => {
    const errors: ResetPasswordFieldErrors = {}

    if (!form.username.trim() && !form.email.trim()) {
      errors.username = "Informe o username ou o e-mail do usuário CloudAccess."
      errors.email = "Informe o username ou o e-mail do usuário CloudAccess."
    }

    if (form.unidades.length === 0) {
      errors.unidades = "Selecione pelo menos uma unidade."
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setResult(null)

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
      const response = await apiService.requestCloudAccessPasswordReset({
        user: userId,
        username_user_cloudaccess: form.username.trim(),
        email_user_cloudaccess: form.email.trim(),
        unidades: form.unidades,
      })
      setResult(response)
      setForm({ username: "", email: "", unidades: [] })
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
    { label: "Criar Usuário CloudAccess", path: "/criar-usuario-cloudaccess", icon: <PersonAdd />, enabled: featuresEnabled },
  ]

  const drawer = null

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8f9fa" }}>
      <Box sx={{ width: DRAWER_WIDTH, flexShrink: 0, display: { xs: "none", md: "block" } }}>{null}</Box>
      <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { width: DRAWER_WIDTH } }}>
        {null}
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
              {result && result.detail.unidades_fail.length === 0 && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setResult(null)}>
                  Reset de senha processado com sucesso para todas as unidades selecionadas.
                </Alert>
              )}
              {result && result.detail.unidades_fail.length > 0 && (
                <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setResult(null)}>
                  O reset foi concluído parcialmente. Confira os detalhes abaixo.
                </Alert>
              )}
              {result && (
                <Box sx={{ mb: 3 }}>
                  {result.detail.unidades_ok.length > 0 && (
                    <Box sx={{ mb: result.detail.unidades_fail.length > 0 ? 2 : 0 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Unidades processadas com sucesso</Typography>
                      {result.detail.unidades_ok.map((unit) => <Typography key={unit.unidade} variant="body2">• Unidade {unit.garagem}</Typography>)}
                    </Box>
                  )}
                  {result.detail.unidades_fail.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" color="error" sx={{ fontWeight: 600 }}>Unidades com erro</Typography>
                      {result.detail.unidades_fail.map((unit) => <Box key={unit.unidade} sx={{ mb: 1 }}><Typography variant="body2">• Unidade {unit.garagem}</Typography><Typography variant="body2" color="error" sx={{ pl: 2 }}>{unit.erro}</Typography></Box>)}
                    </Box>
                  )}
                </Box>
              )}
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Username CloudAccess" value={form.username} onChange={(event) => handleChange("username", event.target.value)} error={Boolean(fieldErrors.username)} helperText={fieldErrors.username} disabled={submitting} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth type="email" label="E-mail CloudAccess" value={form.email} onChange={(event) => handleChange("email", event.target.value)} error={Boolean(fieldErrors.email)} helperText={fieldErrors.email} disabled={submitting} />
                  </Grid>
                  <Grid item xs={12}>
                    <MultiUnitSelect units={units} value={form.unidades} disabled={loadingUnits || submitting} error={fieldErrors.unidades} onChange={(unidades) => { setForm((current) => ({ ...current, unidades })); setFieldErrors((current) => ({ ...current, unidades: undefined })) }} />
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
