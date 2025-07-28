"use client"
import { Container, Typography, Card, CardContent, Button, Box, Chip, Alert, CircularProgress } from "@mui/material"
import { ArrowBack, PlayArrow } from "@mui/icons-material"
import { useParams, useNavigate } from "react-router-dom"
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

export default function TaskDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getTaskById, updateTaskStatus, loading } = useTask()

  const task = getTaskById(Number(id))

  if (!task) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">Tarefa não encontrada</Alert>
      </Container>
    )
  }

  const handleProceedWithTask = async () => {
    if (task.status === "Para iniciar") {
      await updateTaskStatus(task.id, "Em andamento")
    }
    navigate(`/task/${task.id}/checklist`)
  }

  const canProceed = task.status !== "Concluído"

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/")} sx={{ mb: 2 }}>
          Voltar para lista
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Chip label={task.status} color={getStatusColor(task.status)} sx={{ mb: 2 }} />

            <Typography variant="h4" component="h1" gutterBottom>
              {task.nome}
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Unidade
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {task.unidade}
            </Typography>

            <Typography variant="h6" gutterBottom>
              Status Atual
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {task.status}
            </Typography>

            <Typography variant="h6" gutterBottom>
              Descrição
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {task.descricao}
            </Typography>
          </Box>

          {canProceed && (
            <Button
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={20} /> : <PlayArrow />}
              onClick={handleProceedWithTask}
              disabled={loading}
              fullWidth
            >
              {loading ? "Processando..." : "Prosseguir com a tarefa"}
            </Button>
          )}

          {task.status === "Concluído" && <Alert severity="success">Esta tarefa já foi concluída.</Alert>}
        </CardContent>
      </Card>
    </Container>
  )
}
