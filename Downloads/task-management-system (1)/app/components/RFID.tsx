"use client"

import { useState } from "react"
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
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
  Construction,
} from "@mui/icons-material"
import { useNavigate, useLocation } from "react-router-dom"
import { authService } from "../services/authService"

const DRAWER_WIDTH = 240

export default function RFIDPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const userData = authService.getUserData() || {
    nome: "Usuario",
    email: "usuario@sistema.com",
  }

  const featuresEnabled = authService.shouldEnableFeatures()

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
            "&:hover": { bgcolor: featuresEnabled ? "#333" : "transparent" },
            cursor: featuresEnabled ? "pointer" : "not-allowed",
            opacity: featuresEnabled ? 1 : 0.5,
          }}
        >
          <ListItemIcon>
            <QrCode2 sx={{ color: featuresEnabled ? "#9c27b0" : "#666" }} />
          </ListItemIcon>
          <ListItemText primary="QRCode" primaryTypographyProps={{ fontSize: "0.9rem", color: featuresEnabled ? "#ccc" : "#666" }} />
        </ListItem>

        <ListItem
          onClick={() => featuresEnabled && navigate("/rfid")}
          sx={{
            borderRadius: 2,
            mb: 1,
            bgcolor: isActiveRoute("/rfid") ? "#ff5722" : "transparent",
            "&:hover": { bgcolor: featuresEnabled ? (isActiveRoute("/rfid") ? "#e64a19" : "#333") : "transparent" },
            cursor: featuresEnabled ? "pointer" : "not-allowed",
            opacity: featuresEnabled ? 1 : 0.5,
          }}
        >
          <ListItemIcon>
            <Nfc sx={{ color: isActiveRoute("/rfid") ? "white" : featuresEnabled ? "#ff5722" : "#666" }} />
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

        <Box sx={{ p: 3, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 100px)" }}>
          <Card sx={{ bgcolor: "white", border: "1px solid #e0e0e0", maxWidth: 500, width: "100%" }}>
            <CardContent sx={{ p: 6, textAlign: "center" }}>
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  bgcolor: "#fff3e0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 4,
                }}
              >
                <Construction sx={{ fontSize: 64, color: "#ff5722" }} />
              </Box>

              <Typography variant="h4" sx={{ fontWeight: 700, color: "#333", mb: 2 }}>
                RFID
              </Typography>

              <Typography variant="body1" sx={{ color: "#666", mb: 4 }}>
                Funcionalidade em desenvolvimento
              </Typography>

              <Paper
                sx={{
                  p: 3,
                  bgcolor: "#fff3e0",
                  border: "1px dashed #ff9800",
                  borderRadius: 2,
                }}
              >
                <Nfc sx={{ fontSize: 32, color: "#ff5722", mb: 1 }} />
                <Typography variant="body2" sx={{ color: "#e65100" }}>
                  Em breve voce podera gerenciar tags RFID diretamente por aqui.
                </Typography>
              </Paper>

              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate("/")}
                sx={{ mt: 4, borderColor: "#ff5722", color: "#ff5722", "&:hover": { borderColor: "#e64a19", bgcolor: "#fff3e0" } }}
              >
                Voltar ao Dashboard
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  )
}
