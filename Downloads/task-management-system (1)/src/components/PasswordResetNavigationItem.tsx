import { ListItem, ListItemIcon, ListItemText } from "@mui/material"
import { LockReset } from "@mui/icons-material"
import { useLocation, useNavigate } from "react-router-dom"
import { authService } from "../services/authService"

export default function PasswordResetNavigationItem() {
  const navigate = useNavigate()
  const location = useLocation()
  const enabled = authService.shouldEnableFeatures()
  const active = location.pathname === "/reset-senha-cloudaccess"

  return (
    <ListItem
      onClick={() => enabled && navigate("/reset-senha-cloudaccess")}
      sx={{
        borderRadius: 2,
        mb: 1,
        bgcolor: active ? "#2196f3" : "transparent",
        "&:hover": { bgcolor: enabled ? (active ? "#1976d2" : "#333") : "transparent" },
        cursor: enabled ? "pointer" : "not-allowed",
        opacity: enabled ? 1 : 0.5,
      }}
    >
      <ListItemIcon><LockReset sx={{ color: active ? "white" : enabled ? "#ccc" : "#666" }} /></ListItemIcon>
      <ListItemText primary="Reset de Senha" primaryTypographyProps={{ fontSize: "0.9rem", fontWeight: active ? 600 : 400, color: active ? "white" : enabled ? "#ccc" : "#666" }} />
    </ListItem>
  )
}
