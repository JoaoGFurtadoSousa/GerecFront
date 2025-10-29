"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  CircularProgress,
  Paper,
  Avatar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Modal,
  Chip,
} from "@mui/material"
import {
  Settings,
  Dashboard,
  Assignment,
  Engineering,
  Menu,
  Logout,
  Add,
  Business,
  Close,
} from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { authService } from "../services/authService"
import NewTaskModal from "./NewTaskModal"

const DRAWER_WIDTH = 240
const API_BASE_URL = "http://192.168.0.103:8000/api/v1"

export default function UnitsView() {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Estados específicos para unidades
  const [units, setUnits] = useState([])
  const [loadingUnits, setLoadingUnits] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [unitEquipments, setUnitEquipments] = useState([])
  const [loadingEquipments, setLoadingEquipments] = useState(false)
  const [showEquipmentsModal, setShowEquipmentsModal] = useState(false)

  // Estados para usuário
  const [userInfo, setUserInfo] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [showNewTaskModal, setShowNewTaskModal] = useState(false)

  // Função para buscar informações do usuário
  const fetchUserInfo = async () => {
    try {
      setLoadingUser(true)
      console.log("🔄 Buscando informações do usuário...")
      const response = await authService.authenticatedFetch(`${API_BASE_URL}/usuarios/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(10000),
      })
      if (!response.ok) {
        throw new Error(`Erro ao buscar usuário: ${response.status} ${response.statusText}`)
      }
      const userData = await response.json()
      console.log("✅ Dados do usuário recebidos:", userData)
      setUserInfo(userData)
    } catch (err) {
      console.error("❌ Erro ao buscar dados do usuário:", err)
      // Em caso de erro, usar dados do localStorage como fallback
      const fallbackUser = authService.getUserData()
      setUserInfo(fallbackUser)
    } finally {
      setLoadingUser(false)
    }
  }

  // Função para buscar unidades
  const fetchUnits = async () => {
    try {
      setLoadingUnits(true)
      console.log("🔄 Buscando unidades...")
      
      const response = await authService.authenticatedFetch(`${API_BASE_URL}/unidades/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) {
        throw new Error(`Erro ao buscar unidades: ${response.status} ${response.statusText}`)
      }

      const unitsData = await response.json()
      console.log("✅ Unidades recebidas:", unitsData)
      setUnits(Array.isArray(unitsData) ? unitsData : [])
    } catch (err) {
      console.error("❌ Erro ao buscar unidades:", err)
      // Não mostrar erro para o usuário, apenas logar
    } finally {
      setLoadingUnits(false)
    }
  }

  // Função para buscar equipamentos de uma unidade
  const fetchUnitEquipments = async (unitId) => {
    try {
      setLoadingEquipments(true)
      console.log("🔄 Buscando equipamentos da unidade:", unitId)
      
      const response = await authService.authenticatedFetch(
        `${API_BASE_URL}/equipamentosDaUnidade/por-unidade/${unitId}/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(10000),
        }
      )

      if (!response.ok) {
        throw new Error(`Erro ao buscar equipamentos: ${response.status} ${response.statusText}`)
      }

      const equipmentsData = await response.json()
      console.log("✅ Equipamentos recebidos:", equipmentsData)
      setUnitEquipments(Array.isArray(equipmentsData) ? equipmentsData : [])
    } catch (err) {
      console.error("❌ Erro ao buscar equipamentos:", err)
      // Não mostrar erro para o usuário, apenas logar
    } finally {
      setLoadingEquipments(false)
    }
  }

  // Função para lidar com clique em unidade
  const handleUnitClick = async (unit) => {
    setSelectedUnit(unit)
    setShowEquipmentsModal(true)
    await fetchUnitEquipments(unit.id)
  }

  // Carregar dados ao montar o componente
  useEffect(() => {
    fetchUserInfo()
    fetchUnits()
  }, [])

  // Obter dados do usuário
  const userData = authService.getUserData()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleLogout = () => {
    authService.logout()
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
          onClick={() => navigate("/")}
          sx={{
            borderRadius: 2,
            mb: 1,
            "&:hover": { bgcolor: "#333" },
            cursor: "pointer",
          }}
        >
          <ListItemIcon>
            <Dashboard sx={{ color: "#ccc" }} />
          </ListItemIcon>
          <ListItemText
            primary="Dashboard"
            primaryTypographyProps={{
              fontSize: "0.9rem",
              fontWeight: 500,
              color: "#ccc",
            }}
          />
        </ListItem>
        <ListItem
          onClick={() => navigate("/historico")}
          sx={{
            borderRadius: 2,
            mb: 1,
            "&:hover": { bgcolor: "#333" },
            cursor: "pointer",
          }}
        >
          <ListItemIcon>
            <Assignment sx={{ color: "#ccc" }} />
          </ListItemIcon>
          <ListItemText
            primary="Histórico"
            primaryTypographyProps={{
              fontSize: "0.9rem",
              color: "#ccc",
            }}
          />
        </ListItem>
        <ListItem
          onClick={() => setShowNewTaskModal(true)}
          sx={{
            borderRadius: 2,
            mb: 1,
            "&:hover": { bgcolor: "#333" },
            cursor: "pointer",
          }}
        >
          <ListItemIcon>
            <Add sx={{ color: "#ccc" }} />
          </ListItemIcon>
          <ListItemText
            primary="Nova Tarefa"
            primaryTypographyProps={{
              fontSize: "0.9rem",
              color: "#ccc",
            }}
          />
        </ListItem>
        <ListItem
          sx={{
            borderRadius: 2,
            mb: 1,
            bgcolor: "#2196f3",
            "&:hover": { bgcolor: "#1976d2" },
            cursor: "pointer",
          }}
        >
          <ListItemIcon>
            <Business sx={{ color: "white" }} />
          </ListItemIcon>
          <ListItemText
            primary="Unidades"
            primaryTypographyProps={{
              fontSize: "0.9rem",
              color: "white",
            }}
          />
        </ListItem>
        <Divider sx={{ my: 2, borderColor: "#333" }} />
        <ListItem
          sx={{
            borderRadius: 2,
            mb: 1,
            "&:hover": { bgcolor: "#333" },
            cursor: "pointer",
          }}
        >
          <ListItemIcon>
            <Settings sx={{ color: "#ccc" }} />
          </ListItemIcon>
          <ListItemText
            primary="Configurações"
            primaryTypographyProps={{
              fontSize: "0.9rem",
              color: "#ccc",
            }}
          />
        </ListItem>
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
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#333" }}>
              Gerenciamento de Unidades
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ bgcolor: "#2196f3", width: 32, height: 32 }}>
                {loadingUser ? "..." : userInfo?.nome?.charAt(0) || userData?.nome?.charAt(0) || "U"}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#333" }}>
                  {loadingUser ? "Carregando..." : userInfo?.nome || userData?.nome || "Usuário"}
                </Typography>
                <Typography variant="caption" sx={{ color: "#666" }}>
                  {userInfo?.email || userData?.email || ""}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        {/* Content */}
        <Box sx={{ p: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ mb: 3, color: "#333", fontWeight: 600 }}>
              Lista de Unidades ({units.length})
            </Typography>

            {loadingUnits ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <Box sx={{ textAlign: "center" }}>
                  <CircularProgress size={60} sx={{ mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Carregando unidades...
                  </Typography>
                </Box>
              </Box>
            ) : units.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: "center", bgcolor: "white" }}>
                <Business sx={{ fontSize: 64, color: "#e0e0e0", mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Nenhuma unidade encontrada
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  As unidades aparecerão aqui quando disponíveis
                </Typography>
                <Button variant="contained" onClick={fetchUnits}>
                  Recarregar
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {units.map((unit) => (
                  <Grid item xs={12} sm={6} lg={4} key={`unit-${unit.id}`}>
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        bgcolor: "white",
                        border: "1px solid #e0e0e0",
                        borderRadius: 2,
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                        "&:hover": {
                          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                          transform: "translateY(-2px)",
                          "& .unit-title": {
                            color: "#2196f3",
                          },
                        },
                      }}
                      onClick={() => handleUnitClick(unit)}
                    >
                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        {/* Header com status */}
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                          <Chip
                            label={unit.status ? "✅ Ativa" : "❌ Inativa"}
                            sx={{
                              bgcolor: unit.status ? "#e8f5e8" : "#ffebee",
                              color: unit.status ? "#2e7d32" : "#d32f2f",
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              height: 28,
                              borderRadius: 2,
                            }}
                          />
                          <Business sx={{ color: "#e0e0e0", fontSize: 24 }} />
                        </Box>

                        {/* Nome da Unidade */}
                        <Typography
                          className="unit-title"
                          variant="h6"
                          component="h3"
                          sx={{
                            fontWeight: 600,
                            color: "#333",
                            mb: 2,
                            lineHeight: 1.3,
                            fontSize: "1.1rem",
                            transition: "color 0.2s ease",
                          }}
                        >
                          {unit.nome_da_unidade || "Nome não disponível"}
                        </Typography>

                        {/* Cidade */}
                        {unit.cidade && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#666",
                              fontSize: "0.9rem",
                              lineHeight: 1.5,
                              mb: 2,
                            }}
                          >
                            📍 {unit.cidade}
                          </Typography>
                        )}

                        {/* Informações adicionais */}
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: "auto" }}>
                          <Typography variant="caption" sx={{ color: "#999" }}>
                            ID: {unit.id}
                          </Typography>
                          <Button
                            variant="text"
                            size="small"
                            sx={{
                              color: "#2196f3",
                              textTransform: "none",
                              fontSize: "0.8rem",
                              "&:hover": {
                                bgcolor: "transparent",
                                textDecoration: "underline",
                              },
                            }}
                          >
                            Ver equipamentos
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Box>

        {/* Modal de Equipamentos */}
        <Modal
          open={showEquipmentsModal}
          onClose={() => setShowEquipmentsModal(false)}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              bgcolor: "white",
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflow: "auto",
              minWidth: "600px",
            }}
          >
            {/* Header do Modal */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: "#333" }}>
                Equipamentos - {selectedUnit?.nome_da_unidade}
              </Typography>
              <IconButton onClick={() => setShowEquipmentsModal(false)}>
                <Close />
              </IconButton>
            </Box>

            {/* Conteúdo do Modal */}
            {loadingEquipments ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
                <Box sx={{ textAlign: "center" }}>
                  <CircularProgress size={60} sx={{ mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Carregando equipamentos...
                  </Typography>
                </Box>
              </Box>
            ) : unitEquipments.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <Engineering sx={{ fontSize: 64, color: "#e0e0e0", mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Nenhum equipamento encontrado
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Esta unidade não possui equipamentos cadastrados
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {unitEquipments.map((equipment) => (
                  <Grid item xs={12} md={6} key={`equipment-${equipment.id}`}>
                    <Card
                      sx={{
                        border: "1px solid #e0e0e0",
                        borderRadius: 2,
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        {/* Nome do Equipamento */}
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: "#333",
                            mb: 2,
                            fontSize: "1rem",
                          }}
                        >
                          {equipment.nome_do_equipamento}
                        </Typography>

                        {/* Status dos Equipamentos */}
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="body2" sx={{ color: "#666" }}>
                              Danificado na entrada:
                            </Typography>
                            <Chip
                              label={equipment.danificado_a_entrada ? "Sim" : "Não"}
                              size="small"
                              sx={{
                                bgcolor: equipment.danificado_a_entrada ? "#ffebee" : "#e8f5e8",
                                color: equipment.danificado_a_entrada ? "#d32f2f" : "#2e7d32",
                                fontWeight: 600,
                              }}
                            />
                          </Box>

                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="body2" sx={{ color: "#666" }}>
                              Danificado na saída:
                            </Typography>
                            <Chip
                              label={equipment.danificado_a_saida ? "Sim" : "Não"}
                              size="small"
                              sx={{
                                bgcolor: equipment.danificado_a_saida ? "#ffebee" : "#e8f5e8",
                                color: equipment.danificado_a_saida ? "#d32f2f" : "#2e7d32",
                                fontWeight: 600,
                              }}
                            />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Modal>
      </Box>
      {/* Modal Nova Tarefa */}
      <NewTaskModal
        open={showNewTaskModal}
        onClose={() => setShowNewTaskModal(false)}
        onSuccess={() => {
          setShowNewTaskModal(false)
          // Não precisa refresh aqui pois é página de unidades
        }}
      />
    </Box>
  )
}
