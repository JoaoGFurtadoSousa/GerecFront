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
  Stack,
  TextField,
  Typography,
  Divider,
} from "@mui/material"
import {
  Add,
  ArrowBack,
  Business,
  Dashboard,
  Download,
  Engineering,
  History,
  Link as LinkIcon,
  Logout,
  Menu,
  Nfc,
  QrCode2,
  Share,
  Send,
} from "@mui/icons-material"
import { useLocation, useNavigate } from "react-router-dom"
import { authService } from "../services/authService"
import { apiService, type Unit } from "../services/apiService"

const DRAWER_WIDTH = 240
const QR_IMAGE_BASE_URL = "http://192.168.15.29:8000"

interface CreatedQRCodeResponseItem {
  qrcode_url?: string
  ticket_cartao?: string
}

interface GeneratedQRCode {
  fileName: string
  fileNameWithExtension: string
  imageUrl: string
  qrcodeUrlPath: string
}

export default function QRCodePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [unidades, setUnidades] = useState<Unit[]>([])
  const [loadingUnidades, setLoadingUnidades] = useState(true)
  const [selectedGaragem, setSelectedGaragem] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [quantidadeInput, setQuantidadeInput] = useState("1")
  const [quantidadeError, setQuantidadeError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [generatedQRCodes, setGeneratedQRCodes] = useState<GeneratedQRCode[]>([])
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
        console.error("Erro ao carregar tela de QRCode:", err)
        setError("Erro ao carregar dados da tela. Verifique a conexao com o servidor.")
      } finally {
        setLoadingUnidades(false)
      }
    }

    loadPageData()
  }, [])

  const parseTicketCartaoFileName = (ticketCartaoRaw: unknown): string | null => {
    if (typeof ticketCartaoRaw !== "string" || !ticketCartaoRaw.trim()) {
      return null
    }

    try {
      const parsed = JSON.parse(ticketCartaoRaw)
      if (parsed && typeof parsed.ticket_cartao === "string" && parsed.ticket_cartao.trim()) {
        return parsed.ticket_cartao.trim()
      }
    } catch (parseError) {
      console.warn("Nao foi possivel fazer parse de ticket_cartao:", parseError)
    }

    return null
  }

  const normalizeQRCodeUrl = (qrcodeUrlPath: string): string => {
    if (!qrcodeUrlPath) {
      return ""
    }

    if (qrcodeUrlPath.startsWith("http://") || qrcodeUrlPath.startsWith("https://")) {
      return qrcodeUrlPath
    }

    return `${QR_IMAGE_BASE_URL}${qrcodeUrlPath.startsWith("/") ? "" : "/"}${qrcodeUrlPath}`
  }

  const downloadFile = async (url: string, fileName: string) => {
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = fileName
    anchor.target = "_blank"
    anchor.rel = "noopener noreferrer"
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
  }

  const handleDownloadSingle = async (qrCode: GeneratedQRCode) => {
    await downloadFile(qrCode.imageUrl, qrCode.fileNameWithExtension)
  }

  const handleDownloadAll = async () => {
    if (generatedQRCodes.length === 0) {
      return
    }

    for (const qrCode of generatedQRCodes) {
      // Pequeno intervalo evita bloqueio de popups em alguns navegadores.
      await downloadFile(qrCode.imageUrl, qrCode.fileNameWithExtension)
      await new Promise((resolve) => setTimeout(resolve, 120))
    }
  }

  const handleShareSingle = async (qrCode: GeneratedQRCode) => {
    const shareText = `QRCode ${qrCode.fileNameWithExtension}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: "QRCode gerado",
          text: shareText,
          url: qrCode.imageUrl,
        })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(qrCode.imageUrl)
        setSuccess(`Link copiado para a area de transferencia: ${qrCode.fileNameWithExtension}`)
      }
    } catch (shareError) {
      console.warn("Compartilhamento cancelado/indisponivel:", shareError)
    }
  }

  const handleShareAll = async () => {
    if (generatedQRCodes.length === 0) {
      return
    }

    const allLinks = generatedQRCodes.map((item) => item.imageUrl).join("\n")

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(allLinks)
        setSuccess("Links dos QRCodes copiados para a area de transferencia.")
      } else {
        setError("Seu navegador nao suporta copia automatica. Copie os links manualmente.")
      }
    } catch (clipboardError) {
      console.error("Erro ao copiar links:", clipboardError)
      setError("Nao foi possivel copiar os links dos QRCodes.")
    }
  }

  const validateQuantidade = (value: string): { value: number | null; error: string | null } => {
    const sanitizedValue = value.trim()

    if (!sanitizedValue) {
      return { value: null, error: "Informe a quantidade de QRCodes." }
    }

    if (!/^\d+$/.test(sanitizedValue)) {
      return { value: null, error: "Use apenas numeros inteiros entre 1 e 10." }
    }

    const parsed = Number.parseInt(sanitizedValue, 10)
    if (Number.isNaN(parsed) || parsed < 1 || parsed > 10) {
      return { value: null, error: "A quantidade deve ser entre 1 e 10." }
    }

    return { value: parsed, error: null }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setQuantidadeError(null)

    if (!selectedGaragem) {
      setError("Selecione uma unidade")
      return
    }

    if (!selectedStatus) {
      setError("Selecione o status")
      return
    }

    const quantidadeValidation = validateQuantidade(quantidadeInput)
    if (quantidadeValidation.error || quantidadeValidation.value === null) {
      setQuantidadeError(quantidadeValidation.error)
      setError(quantidadeValidation.error)
      return
    }

    setSubmitting(true)
    setGeneratedQRCodes([])

    try {
      const response = await apiService.createQRCodes({
        id_garagem: selectedGaragem,
        status: selectedStatus,
        quantidade: quantidadeValidation.value,
      })

      const createdItems = Array.isArray(response?.qrcodes_createds) ? response.qrcodes_createds : []
      const mappedQRCodes: GeneratedQRCode[] = createdItems
        .map((item: CreatedQRCodeResponseItem) => {
          const fileName = parseTicketCartaoFileName(item.ticket_cartao)
          const qrcodeUrlPath = typeof item.qrcode_url === "string" ? item.qrcode_url : ""
          const imageUrl = normalizeQRCodeUrl(qrcodeUrlPath)

          if (!fileName || !imageUrl) {
            return null
          }

          return {
            fileName,
            fileNameWithExtension: `${fileName}.png`,
            imageUrl,
            qrcodeUrlPath,
          }
        })
        .filter((item): item is GeneratedQRCode => item !== null)

      setGeneratedQRCodes(mappedQRCodes)
      setSuccess(`${mappedQRCodes.length} QRCode(s) criado(s) e pronto(s) para visualizacao/download.`)
      setSelectedGaragem("")
      setSelectedStatus("")
      setQuantidadeInput("1")
      setQuantidadeError(null)
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

        <Divider sx={{ my: 2, borderColor: "#333" }} />

        <ListItem
          onClick={() => featuresEnabled && navigate("/qrcode")}
          sx={{
            borderRadius: 2,
            mb: 1,
            bgcolor: isActiveRoute("/qrcode") ? "#2196f3" : "transparent",
            "&:hover": { bgcolor: featuresEnabled ? (isActiveRoute("/qrcode") ? "#1976d2" : "#333") : "transparent" },
            cursor: featuresEnabled ? "pointer" : "not-allowed",
            opacity: featuresEnabled ? 1 : 0.5,
          }}
        >
          <ListItemIcon>
            <QrCode2 sx={{ color: isActiveRoute("/qrcode") ? "white" : featuresEnabled ? "#ccc" : "#666" }} />
          </ListItemIcon>
          <ListItemText primary="Qrcode" primaryTypographyProps={{ fontSize: "0.9rem", fontWeight: isActiveRoute("/qrcode") ? 600 : 400, color: isActiveRoute("/qrcode") ? "white" : featuresEnabled ? "#ccc" : "#666" }} />
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
              Qrcode
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

        <Box sx={{ p: 3, maxWidth: 820, mx: "auto" }}>
          <Card sx={{ bgcolor: "white", border: "1px solid #e0e0e0" }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
                <QrCode2 sx={{ fontSize: 48, color: "#2196f3" }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: "#333" }}>
                    Gerador de QRCodes
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#666" }}>
                    Gere lotes de ate 10 QRCodes usando a unidade, o status e a quantidade desejada.
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
                    <FormControl fullWidth>
                      <InputLabel id="status-label">Status *</InputLabel>
                      <Select
                        labelId="status-label"
                        value={selectedStatus}
                        label="Status *"
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        disabled={submitting}
                        sx={{
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#d0d7de",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#4285f4",
                          },
                        }}
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
                      value={quantidadeInput}
                      onChange={(e) => {
                        const newValue = e.target.value
                        setQuantidadeInput(newValue)
                        const validation = validateQuantidade(newValue)
                        setQuantidadeError(validation.error)
                      }}
                      inputProps={{ min: 1, max: 10, step: 1 }}
                      disabled={submitting}
                      error={Boolean(quantidadeError)}
                      helperText={quantidadeError || "Informe um valor entre 1 e 10"}
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
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={submitting || loadingUnidades || Boolean(quantidadeError)}
                      startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
                      sx={{
                        bgcolor: "#4285f4",
                        "&:hover": { bgcolor: "#3367d6" },
                        py: 1.5,
                        fontSize: "1rem",
                      }}
                    >
                      {submitting ? "Gerando QRCodes..." : "Gerar QRCodes"}
                    </Button>
                  </Grid>
                </Grid>
              </form>

              {generatedQRCodes.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={2}
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="h6" sx={{ color: "#333", fontWeight: 600 }}>
                      QRCodes gerados ({generatedQRCodes.length})
                    </Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                      <Button variant="outlined" startIcon={<Download />} onClick={handleDownloadAll}>
                        Baixar todos
                      </Button>
                      <Button variant="outlined" startIcon={<Share />} onClick={handleShareAll}>
                        Compartilhar todos
                      </Button>
                    </Stack>
                  </Stack>

                  <Grid container spacing={2}>
                    {generatedQRCodes.map((qrCode) => (
                      <Grid item xs={12} sm={6} md={4} key={qrCode.fileName}>
                        <Card variant="outlined" sx={{ height: "100%" }}>
                          <CardContent>
                            <Box
                              component="img"
                              src={qrCode.imageUrl}
                              alt={`QRCode ${qrCode.fileNameWithExtension}`}
                              sx={{
                                width: "100%",
                                maxHeight: 240,
                                objectFit: "contain",
                                borderRadius: 1,
                                bgcolor: "#fafafa",
                                border: "1px solid #eee",
                                p: 1.5,
                                mb: 1.5,
                              }}
                            />
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, wordBreak: "break-all" }}>
                              {qrCode.fileNameWithExtension}
                            </Typography>
                            <Stack spacing={1}>
                              <Button
                                variant="contained"
                                startIcon={<Download />}
                                onClick={() => handleDownloadSingle(qrCode)}
                                sx={{ bgcolor: "#4285f4", "&:hover": { bgcolor: "#3367d6" } }}
                              >
                                Baixar
                              </Button>
                              <Button variant="outlined" startIcon={<Share />} onClick={() => handleShareSingle(qrCode)}>
                                Compartilhar
                              </Button>
                              <Button
                                variant="text"
                                startIcon={<LinkIcon />}
                                onClick={() => window.open(qrCode.imageUrl, "_blank", "noopener,noreferrer")}
                              >
                                Abrir imagem
                              </Button>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  )
}
