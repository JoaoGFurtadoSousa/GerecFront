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
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  CircularProgress,
} from "@mui/material"
import { Visibility, Search } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { useTask, type Task } from "../contexts/TaskContext"

const getStatusColor = (status: Task["status"]) => {
  switch (status) {
    case "Para iniciar":
      return "default"
    case "Em andamento":
      return "warning"
    case "Concluído":
      return "success"
    default:
      return "default"
  }
}

export default function TaskList() {
  const { tasks, loading } = useTask()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.unidade.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Lista de Tarefas
      </Typography>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Buscar por nome da tarefa ou unidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Filtrar por Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Filtrar por Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="Para iniciar">Para iniciar</MenuItem>
                  <MenuItem value="Em andamento">Em andamento</MenuItem>
                  <MenuItem value="Concluído">Concluído</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Lista de Tarefas */}
      <Grid container spacing={3}>
        {filteredTasks.map((task) => (
          <Grid item xs={12} md={6} lg={4} key={task.id}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ mb: 2 }}>
                  <Chip label={task.status} color={getStatusColor(task.status)} size="small" sx={{ mb: 1 }} />
                </Box>

                <Typography variant="h6" component="h2" gutterBottom>
                  {task.nome}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  <strong>Unidade:</strong> {task.unidade}
                </Typography>

                <Button
                  variant="contained"
                  startIcon={<Visibility />}
                  onClick={() => navigate(`/task/${task.id}`)}
                  fullWidth
                >
                  Ver detalhes
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredTasks.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            Nenhuma tarefa encontrada
          </Typography>
        </Box>
      )}
    </Container>
  )
}
