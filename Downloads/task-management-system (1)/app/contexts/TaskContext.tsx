"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

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
  fetchTasks: () => Promise<void>
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

const API_URL = "https://sua-api.com" // 🔥 troca pela sua API

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 🔹 Buscar tarefas da API
  const fetchTasks = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/tasks`)
      if (!response.ok) throw new Error()

      const data = await response.json()
      setTasks(data)
    } catch (err) {
      setError("Erro ao carregar tarefas")
    } finally {
      setLoading(false)
    }
  }

  // 🔹 Buscar automaticamente ao carregar
  useEffect(() => {
    fetchTasks()
  }, [])

  const getTaskById = (id: number) => {
    return tasks.find((task) => task.id === id)
  }

  const updateTaskStatus = async (id: number, status: Task["status"]) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/tasks/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) throw new Error()

      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, status } : task
        )
      )
    } catch (err) {
      setError("Erro ao atualizar status da tarefa")
    } finally {
      setLoading(false)
    }
  }

  const getEquipmentByTaskId = async (taskId: number): Promise<Equipment[]> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}/equipment`)
      if (!response.ok) throw new Error()

      return await response.json()
    } catch (err) {
      setError("Erro ao carregar equipamentos")
      return []
    } finally {
      setLoading(false)
    }
  }

  const submitEquipmentChecklist = async (
    taskId: number,
    equipment: Equipment[]
  ) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}/equipment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ equipment }),
      })

      if (!response.ok) throw new Error()
    } catch (err) {
      setError("Erro ao enviar checklist")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const completeTask = async (taskId: number, data: any) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error()

      await updateTaskStatus(taskId, "Concluído")
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
        fetchTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTask() {
  const context = useContext(TaskContext)

  if (!context) {
    throw new Error("useTask must be used within a TaskProvider")
  }

  return context
}