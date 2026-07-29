import { ListItem, ListItemIcon, ListItemText } from "@mui/material"
import { PersonAdd } from "@mui/icons-material"
import { useLocation, useNavigate } from "react-router-dom"
import { authService } from "../services/authService"

export default function CreateCloudAccessUserNavigationItem() {
  const navigate = useNavigate()
  const location = useLocation()
  const enabled = authService.shouldEnableFeatures()
  const active = location.pathname === "/criar-usuario-cloudaccess"
  return <ListItem onClick={() => enabled && navigate("/criar-usuario-cloudaccess")} sx={{ borderRadius: 2, mb: 1, bgcolor: active ? "#2196f3" : "transparent", "&:hover": { bgcolor: enabled ? (active ? "#1976d2" : "#333") : "transparent" }, cursor: enabled ? "pointer" : "not-allowed", opacity: enabled ? 1 : 0.5 }}><ListItemIcon><PersonAdd sx={{ color: active ? "white" : enabled ? "#ccc" : "#666" }} /></ListItemIcon><ListItemText primary="Criar Usuário CloudAccess" primaryTypographyProps={{ fontSize: "0.9rem", fontWeight: active ? 600 : 400, color: active ? "white" : enabled ? "#ccc" : "#666" }} /></ListItem>
}
