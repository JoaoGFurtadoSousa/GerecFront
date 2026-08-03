import { useState } from "react"
import type { ReactNode } from "react"
import { Add, Business, Dashboard, Engineering, History, Inventory2, LockReset, Logout, Menu, Nfc, PersonAdd, QrCode2, Restore } from "@mui/icons-material"
import { Box, Divider, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText } from "@mui/material"
import { useLocation, useNavigate } from "react-router-dom"
import { authService } from "../services/authService"

export const APP_SIDEBAR_WIDTH = 240

const operations = [
  ["Dashboard", "/", <Dashboard />], ["Nova Tarefa", "/nova-tarefa", <Add />], ["Histórico", "/historico", <History />], ["Unidades", "/unidades", <Business />], ["Inventário", "/inventario", <Inventory2 />],
] as const
const cloudAccess = [["QRCode", "/qrcode", <QrCode2 />], ["RFID", "/rfid", <Nfc />], ["Reset de Senha", "/reset-senha-cloudaccess", <LockReset />], ["Histórico de Reset de Senhas", "/historico-reset-senhas", <Restore />], ["Criar Usuário CloudAccess", "/criar-usuario-cloudaccess", <PersonAdd />]] as const

function MenuContent({ close }: { close?: () => void }) {
  const navigate = useNavigate(); const location = useLocation(); const enabled = authService.shouldEnableFeatures()
  const item = ([label, path, icon]: readonly [string, string, ReactNode]) => { const active = location.pathname === path; const allowed = path === "/" || enabled; return <ListItem key={path} onClick={() => { if (allowed) { navigate(path); close?.() } }} sx={{ borderRadius: 2, mb: 1, bgcolor: active ? "#2196f3" : "transparent", cursor: allowed ? "pointer" : "not-allowed", opacity: allowed ? 1 : .5, "&:hover": { bgcolor: allowed ? (active ? "#1976d2" : "#333") : "transparent" } }}><ListItemIcon sx={{ color: active ? "white" : allowed ? "#ccc" : "#666" }}>{icon}</ListItemIcon><ListItemText primary={label} primaryTypographyProps={{ fontSize: ".9rem", color: active ? "white" : allowed ? "#ccc" : "#666", fontWeight: active ? 600 : 400 }} /></ListItem> }
  return <Box sx={{ height: "100%", bgcolor: "#1a1a1a", color: "white" }}><Box sx={{ p: 3, borderBottom: "1px solid #333", display: "flex", gap: 2, alignItems: "center" }}><Engineering sx={{ color: "#2196f3", fontSize: 32 }} />GerecTech</Box><List sx={{ px: 2, py: 1 }}>{operations.map(item)}<Divider sx={{ my: 2, borderColor: "#333" }} />{cloudAccess.map(item)}<Divider sx={{ my: 2, borderColor: "#333" }} /><ListItem onClick={() => authService.logout()} sx={{ borderRadius: 2, cursor: "pointer", "&:hover": { bgcolor: "#d32f2f" } }}><ListItemIcon><Logout sx={{ color: "#ccc" }} /></ListItemIcon><ListItemText primary="Sair" primaryTypographyProps={{ color: "#ccc", fontSize: ".9rem" }} /></ListItem></List></Box>
}

export default function AppSidebar() { const [open, setOpen] = useState(false); return <><Box sx={{ width: APP_SIDEBAR_WIDTH, flexShrink: 0, display: { xs: "none", md: "block" } }}><MenuContent /></Box><IconButton aria-label="Abrir menu" onClick={() => setOpen(true)} sx={{ position: "fixed", top: 12, left: 12, zIndex: 1301, display: { md: "none" }, bgcolor: "white" }}><Menu /></IconButton><Drawer open={open} onClose={() => setOpen(false)} sx={{ display: { md: "none" }, "& .MuiDrawer-paper": { width: APP_SIDEBAR_WIDTH } }}><MenuContent close={() => setOpen(false)} /></Drawer></> }
