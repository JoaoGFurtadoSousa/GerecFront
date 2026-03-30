"use client"

import { Container, Typography, Card, CardContent, Button, Box, Chip, Alert, CircularProgress } from "@mui/material"
import { ArrowBack, PlayArrow, LocationOn } from "@mui/icons-material"
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
  const { getTaskById, updateTaskStatus, loading, error, clearError } = useTask()

  const task = getTaskById(Number(id))

  if (!task) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">Tarefa não encontrada</Alert>
      </Container>
    )
  }

  const handleProceedWithTask = async () => {
    try {
      // ✅ CORREÇÃO: Aguardar atualização do status ANTES de navegar
      if (task.status === "Para iniciar") {
        console.log("🔄 Atualizando status para 'Em andamento'...")
        await updateTaskStatus(task.id, "Em andamento")
        console.log("✅ Status atualizado com sucesso")
      }

      // ✅ CORREÇÃO: Pequeno delay para garantir que o contexto seja atualizado
      setTimeout(() => {
        console.log("🚀 Navegando para checklist...")
        navigate(`/task/${task.id}/checklist`)
      }, 500) // 500ms de delay para garantir atualização
    } catch (error) {
      console.error("❌ Erro ao atualizar status:", error)
      // Em caso de erro, ainda permite navegar (fallback)
      navigate(`/task/${task.id}/checklist`)
    }
  }

  const canProceed = task.status !== "Concluído"

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/")} sx={{ mb: 2 }}>
          Voltar para lista
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Chip label={task.status} color={getStatusColor(task.status)} sx={{ mb: 2 }} />

            <Typography variant="h4" component="h1" gutterBottom>
              Chamado #{task.numChamado}
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Unidade
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {task.unidade?.nome_da_unidade || "Sem unidade"}
            </Typography>

            <Typography variant="h6" gutterBottom>
              Técnico Responsável
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {task.nomeDoTecnico?.username || "Não atribuído"}
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
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {task.descricao}
            </Typography>

            {(task.latitude !== 0 || task.longitude !== 0) && (
              <>
                <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LocationOn sx={{ fontSize: 20 }} />
                  Localização
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Lat: {task.latitude}, Long: {task.longitude}
                </Typography>
              </>
            )}

            <Typography variant="h6" gutterBottom>
              Data da Tarefa
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {new Date(task.dataTarefa).toLocaleString("pt-BR")}
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
