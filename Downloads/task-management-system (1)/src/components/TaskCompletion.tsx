"use client"

import type React from "react"
import { useState } from "react"
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  TextField,
  Alert,
  CircularProgress,
} from "@mui/material"
import { ArrowBack, CheckCircle } from "@mui/icons-material"
import { useParams, useNavigate } from "react-router-dom"
import { useTask } from "../contexts/TaskContext"

export default function TaskCompletion() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getTaskById, completeTask, error, clearError } = useTask()

  const [formData, setFormData] = useState({
    descricao_realizada: "",
    data_inicio: "",
    data_finalizacao: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const task = getTaskById(Number(id))

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!id || !formData.descricao_realizada || !formData.data_inicio || !formData.data_finalizacao) {
      return
    }

    setSubmitting(true)
    try {
      await completeTask(Number(id), formData)
      setSuccess(true)

      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate("/")
      }, 2000)
    } catch (err) {
      console.error("Erro ao concluir tarefa:", err)
    } finally {
      setSubmitting(false)
    }
  }

  if (!task) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">Tarefa não encontrada</Alert>
      </Container>
    )
  }

  if (success) {
    return (
      <Container maxWidth="md">
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <CheckCircle sx={{ fontSize: 80, color: "success.main", mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Tarefa Concluída com Sucesso!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              A tarefa "{task.nome}" foi finalizada e o status foi atualizado.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Redirecionando para a lista de tarefas...
            </Typography>
          </CardContent>
        </Card>
      </Container>
    )
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/task/${id}/checklist`)} sx={{ mb: 2 }}>
          Voltar para checklist
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom>
            Conclusão da Tarefa
          </Typography>

          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            {task.nome} - {task.unidade.nome_da_unidade}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Descreva o que foi realizado"
              value={formData.descricao_realizada}
              onChange={(e) => handleInputChange("descricao_realizada", e.target.value)}
              required
              sx={{ mb: 3 }}
              placeholder="Descreva detalhadamente as atividades realizadas, problemas encontrados e soluções aplicadas..."
            />

            <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Data de Início"
                value={formData.data_inicio}
                onChange={(e) => handleInputChange("data_inicio", e.target.value)}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <TextField
                fullWidth
                type="datetime-local"
                label="Data de Finalização"
                value={formData.data_finalizacao}
                onChange={(e) => handleInputChange("data_finalizacao", e.target.value)}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={submitting ? <CircularProgress size={20} /> : <CheckCircle />}
              disabled={
                submitting || !formData.descricao_realizada || !formData.data_inicio || !formData.data_finalizacao
              }
              fullWidth
            >
              {submitting ? "Concluindo tarefa..." : "Concluir tarefa"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}
