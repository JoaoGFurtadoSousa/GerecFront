import { AppBar, Toolbar, Typography } from "@mui/material"
import { Engineering } from "@mui/icons-material"

export default function Header() {
  return (
    <AppBar position="static" elevation={0} sx={{ mb: 3 }}>
      <Toolbar>
        <Engineering sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Sistema de Gerenciamento de Tarefas Técnicas
        </Typography>
      </Toolbar>
    </AppBar>
  )
}
