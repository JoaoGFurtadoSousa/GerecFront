"use client"

import { useState, useEffect } from "react"
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material"
import { ArrowBack, NavigateNext } from "@mui/icons-material"
import { useParams, useNavigate } from "react-router-dom"
import { useTask, type Equipment } from "../contexts/TaskContext"

export default function EquipmentChecklist() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getTaskById, getEquipmentByTaskId, submitEquipmentChecklist, loading, error, clearError } = useTask()

  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [submitting, setSubmitting] = useState(false)

  const task = getTaskById(Number(id))

  useEffect(() => {
    const loadEquipment = async () => {
      if (id) {
        try {
          const equipmentData = await getEquipmentByTaskId(Number(id))
          // Inicializar com danificado_a_saida como true por padrão
          const initializedEquipment = equipmentData.map((item) => ({
            ...item,
            danificado_a_saida: true,
          }))
          setEquipment(initializedEquipment)
        } catch (err) {
          console.error("Erro ao carregar equipamentos:", err)
        }
      }
    }

    loadEquipment()
  }, [id, getEquipmentByTaskId])

  const handleCheckboxChange = (equipmentId: number, checked: boolean) => {
    setEquipment((prevEquipment) =>
      prevEquipment.map((item) => (item.id === equipmentId ? { ...item, danificado_a_saida: checked } : item)),
    )
  }

  const handleSubmit = async () => {
    if (!id) return

    setSubmitting(true)
    try {
      await submitEquipmentChecklist(Number(id), equipment)
      navigate(`/task/${id}/completion`)
    } catch (err) {
      console.error("Erro ao enviar checklist:", err)
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

  if (loading && equipment.length === 0) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/task/${id}`)} sx={{ mb: 2 }}>
          Voltar para detalhes
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom>
            Checklist de Equipamentos
          </Typography>

          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            {task.nome} - {task.unidade}
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            Marque os equipamentos que estão <strong>danificados</strong> após a verificação. Por padrão, todos estão
            marcados como danificados - desmarque os que estão OK.
          </Alert>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 4 }}>
            {equipment.map((item, index) => (
              <Box key={item.id}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={item.danificado_a_saida}
                      onChange={(e) => handleCheckboxChange(item.id, e.target.checked)}
                      color="error"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">{item.nome_do_equipamento}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Estado na entrada: {item.danificado_a_entrada ? "Danificado" : "OK"}
                      </Typography>
                    </Box>
                  }
                  sx={{
                    width: "100%",
                    alignItems: "flex-start",
                    py: 1,
                  }}
                />
                {index < equipment.length - 1 && <Divider />}
              </Box>
            ))}
          </Box>

          <Button
            variant="contained"
            size="large"
            endIcon={submitting ? <CircularProgress size={20} /> : <NavigateNext />}
            onClick={handleSubmit}
            disabled={submitting}
            fullWidth
          >
            {submitting ? "Enviando..." : "Prosseguir para conclusão"}
          </Button>
        </CardContent>
      </Card>
    </Container>
  )
}
