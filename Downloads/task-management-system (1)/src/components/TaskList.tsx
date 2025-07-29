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
import { Visibility, Search, Settings } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { useTask, type Task } from "../contexts/TaskContext"

const getStatusColor = (status: Task["status"]) => {
  switch (status) {
    case "Para iniciar":
      return "#2196f3" // Azul
    case "Em andamento":
      return "#ff9800" // Laranja
    case "Concluído":
      return "#4caf50" // Verde
    default:
      return "#9e9e9e"
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
      return "#f5f5f5"
  }
}

export default function TaskList() {
  const { tasks, loading, error, refreshTasks } = useTask()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredTasks = tasks.filter((task) => {
    if (!task) return false

    const taskDesc = String(task.descricao || "").toLowerCase()
    const unitName = String(task.unidade?.nome_da_unidade || "").toLowerCase()
    const numChamado = String(task.numChamado || "").toLowerCase()
    const searchLower = searchTerm.toLowerCase()

    const matchesSearch =
      taskDesc.includes(searchLower) || unitName.includes(searchLower) || numChamado.includes(searchLower)
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Loading State
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#fafafa",
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
      <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa", p: 3 }}>
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
    <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 1 }}>
            <Settings sx={{ fontSize: 36, color: "#2196f3", mr: 1.5 }} />
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 500,
                color: "#2196f3",
                fontSize: "2rem",
              }}
            >
              Sistema de Tarefas Técnicas
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: "#666", fontSize: "1rem" }}>
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
                placeholder="Buscar por descrição, unidade ou número do chamado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: "#999", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  bgcolor: "white",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    border: "1px solid #e0e0e0",
                    fontSize: "0.95rem",
                    "&:hover": {
                      borderColor: "#ccc",
                    },
                    "&.Mui-focused": {
                      borderColor: "#2196f3",
                    },
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
                    fontSize: "0.95rem",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#e0e0e0",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#ccc",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#2196f3",
                    },
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
            <Button variant="contained" onClick={refreshTasks}>
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
                    borderRadius: 2,
                    border: "1px solid #e8e8e8",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    bgcolor: "white",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      transform: "translateY(-1px)",
                      "& .task-title": {
                        color: "#2196f3",
                      },
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    {/* Header com título e status */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
                      <Typography
                        className="task-title"
                        variant="h6"
                        component="h3"
                        sx={{
                          fontWeight: 500,
                          color: "#333",
                          flex: 1,
                          mr: 2,
                          lineHeight: 1.3,
                          fontSize: "1.25rem",
                          transition: "color 0.2s ease",
                        }}
                      >
                        {task.unidade?.nome_da_unidade || "Sem unidade"}
                      </Typography>
                      <Chip
                        label={task.status}
                        sx={{
                          bgcolor: getStatusBgColor(task.status),
                          color: getStatusColor(task.status),
                          fontWeight: 500,
                          fontSize: "0.75rem",
                          height: 28,
                          borderRadius: 2,
                          border: "none",
                        }}
                      />
                    </Box>

                    {/* Número do Chamado */}
                    <Box sx={{ mb: 2.5 }}>
                      <Typography
                        variant="overline"
                        sx={{
                          fontWeight: 600,
                          color: "#999",
                          fontSize: "0.75rem",
                          letterSpacing: "0.5px",
                          mb: 0.5,
                          display: "block",
                        }}
                      >
                        CHAMADO
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#666", fontSize: "0.95rem", fontWeight: 600 }}>
                        #{task.numChamado}
                      </Typography>
                    </Box>

                    {/* Descrição */}
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="overline"
                        sx={{
                          fontWeight: 600,
                          color: "#999",
                          fontSize: "0.75rem",
                          letterSpacing: "0.5px",
                          mb: 0.5,
                          display: "block",
                        }}
                      >
                        DESCRIÇÃO
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#666",
                          fontSize: "0.95rem",
                          lineHeight: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {String(task.descricao)}
                      </Typography>
                    </Box>

                    {/* Botão Ver detalhes */}
                    <Button
                      variant="text"
                      startIcon={<Visibility sx={{ fontSize: 18 }} />}
                      onClick={() => navigate(`/task/${task.id}`)}
                      sx={{
                        color: "#666",
                        textTransform: "none",
                        fontWeight: 500,
                        fontSize: "0.9rem",
                        p: 0,
                        minHeight: "auto",
                        "&:hover": {
                          bgcolor: "transparent",
                          color: "#2196f3",
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
