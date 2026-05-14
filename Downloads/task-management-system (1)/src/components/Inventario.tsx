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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import {
  Add,
  AddCircleOutline,
  ArrowBack,
  Business,
  Dashboard,
  DeleteOutline,
  EditOutlined,
  Engineering,
  History,
  Inventory2,
  Logout,
  Menu,
  Nfc,
  QrCode2,
  RemoveCircleOutline,
  Search,
} from "@mui/icons-material"
import { useLocation, useNavigate } from "react-router-dom"
import {
  apiService,
  type InventoryItem,
  type InventoryPayload,
  type InventoryRemovePayload,
  type Unit,
} from "../services/apiService"
import { authService } from "../services/authService"

const DRAWER_WIDTH = 240

type InventoryDialogMode = "create" | "edit" | null

const parsePositiveInteger = (value: string) => {
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed)) {
    return null
  }

  return parsed
}

export default function Inventario() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [userData, setUserData] = useState<{ username: string; email: string }>({
    username: "Usuário",
    email: "usuario@sistema.com",
  })
  const [userLoading, setUserLoading] = useState(true)

  const [inventoryDialogMode, setInventoryDialogMode] = useState<InventoryDialogMode>(null)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [inventoryForm, setInventoryForm] = useState({
    nome_do_equipamento: "",
    quantidade: "",
  })
  const [inventoryFormErrors, setInventoryFormErrors] = useState<Record<string, string>>({})

  const [addStockOpen, setAddStockOpen] = useState(false)
  const [addStockQuantity, setAddStockQuantity] = useState("")
  const [addStockError, setAddStockError] = useState<string | null>(null)

  const [removeStockOpen, setRemoveStockOpen] = useState(false)
  const [removeStockQuantity, setRemoveStockQuantity] = useState("")
  const [removeStockUnitId, setRemoveStockUnitId] = useState("")
  const [removeStockError, setRemoveStockError] = useState<string | null>(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [activeActionKey, setActiveActionKey] = useState<string | null>(null)

  const featuresEnabled = authService.shouldEnableFeatures()

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = authService.getUserData()
        if (user) {
          setUserData(user)
        }
      } catch (loadError) {
        console.error("Erro ao carregar usuário:", loadError)
      } finally {
        setUserLoading(false)
      }
    }

    loadUserData()
  }, [])

  const loadInventoryPage = async () => {
    setLoading(true)
    setError(null)

    try {
      const [inventoryData, unitsData] = await Promise.all([apiService.getInventoryItems(), apiService.getUnits()])
      setInventoryItems(inventoryData)
      setUnits(unitsData)
    } catch (loadError) {
      console.error("Erro ao carregar inventário:", loadError)
      setError(loadError instanceof Error ? loadError.message : "Erro ao carregar inventário")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInventoryPage()
  }, [])

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return inventoryItems.filter((item) => item.nome_do_equipamento.toLowerCase().includes(normalizedSearch))
  }, [inventoryItems, searchTerm])

  const totalItens = inventoryItems.length
  const totalQuantidade = inventoryItems.reduce((sum, item) => sum + item.quantidade, 0)
  const itensComEstoque = inventoryItems.filter((item) => item.quantidade > 0).length

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleLogout = () => {
    authService.logout()
  }

  const isActiveRoute = (path: string) => location.pathname === path

  const handleInventoryFormChange = (field: "nome_do_equipamento" | "quantidade", value: string) => {
    setInventoryForm((prev) => ({ ...prev, [field]: value }))
    setInventoryFormErrors((prev) => ({ ...prev, [field]: "" }))
  }

  const resetInventoryForm = () => {
    setInventoryForm({
      nome_do_equipamento: "",
      quantidade: "",
    })
    setInventoryFormErrors({})
    setSelectedItem(null)
  }

  const validateInventoryForm = () => {
    const newErrors: Record<string, string> = {}
    const parsedQuantity = parsePositiveInteger(inventoryForm.quantidade)

    if (!inventoryForm.nome_do_equipamento.trim()) {
      newErrors.nome_do_equipamento = "Informe o nome do equipamento"
    }

    if (parsedQuantity === null) {
      newErrors.quantidade = "Informe uma quantidade inteira"
    } else if (parsedQuantity < 0) {
      newErrors.quantidade = "A quantidade não pode ser negativa"
    }

    setInventoryFormErrors(newErrors)

    return {
      valid: Object.keys(newErrors).length === 0,
      parsedQuantity,
    }
  }

  const handleOpenCreateDialog = () => {
    resetInventoryForm()
    setInventoryDialogMode("create")
  }

  const handleOpenEditDialog = (item: InventoryItem) => {
    setSelectedItem(item)
    setInventoryForm({
      nome_do_equipamento: item.nome_do_equipamento,
      quantidade: String(item.quantidade),
    })
    setInventoryFormErrors({})
    setInventoryDialogMode("edit")
  }

  const handleCloseInventoryDialog = () => {
    setInventoryDialogMode(null)
    resetInventoryForm()
  }

  const upsertInventoryItem = (updatedItem: InventoryItem) => {
    setInventoryItems((prevItems) => {
      const exists = prevItems.some((item) => item.id === updatedItem.id)

      if (exists) {
        return prevItems.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      }

      return [updatedItem, ...prevItems]
    })
  }

  const handleSubmitInventory = async () => {
    const { valid, parsedQuantity } = validateInventoryForm()

    if (!valid || parsedQuantity === null) {
      return
    }

    const payload: InventoryPayload = {
      nome_do_equipamento: inventoryForm.nome_do_equipamento.trim(),
      quantidade: parsedQuantity,
    }

    const actionKey = inventoryDialogMode === "edit" && selectedItem ? `edit-${selectedItem.id}` : "create"
    setActiveActionKey(actionKey)
    setError(null)
    setSuccess(null)

    try {
      const savedItem =
        inventoryDialogMode === "edit" && selectedItem
          ? await apiService.updateInventoryItem(selectedItem.id, payload)
          : await apiService.createInventoryItem(payload)

      upsertInventoryItem(savedItem)
      setSuccess(inventoryDialogMode === "edit" ? "Equipamento atualizado com sucesso." : "Equipamento cadastrado com sucesso.")
      handleCloseInventoryDialog()
    } catch (submitError) {
      console.error("Erro ao salvar equipamento:", submitError)
      setError(submitError instanceof Error ? submitError.message : "Erro ao salvar equipamento")
    } finally {
      setActiveActionKey(null)
    }
  }

  const handleOpenAddStockDialog = (item: InventoryItem) => {
    setSelectedItem(item)
    setAddStockQuantity("")
    setAddStockError(null)
    setAddStockOpen(true)
  }

  const handleCloseAddStockDialog = () => {
    setAddStockOpen(false)
    setAddStockQuantity("")
    setAddStockError(null)
    setSelectedItem(null)
  }

  const handleConfirmAddStock = async () => {
    if (!selectedItem) {
      return
    }

    const parsedQuantity = parsePositiveInteger(addStockQuantity)

    if (parsedQuantity === null || parsedQuantity <= 0) {
      setAddStockError("Informe uma quantidade inteira positiva.")
      return
    }

    setActiveActionKey(`add-${selectedItem.id}`)
    setAddStockError(null)
    setError(null)
    setSuccess(null)

    try {
      const updatedItem = await apiService.addInventoryStock(selectedItem.id, { quantidade: parsedQuantity })

      upsertInventoryItem(
        updatedItem?.id
          ? updatedItem
          : {
              ...selectedItem,
              quantidade: selectedItem.quantidade + parsedQuantity,
            },
      )

      setSuccess("Estoque atualizado com sucesso.")
      handleCloseAddStockDialog()
    } catch (submitError) {
      console.error("Erro ao adicionar estoque:", submitError)
      setAddStockError(submitError instanceof Error ? submitError.message : "Erro ao adicionar estoque")
    } finally {
      setActiveActionKey(null)
    }
  }

  const handleOpenRemoveStockDialog = (item: InventoryItem) => {
    setSelectedItem(item)
    setRemoveStockQuantity("")
    setRemoveStockUnitId("")
    setRemoveStockError(null)
    setRemoveStockOpen(true)
  }

  const handleCloseRemoveStockDialog = () => {
    setRemoveStockOpen(false)
    setRemoveStockQuantity("")
    setRemoveStockUnitId("")
    setRemoveStockError(null)
    setSelectedItem(null)
  }

  const handleConfirmRemoveStock = async () => {
    if (!selectedItem) {
      return
    }

    const parsedQuantity = parsePositiveInteger(removeStockQuantity)

    if (!removeStockUnitId) {
      setRemoveStockError("Selecione a unidade.")
      return
    }

    if (parsedQuantity === null || parsedQuantity <= 0) {
      setRemoveStockError("Informe uma quantidade inteira positiva.")
      return
    }

    if (parsedQuantity > selectedItem.quantidade) {
      setRemoveStockError("A retirada não pode ser maior que o estoque disponível.")
      return
    }

    const payload: InventoryRemovePayload = {
      nome_do_equipamento: selectedItem.nome_do_equipamento,
      unidade: Number(removeStockUnitId),
      quantidade: parsedQuantity,
    }

    setActiveActionKey(`remove-${selectedItem.id}`)
    setRemoveStockError(null)
    setError(null)
    setSuccess(null)

    try {
      const response = await apiService.removeInventoryStock(selectedItem.id, payload)
      upsertInventoryItem({
        ...selectedItem,
        quantidade: response.quantidade_de_equipamentos_no_inventario,
      })
      setSuccess(response.detail)
      handleCloseRemoveStockDialog()
    } catch (submitError) {
      console.error("Erro ao retirar equipamento:", submitError)
      setRemoveStockError(submitError instanceof Error ? submitError.message : "Erro ao retirar equipamento")
    } finally {
      setActiveActionKey(null)
    }
  }

  const handleOpenDeleteDialog = (item: InventoryItem) => {
    setSelectedItem(item)
    setDeleteDialogOpen(true)
  }

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setSelectedItem(null)
  }

  const handleDeleteInventoryItem = async () => {
    if (!selectedItem) {
      return
    }

    setActiveActionKey(`delete-${selectedItem.id}`)
    setError(null)
    setSuccess(null)

    try {
      await apiService.deleteInventoryItem(selectedItem.id)
      setInventoryItems((prevItems) => prevItems.filter((item) => item.id !== selectedItem.id))
      setSuccess("Equipamento excluído do inventário com sucesso.")
      handleCloseDeleteDialog()
    } catch (deleteError) {
      console.error("Erro ao excluir equipamento:", deleteError)
      setError(deleteError instanceof Error ? deleteError.message : "Erro ao excluir equipamento")
    } finally {
      setActiveActionKey(null)
    }
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
          <ListItemText primary="Histórico" primaryTypographyProps={{ fontSize: "0.9rem", color: featuresEnabled ? "#ccc" : "#666" }} />
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
          <ListItemText primary="Inventário" primaryTypographyProps={{ fontSize: "0.9rem", color: isActiveRoute("/inventario") ? "white" : featuresEnabled ? "#ccc" : "#666", fontWeight: isActiveRoute("/inventario") ? 600 : 400 }} />
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
            "&:hover": { bgcolor: featuresEnabled ? "#333" : "transparent" },
            cursor: featuresEnabled ? "pointer" : "not-allowed",
            opacity: featuresEnabled ? 1 : 0.5,
          }}
        >
          <ListItemIcon>
            <Nfc sx={{ color: featuresEnabled ? "#ccc" : "#666" }} />
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

  if (loading || userLoading) {
    return (
      <Box sx={{ display: "flex", height: "100vh" }}>
        <Box sx={{ width: DRAWER_WIDTH, flexShrink: 0, display: { xs: "none", md: "block" } }}>{drawer}</Box>
        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "#f8f9fa" }}>
          <CircularProgress size={60} />
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#f8f9fa" }}>
      <Box sx={{ width: DRAWER_WIDTH, flexShrink: 0, display: { xs: "none", md: "block" } }}>{drawer}</Box>

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
            <Button startIcon={<ArrowBack />} onClick={() => navigate("/")} sx={{ color: "#666" }}>
              Voltar
            </Button>
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#333" }}>
              Inventário
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "#2196f3", width: 32, height: 32 }}>{userData.username?.charAt(0) || "U"}</Avatar>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#333" }}>
                {userData.username}
              </Typography>
              <Typography variant="caption" sx={{ color: "#666" }}>
                {userData.email}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
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

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ bgcolor: "white", border: "1px solid #e0e0e0" }}>
                <CardContent>
                  <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
                    Equipamentos cadastrados
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: "#333" }}>
                    {totalItens}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ bgcolor: "white", border: "1px solid #e0e0e0" }}>
                <CardContent>
                  <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
                    Quantidade total em estoque
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: "#2196f3" }}>
                    {totalQuantidade}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ bgcolor: "white", border: "1px solid #e0e0e0" }}>
                <CardContent>
                  <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
                    Itens com estoque disponível
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: "#4caf50" }}>
                    {itensComEstoque}
                  </Typography>
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
                    placeholder="Buscar equipamento..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ color: "#999", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleOpenCreateDialog}
                    sx={{ py: 1.5 }}
                  >
                    Cadastrar Equipamento
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {loading ? (
            <Paper sx={{ p: 6, textAlign: "center", bgcolor: "white" }}>
              <CircularProgress />
            </Paper>
          ) : filteredItems.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: "center", bgcolor: "white" }}>
              <Inventory2 sx={{ fontSize: 64, color: "#d0d7de", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Nenhum equipamento encontrado
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cadastre um novo equipamento ou ajuste sua busca.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filteredItems.map((item) => (
                <Grid item xs={12} md={6} lg={4} key={item.id}>
                  <Card sx={{ height: "100%", border: "1px solid #e0e0e0", boxShadow: "none" }}>
                    <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: "#333" }}>
                            {item.nome_do_equipamento}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#666" }}>
                            ID #{item.id}
                          </Typography>
                        </Box>
                        <Paper
                          sx={{
                            px: 1.5,
                            py: 0.75,
                            bgcolor: item.quantidade > 0 ? "#e8f5e8" : "#ffebee",
                            color: item.quantidade > 0 ? "#2e7d32" : "#c62828",
                            fontWeight: 700,
                          }}
                        >
                          {item.quantidade}
                        </Paper>
                      </Box>

                      <Typography variant="body2" sx={{ color: "#666" }}>
                        Estoque atual do equipamento.
                      </Typography>

                      <Stack spacing={1.25}>
                        <Button
                          variant="contained"
                          startIcon={<AddCircleOutline />}
                          onClick={() => handleOpenAddStockDialog(item)}
                          disabled={activeActionKey !== null}
                        >
                          Adicionar Estoque
                        </Button>
                        <Button
                          variant="outlined"
                          color="warning"
                          startIcon={<RemoveCircleOutline />}
                          onClick={() => handleOpenRemoveStockDialog(item)}
                          disabled={activeActionKey !== null || item.quantidade <= 0}
                        >
                          Retirar do Estoque
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<EditOutlined />}
                          onClick={() => handleOpenEditDialog(item)}
                          disabled={activeActionKey !== null}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="text"
                          color="error"
                          startIcon={<DeleteOutline />}
                          onClick={() => handleOpenDeleteDialog(item)}
                          disabled={activeActionKey !== null}
                        >
                          Excluir Equipamento
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>

      <Dialog open={inventoryDialogMode !== null} onClose={handleCloseInventoryDialog} fullWidth maxWidth="sm">
        <DialogTitle>{inventoryDialogMode === "edit" ? "Editar Equipamento" : "Cadastrar Equipamento"}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Nome do equipamento"
              value={inventoryForm.nome_do_equipamento}
              onChange={(event) => handleInventoryFormChange("nome_do_equipamento", event.target.value)}
              error={!!inventoryFormErrors.nome_do_equipamento}
              helperText={inventoryFormErrors.nome_do_equipamento}
              fullWidth
            />
            <TextField
              label="Quantidade"
              type="number"
              value={inventoryForm.quantidade}
              onChange={(event) => handleInventoryFormChange("quantidade", event.target.value)}
              error={!!inventoryFormErrors.quantidade}
              helperText={inventoryFormErrors.quantidade || "Informe um número inteiro maior ou igual a zero."}
              inputProps={{ min: 0, step: 1 }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInventoryDialog}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSubmitInventory}
            disabled={activeActionKey === "create" || (selectedItem !== null && activeActionKey === `edit-${selectedItem.id}`)}
          >
            {activeActionKey === "create" || (selectedItem !== null && activeActionKey === `edit-${selectedItem.id}`) ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addStockOpen} onClose={handleCloseAddStockDialog} fullWidth maxWidth="xs">
        <DialogTitle>Adicionar Estoque</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Equipamento: {selectedItem?.nome_do_equipamento}
            </Typography>
            <TextField
              label="Quantidade a adicionar"
              type="number"
              value={addStockQuantity}
              onChange={(event) => setAddStockQuantity(event.target.value)}
              inputProps={{ min: 1, step: 1 }}
              fullWidth
            />
            {addStockError && <Alert severity="error">{addStockError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddStockDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleConfirmAddStock} disabled={selectedItem !== null && activeActionKey === `add-${selectedItem.id}`}>
            {selectedItem !== null && activeActionKey === `add-${selectedItem.id}` ? "Atualizando estoque..." : "Adicionar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={removeStockOpen} onClose={handleCloseRemoveStockDialog} fullWidth maxWidth="sm">
        <DialogTitle>Retirar do Estoque</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Equipamento: {selectedItem?.nome_do_equipamento}
            </Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Estoque disponível: {selectedItem?.quantidade ?? 0}
            </Typography>
            <FormControl fullWidth>
              <InputLabel id="inventario-unidade-label">Unidade</InputLabel>
              <Select
                labelId="inventario-unidade-label"
                value={removeStockUnitId}
                label="Unidade"
                onChange={(event) => setRemoveStockUnitId(String(event.target.value))}
              >
                {units.map((unit) => (
                  <MenuItem key={unit.id} value={unit.id}>
                    {unit.nome_da_unidade}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Quantidade a retirar"
              type="number"
              value={removeStockQuantity}
              onChange={(event) => setRemoveStockQuantity(event.target.value)}
              inputProps={{ min: 1, step: 1 }}
              fullWidth
            />
            {removeStockError && <Alert severity="error">{removeStockError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemoveStockDialog}>Cancelar</Button>
          <Button variant="contained" color="warning" onClick={handleConfirmRemoveStock} disabled={selectedItem !== null && activeActionKey === `remove-${selectedItem.id}`}>
            {selectedItem !== null && activeActionKey === `remove-${selectedItem.id}` ? "Retirando equipamento..." : "Retirar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} fullWidth maxWidth="xs">
        <DialogTitle>Excluir Equipamento</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mt: 1 }}>
            Esta ação remove o item do inventário permanentemente. Para movimentação de estoque, use "Retirar do Estoque".
          </Alert>
          <Typography sx={{ mt: 2 }}>
            Deseja excluir o equipamento <strong>{selectedItem?.nome_do_equipamento}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDeleteInventoryItem} disabled={selectedItem !== null && activeActionKey === `delete-${selectedItem.id}`}>
            {selectedItem !== null && activeActionKey === `delete-${selectedItem.id}` ? "Salvando..." : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
