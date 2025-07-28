"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

export interface Task {
  id: number
  nome: string
  status: "Para iniciar" | "Em andamento" | "Concluído"
  unidade: string
  descricao: string
}

export interface Equipment {
  id: number
  nome_do_equipamento: string
  danificado_a_entrada: boolean
  danificado_a_saida: boolean
}

interface TaskContextType {
  tasks: Task[]
  loading: boolean
  error: string | null
  getTaskById: (id: number) => Task | undefined
  updateTaskStatus: (id: number, status: Task["status"]) => Promise<void>
  getEquipmentByTaskId: (taskId: number) => Promise<Equipment[]>
  submitEquipmentChecklist: (taskId: number, equipment: Equipment[]) => Promise<void>
  completeTask: (taskId: number, data: any) => Promise<void>
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

// Mock data - em produção, isso viria da API
const mockTasks: Task[] = [
  {
    id: 1,
    nome: "Manutenção Preventiva - Setor A",
    status: "Para iniciar",
    unidade: "Unidade Industrial Norte",
    descricao:
      "Realizar manutenção preventiva completa nos equipamentos do setor A, incluindo verificação de cabos, conexões e funcionamento geral.",
  },
  {
    id: 2,
    nome: "Inspeção de Segurança",
    status: "Em andamento",
    unidade: "Unidade Industrial Sul",
    descricao: "Inspeção completa dos sistemas de segurança, incluindo alarmes, sensores e equipamentos de proteção.",
  },
  {
    id: 3,
    nome: "Calibração de Instrumentos",
    status: "Concluído",
    unidade: "Laboratório Central",
    descricao: "Calibração de todos os instrumentos de medição e controle de qualidade do laboratório.",
  },
  {
    id: 4,
    nome: "Troca de Filtros",
    status: "Para iniciar",
    unidade: "Unidade de Tratamento",
    descricao: "Substituição dos filtros do sistema de tratamento de ar e água.",
  },
]

const mockEquipment: Equipment[] = [
  {
    id: 1,
    nome_do_equipamento: "KIT Chicote de Cabos",
    danificado_a_entrada: false,
    danificado_a_saida: true,
  },
  {
    id: 2,
    nome_do_equipamento: "Sensor de Temperatura",
    danificado_a_entrada: true,
    danificado_a_saida: false,
  },
  {
    id: 3,
    nome_do_equipamento: "Válvula de Controle",
    danificado_a_entrada: false,
    danificado_a_saida: false,
  },
  {
    id: 4,
    nome_do_equipamento: "Motor Principal",
    danificado_a_entrada: false,
    danificado_a_saida: true,
  },
]

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getTaskById = (id: number) => {
    return tasks.find((task) => task.id === id)
  }

  const updateTaskStatus = async (id: number, status: Task["status"]) => {
    setLoading(true)
    try {
      // Simular chamada da API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setTasks((prevTasks) => prevTasks.map((task) => (task.id === id ? { ...task, status } : task)))
    } catch (err) {
      setError("Erro ao atualizar status da tarefa")
    } finally {
      setLoading(false)
    }
  }

  const getEquipmentByTaskId = async (taskId: number): Promise<Equipment[]> => {
    setLoading(true)
    try {
      // Simular chamada da API
      await new Promise((resolve) => setTimeout(resolve, 800))
      return mockEquipment
    } catch (err) {
      setError("Erro ao carregar equipamentos")
      return []
    } finally {
      setLoading(false)
    }
  }

  const submitEquipmentChecklist = async (taskId: number, equipment: Equipment[]) => {
    setLoading(true)
    try {
      // Simular envio para API
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("Checklist enviado:", { taskId, equipment })
    } catch (err) {
      setError("Erro ao enviar checklist")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const completeTask = async (taskId: number, data: any) => {
    setLoading(true)
    try {
      // Simular envio para API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Atualizar status para concluído
      await updateTaskStatus(taskId, "Concluído")

      console.log("Tarefa concluída:", { taskId, data })
    } catch (err) {
      setError("Erro ao concluir tarefa")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        getTaskById,
        updateTaskStatus,
        getEquipmentByTaskId,
        submitEquipmentChecklist,
        completeTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTask() {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error("useTask must be used within a TaskProvider")
  }
  return context
}
