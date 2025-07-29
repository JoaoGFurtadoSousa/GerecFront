"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import {
  apiService,
  type Task,
  type Equipment,
  type TaskCompletionData,
  type EquipmentChecklistItem,
} from "../services/apiService"

interface TaskContextType {
  tasks: Task[]
  loading: boolean
  error: string | null
  getTaskById: (id: number) => Task | undefined
  refreshTasks: () => Promise<void>
  updateTaskStatus: (id: number, status: "Para iniciar" | "Em andamento" | "Concluído") => Promise<void>
  submitEquipmentChecklist: (unitId: number, equipmentArray: EquipmentChecklistItem[]) => Promise<void>
  completeTask: (taskId: number, data: TaskCompletionData) => Promise<void>
  clearError: () => void
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const clearError = () => setError(null)

  const refreshTasks = async () => {
    console.log("🔄 refreshTasks chamado - loading atual:", loading)
    setLoading(true)
    setError(null)

    try {
      console.log("📡 Fazendo chamada para API...")
      const tasksData = await apiService.getTasks()

      console.log("✅ Dados recebidos da API:", tasksData)
      console.log("📊 Tipo dos dados:", typeof tasksData, "É array:", Array.isArray(tasksData))

      if (Array.isArray(tasksData)) {
        console.log("📋 Definindo tarefas no estado:", tasksData.length, "tarefas")
        setTasks(tasksData)
      } else {
        console.warn("⚠️ Dados não são array, definindo array vazio")
        setTasks([])
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar tarefas"
      console.error("❌ Erro capturado:", errorMessage)
      setError(errorMessage)
      setTasks([])
    } finally {
      console.log("🏁 Finalizando loading...")
      setLoading(false)
    }
  }

  // Carregar tarefas ao inicializar
  useEffect(() => {
    console.log("🚀 TaskProvider useEffect executado")
    refreshTasks()
  }, [])

  const getTaskById = (id: number) => {
    const task = tasks.find((task) => task.id === id)
    console.log("🔍 Buscando tarefa por ID:", id, "encontrada:", task)
    return task
  }

  const updateTaskStatus = async (id: number, status: "Para iniciar" | "Em andamento" | "Concluído") => {
    console.log("🔄 Atualizando status no contexto:", id, status)
    setError(null)
    try {
      const updatedTask = await apiService.updateTaskStatus(id, status)
      console.log("✅ Tarefa atualizada recebida:", updatedTask)

      setTasks((prevTasks) => {
        const newTasks = prevTasks.map((task) => (task.id === id ? updatedTask : task))
        console.log("📋 Estado das tarefas atualizado")
        return newTasks
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar status da tarefa"
      console.error("❌ Erro ao atualizar status:", errorMessage)
      setError(errorMessage)
      throw err
    }
  }

  const submitEquipmentChecklist = async (unitId: number, equipmentArray: EquipmentChecklistItem[]) => {
    setError(null)
    try {
      await apiService.submitEquipmentChecklist(unitId, equipmentArray)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao enviar checklist"
      setError(errorMessage)
      throw err
    }
  }

  const completeTask = async (taskId: number, data: TaskCompletionData) => {
    setError(null)
    try {
      await apiService.completeTask(taskId, data)
      await updateTaskStatus(taskId, "Concluído")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao concluir tarefa"
      setError(errorMessage)
      throw err
    }
  }

  console.log("🔍 TaskProvider render - loading:", loading, "tasks:", tasks.length, "error:", error)

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        getTaskById,
        refreshTasks,
        updateTaskStatus,
        submitEquipmentChecklist,
        completeTask,
        clearError,
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

export type { Task, Equipment, TaskCompletionData, EquipmentChecklistItem }
