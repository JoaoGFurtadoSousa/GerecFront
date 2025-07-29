"use client"

import { useState } from "react"
import {
  Container,
  Typography,
  Button,
  Box,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Grid,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from "@mui/material"
import { ArrowBack, Send, CheckCircle, Home, ExpandMore, Info } from "@mui/icons-material"
import { useParams, useNavigate } from "react-router-dom"
import { useTask, type Equipment } from "../contexts/TaskContext"

// Lista fixa dos 45 equipamentos (iguais para todas as unidades)
const FIXED_EQUIPMENT_LIST: Equipment[] = [
  {
    id: 1,
    nome_do_equipamento: "KIT Chicote de Cabos",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  { id: 2, nome_do_equipamento: "ALTO-FALANTE", unidade: 0, danificado_a_entrada: false, danificado_a_saida: false },
  {
    id: 3,
    nome_do_equipamento: "PLACA AMPLIFICADOR",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  { id: 4, nome_do_equipamento: "MICRO SD", unidade: 0, danificado_a_entrada: false, danificado_a_saida: false },
  {
    id: 5,
    nome_do_equipamento: "PLACA CPU TOTEM M-2",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 6,
    nome_do_equipamento: "TELA 7 POLEGADAS HDM",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 7,
    nome_do_equipamento: "INTERRUPTOR DE ENERGIA",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  { id: 8, nome_do_equipamento: "COOLER", unidade: 0, danificado_a_entrada: false, danificado_a_saida: false },
  {
    id: 9,
    nome_do_equipamento: "GABINETE COMPLETO INFERIOR",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 10,
    nome_do_equipamento: "GABINETE COMPLETO SUPERIOR",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 11,
    nome_do_equipamento: "PAINEL FRONTAL AÇO C/ ABERTURA",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 12,
    nome_do_equipamento: "BASE FIXAÇÃO NO PISO",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 13,
    nome_do_equipamento: "CABO USB V8 - LEITOR QRCODE",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 14,
    nome_do_equipamento: "CABO USB V3 - LEITOR RFID",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 15,
    nome_do_equipamento: "CABO HDMI-MICRO HDMI",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 16,
    nome_do_equipamento: "CABO P2 - ÁUDIO",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 17,
    nome_do_equipamento: "LEITOR RFID / QRCODE 2D",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  { id: 18, nome_do_equipamento: "LEITOR RFID", unidade: 0, danificado_a_entrada: false, danificado_a_saida: false },
  {
    id: 19,
    nome_do_equipamento: "MÓDULO / FONTE ALIMENTAÇÃO ISO",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 20,
    nome_do_equipamento: "MÓDULO / FONTE ALIMENTAÇÃO ÁUD",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 21,
    nome_do_equipamento: "RÉGUA ALIMENTAÇÃO 5 TOMADAS",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 22,
    nome_do_equipamento: "BOTÃO AJUDA AÇO INOX ANTI-VAND",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 23,
    nome_do_equipamento: "MÓDULO CAIXA CONTROLADORA I2C",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 24,
    nome_do_equipamento: "EXPEDIDOR CARTÃO",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 25,
    nome_do_equipamento: "BOTÃO EMISSOR AÇO INOX ANTI-VA",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 26,
    nome_do_equipamento: "MÓDULO / FONTE ALIMENTAÇÃO ISO",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 27,
    nome_do_equipamento: "PAINEL DE ACRÍLICO CRISTAL",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 28,
    nome_do_equipamento: "SOLENOIDE - COLETOR DE CARTÃO",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 29,
    nome_do_equipamento: "KIT BOCAL COLETOR / CAIXA COLE",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 30,
    nome_do_equipamento: "KIT - SENSOR ÓPTICO COLETOR CA",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 31,
    nome_do_equipamento: "HASTE DA CANCELA CM/GR",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 32,
    nome_do_equipamento: "MOTOR REDUTOR CANCELA CM/GR",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 33,
    nome_do_equipamento: "PLACA CPU CENTRAL CONTROLE CAN",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 34,
    nome_do_equipamento: "GABINETE DA CANCELA CM/GR",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 35,
    nome_do_equipamento: "FONTE CORDÃO DE LED DA HASTE C",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 36,
    nome_do_equipamento: "CANALETA PARA FITA DE LED CM",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 37,
    nome_do_equipamento: "DETECTOR VEÍCULO POR LAÇO INDU",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 38,
    nome_do_equipamento: "LAÇO INDUTIVO 2,5X2,5M COM RAB",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 39,
    nome_do_equipamento: "DETECTOR VEÍCULO POR ULTRASSOM",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 40,
    nome_do_equipamento: "CARTÃO PROXIMIDADE RFID",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  { id: 41, nome_do_equipamento: "CÂMERA", unidade: 0, danificado_a_entrada: false, danificado_a_saida: false },
  {
    id: 42,
    nome_do_equipamento: "SUPORTE PARA CÂMERA",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 43,
    nome_do_equipamento: "TOTEM - INTEGRAÇÃO SOFTWARE",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 44,
    nome_do_equipamento: "CABEAMENTO DE REDE TOTEM",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 45,
    nome_do_equipamento: "CABEAMENTO DE REDE CÂMERA",
    unidade: 0,
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
]

export default function EquipmentChecklist() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getTaskById, submitEquipmentChecklist, error, clearError } = useTask()

  // Inicializar com a lista fixa de equipamentos (todos desmarcados)
  const [equipment, setEquipment] = useState<Equipment[]>(FIXED_EQUIPMENT_LIST)
  const [submitting, setSubmitting] = useState(false)

  const task = getTaskById(Number(id))

  const handleCheckboxChange = (
    equipmentId: number,
    field: "danificado_a_entrada" | "danificado_a_saida",
    checked: boolean,
  ) => {
    console.log("🔄 Alterando checkbox:", equipmentId, field, "para:", checked)
    setEquipment((prevEquipment) =>
      prevEquipment.map((item) => (item.id === equipmentId ? { ...item, [field]: checked } : item)),
    )
  }

  const handleSubmit = async () => {
    if (!task?.unidade?.id) {
      console.error("❌ ID da unidade não encontrado")
      return
    }

    setSubmitting(true)
    try {
      // Criar array de equipamentos no formato correto para o backend
      const equipmentArray = equipment.map((item) => ({
        id: item.id,
        nome_do_equipamento: item.nome_do_equipamento,
        unidade: task.unidade.id, // ID da unidade da tarefa
        danificado_a_entrada: item.danificado_a_entrada,
        danificado_a_saida: item.danificado_a_saida,
      }))

      console.log("📤 Enviando checklist para unidade:", task.unidade.id)
      console.log("📤 Array de equipamentos completo:", JSON.stringify(equipmentArray, null, 2))

      await submitEquipmentChecklist(task.unidade.id, equipmentArray)

      // Sucesso - navegar para próxima página
      navigate(`/task/${id}/completion`)
    } catch (err) {
      console.error("❌ Erro ao enviar checklist:", err)
    } finally {
      setSubmitting(false)
    }
  }

  // Estatísticas dos equipamentos
  const totalEquipment = equipment.length
  const verifiedEntryCount = equipment.filter((item) => !item.danificado_a_entrada).length
  const damagedEntryCount = equipment.filter((item) => item.danificado_a_entrada).length
  const damagedExitCount = equipment.filter((item) => item.danificado_a_saida).length

  if (!task) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">Tarefa não encontrada</Alert>
      </Container>
    )
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa" }}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate(`/task/${id}`)} sx={{ mb: 2, color: "#666" }}>
            Voltar
          </Button>

          <Typography variant="h5" sx={{ fontWeight: 600, color: "#333", mb: 1 }}>
            Checklist de Equipamentos
          </Typography>
          <Typography variant="body1" sx={{ color: "#666" }}>
            Chamado #{task.numChamado} - {task.unidade?.nome_da_unidade}
          </Typography>
        </Box>

        {/* Instruções */}
        <Alert
          severity="info"
          icon={<Info />}
          sx={{
            mb: 3,
            bgcolor: "#e3f2fd",
            border: "1px solid #bbdefb",
            "& .MuiAlert-message": {
              color: "#1565c0",
            },
          }}
        >
          <Typography variant="body2">
            <strong>Instrução:</strong> Marque os equipamentos que estão com defeito na entrada ou na saída. Por padrão,
            todos os equipamentos estão desmarcados (considerados em bom estado).
          </Typography>
        </Alert>

        {/* Estatísticas */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: "center", bgcolor: "#f5f5f5", border: "1px solid #e0e0e0" }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#333", mb: 1 }}>
                {totalEquipment}
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                Total de Equipamentos
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: "center", bgcolor: "#e8f5e8", border: "1px solid #c8e6c9" }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#2e7d32", mb: 1 }}>
                {verifiedEntryCount}
              </Typography>
              <Typography variant="body2" sx={{ color: "#2e7d32" }}>
                Verificados na Entrada
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: "center", bgcolor: "#ffebee", border: "1px solid #ffcdd2" }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#d32f2f", mb: 1 }}>
                {damagedEntryCount}
              </Typography>
              <Typography variant="body2" sx={{ color: "#d32f2f" }}>
                Danificados na Entrada
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        {/* Seção ENTRADA */}
        <Accordion defaultExpanded sx={{ mb: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              bgcolor: "#e3f2fd",
              borderBottom: "1px solid #bbdefb",
              "& .MuiAccordionSummary-content": {
                alignItems: "center",
              },
            }}
          >
            <Home sx={{ color: "#1976d2", mr: 2 }} />
            <Box>
              <Typography variant="h6" sx={{ color: "#1976d2", fontWeight: 600 }}>
                ENTRADA
              </Typography>
              <Typography variant="body2" sx={{ color: "#1565c0" }}>
                {equipment.length} equipamentos • {damagedEntryCount} danificados
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            {/* Lista de Equipamentos */}
            <Box sx={{ maxHeight: "60vh", overflowY: "auto" }}>
              {equipment.map((item, index) => (
                <Paper
                  key={item.id}
                  sx={{
                    p: 3,
                    m: 2,
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    bgcolor: "#fafafa",
                    "&:hover": {
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  {/* Header do equipamento */}
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <CheckCircle sx={{ color: "#4caf50", mr: 2, fontSize: 24 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: "#333",
                          fontSize: "1.1rem",
                          mb: 0.5,
                        }}
                      >
                        {item.nome_do_equipamento}
                      </Typography>
                      <Chip
                        label="Entrada"
                        size="small"
                        sx={{
                          bgcolor: "#e8f5e8",
                          color: "#2e7d32",
                          fontSize: "0.75rem",
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Descrição */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#666",
                      mb: 3,
                      fontStyle: "italic",
                    }}
                  >
                    Verificar funcionamento e integridade
                  </Typography>

                  {/* Checkboxes */}
                  <Box sx={{ display: "flex", gap: 4 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={item.danificado_a_entrada}
                          onChange={(e) => handleCheckboxChange(item.id, "danificado_a_entrada", e.target.checked)}
                          sx={{
                            color: "#1976d2",
                            "&.Mui-checked": {
                              color: "#1976d2",
                            },
                          }}
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ fontSize: "0.9rem", color: "#333" }}>
                          Danificado na Entrada
                        </Typography>
                      }
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={item.danificado_a_saida}
                          onChange={(e) => handleCheckboxChange(item.id, "danificado_a_saida", e.target.checked)}
                          sx={{
                            color: "#1976d2",
                            "&.Mui-checked": {
                              color: "#1976d2",
                            },
                          }}
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ fontSize: "0.9rem", color: "#333" }}>
                          Danificado na Saída
                        </Typography>
                      }
                    />
                  </Box>
                </Paper>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Botão de envio */}
        <Box sx={{ position: "fixed", bottom: 20, right: 20 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
            onClick={handleSubmit}
            disabled={submitting}
            sx={{
              px: 4,
              py: 1.5,
              bgcolor: "#4caf50",
              "&:hover": { bgcolor: "#388e3c" },
              fontSize: "1rem",
              fontWeight: 600,
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
            }}
          >
            {submitting ? "Enviando..." : "Enviar"}
          </Button>
        </Box>
      </Container>
    </Box>
  )
}
