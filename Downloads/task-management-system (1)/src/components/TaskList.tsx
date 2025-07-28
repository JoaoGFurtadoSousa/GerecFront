"use client"

import { useState } from "react"
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Box,
  CircularProgress,
  Alert,
  InputAdornment,
} from "@mui/material"
import { Visibility, Search, Refresh, Build } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { useTask, type Task } from "../contexts/TaskContext"

const getStatusColor = (status: Task["status"]) => {
  switch (status) {
    case "Para iniciar":
      return "#1976d2" // Azul
    case "Em andamento":
      return "#ff9800" // Laranja/Amarelo
    case "Concluído":
      return "#4caf50" // Verde
    default:
      return "#9e9e9e" // Cinza
  }
}

const getStatusBgColor = (status: Task["status"]) => {
  switch (status) {
    case "Para iniciar":
      return "#e3f2fd" // Azul claro
    case "Em andamento":
      return "#fff3e0" // Laranja claro
    case "Concluído":
      return "#e8f5e8" // Verde claro
    default:
      return "#f5f5f5" // Cinza claro
  }
}

export default function TaskList() {
  const { tasks, loading, error, refreshTasks, clearError } = useTask()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  console.log("🎯 TaskList render:", { loading, tasksLength: tasks.length, error })

  const filteredTasks = tasks.filter((task) => {
    if (!task) return false

    const taskName = String(task.nome || "").toLowerCase()
    const taskUnit = String(task.unidade || "").toLowerCase()
    const searchLower = searchTerm.toLowerCase()

    const matchesSearch = taskName.includes(searchLower) || taskUnit.includes(searchLower)
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Loading State
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#f8f9fa",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2, color: "text.secondary" }}>
          Carregando tarefas...
        </Typography>
      </Box>
    )
  }

  // Error State
  if (error) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa", p: 3 }}>
        <Container maxWidth="md">
          <Alert severity="error" action={<Button onClick={refreshTasks}>Tentar Novamente</Button>}>
            <Typography variant="h6">Erro ao carregar tarefas</Typography>
            <Typography variant="body2">{error}</Typography>
          </Alert>
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 1 }}>
            <Build sx={{ fontSize: 32, color: "#1976d2", mr: 1 }} />
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 600,
                color: "#1976d2",
              }}
            >
              Sistema de Tarefas Técnicas
            </Typography>
          </Box>
          <Typography variant="subtitle1" color="text.secondary">
            Gerencie e acompanhe suas tarefas técnicas
          </Typography>
        </Box>

        {/* Filtros */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Buscar por nome da tarefa ou unidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  bgcolor: "white",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  displayEmpty
                  sx={{
                    bgcolor: "white",
                    borderRadius: 2,
                  }}
                >
                  <MenuItem value="all">Todos os status</MenuItem>
                  <MenuItem value="Para iniciar">Para iniciar</MenuItem>
                  <MenuItem value="Em andamento">Em andamento</MenuItem>
                  <MenuItem value="Concluído">Concluído</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* Lista de Tarefas */}
        {tasks.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhuma tarefa encontrada
            </Typography>
            <Button variant="contained" onClick={refreshTasks} startIcon={<Refresh />}>
              Recarregar
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredTasks.map((task) => (
              <Grid item xs={12} sm={6} md={6} key={`task-${task.id}`}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    {/* Header com título e status */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                      <Typography
                        variant="h6"
                        component="h3"
                        sx={{
                          fontWeight: 600,
                          color: "#333",
                          flex: 1,
                          mr: 2,
                          lineHeight: 1.3,
                        }}
                      >
                        {String(task.nome)}
                      </Typography>
                      <Chip
                        label={task.status}
                        sx={{
                          bgcolor: getStatusBgColor(task.status),
                          color: getStatusColor(task.status),
                          fontWeight: 500,
                          fontSize: "0.75rem",
                          height: 24,
                          borderRadius: 1,
                        }}
                      />
                    </Box>

                    {/* Unidade */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#666", mb: 0.5 }}>
                        Unidade
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {String(task.unidade)}
                      </Typography>
                    </Box>

                    {/* Descrição */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#666", mb: 0.5 }}>
                        Descrição
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          lineHeight: 1.4,
                        }}
                      >
                        {String(task.descricao)}
                      </Typography>
                    </Box>

                    {/* Botão Ver detalhes */}
                    <Button
                      variant="text"
                      startIcon={<Visibility />}
                      onClick={() => navigate(`/task/${task.id}`)}
                      sx={{
                        color: "#666",
                        textTransform: "none",
                        fontWeight: 500,
                        "&:hover": {
                          bgcolor: "rgba(0,0,0,0.04)",
                        },
                      }}
                    >
                      Ver detalhes
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {filteredTasks.length === 0 && tasks.length > 0 && (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhuma tarefa encontrada com os filtros aplicados
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
              }}
            >
              Limpar Filtros
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  )
}
