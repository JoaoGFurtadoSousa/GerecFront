"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import {
  apiService,
  type Task,
  type Equipment,
  type TaskCompletionData,
  type EquipmentChecklistItem,
  type AdditionalDataForm,
} from "../services/apiService"

interface TaskContextType {
  tasks: Task[]
  loading: boolean
  error: string | null
  getTaskById: (id: number) => Task | undefined
  refreshTasks: () => Promise<void>
  updateTaskStatus: (id: number, status: "Para iniciar" | "Em andamento" | "Concluído") => Promise<void>
  // ✅ NOVO: Método para buscar equipamentos da unidade
  getEquipmentByUnitId: (unitId: number) => Promise<Equipment[]>
  submitEquipmentChecklist: (unitId: number, equipmentArray: EquipmentChecklistItem[]) => Promise<void>
  updateTaskWithAdditionalData: (taskId: number, data: AdditionalDataForm) => Promise<void>
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
    console.log("🔄 TaskContext: Atualizando status:", id, "para:", status)
    setError(null)

    try {
      // ✅ CORREÇÃO: Atualizar estado local IMEDIATAMENTE (otimistic update)
      setTasks((prevTasks) => {
        const optimisticTasks = prevTasks.map((task) => (task.id === id ? { ...task, status } : task))
        console.log("⚡ Estado local atualizado otimisticamente")
        return optimisticTasks
      })

      // Fazer a requisição para o backend
      const updatedTask = await apiService.updateTaskStatus(id, status)
      console.log("✅ Resposta do backend recebida:", updatedTask)

      // ✅ CORREÇÃO: Atualizar com dados reais do backend
      setTasks((prevTasks) => {
        const finalTasks = prevTasks.map((task) => (task.id === id ? updatedTask : task))
        console.log("📋 Estado final atualizado com dados do backend")
        return finalTasks
      })
    } catch (err) {
      console.error("❌ Erro ao atualizar status, revertendo estado:", err)

      // ✅ CORREÇÃO: Reverter estado em caso de erro
      setTasks((prevTasks) => {
        const revertedTasks = prevTasks.map((task) => (task.id === id ? { ...task, status: task.status } : task))
        console.log("🔄 Estado revertido devido ao erro")
        return revertedTasks
      })

      const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar status da tarefa"
      setError(errorMessage)
      throw err
    }
  }

  // ✅ NOVO: Método para buscar equipamentos da unidade
  const getEquipmentByUnitId = async (unitId: number): Promise<Equipment[]> => {
    console.log("🔄 TaskContext: Buscando equipamentos da unidade", unitId)
    setError(null)
    try {
      const equipment = await apiService.getEquipmentByUnitId(unitId)
      console.log("✅ TaskContext: Equipamentos da unidade carregados:", equipment.length)
      return equipment
    } catch (err) {
      console.error("❌ TaskContext: Erro ao buscar equipamentos:", err)
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar equipamentos"
      setError(errorMessage)
      throw err
    }
  }

  const submitEquipmentChecklist = async (unitId: number, equipmentArray: EquipmentChecklistItem[]) => {
    setError(null)
    try {
      console.log("🔄 TaskContext: Enviando checklist para unidade", unitId)
      await apiService.submitEquipmentChecklist(unitId, equipmentArray)
      console.log("✅ TaskContext: Checklist enviado com sucesso")
    } catch (err) {
      console.error("❌ TaskContext: Erro ao enviar checklist:", err)

      let errorMessage = "Erro ao enviar checklist"

      if (err instanceof Error) {
        errorMessage = err.message
      }

      setError(errorMessage)
      throw err
    }
  }

  const updateTaskWithAdditionalData = async (taskId: number, data: AdditionalDataForm) => {
    setError(null)
    try {
      console.log("🔄 TaskContext: Atualizando tarefa com dados adicionais:", taskId)

      const updatedTask = await apiService.updateTaskWithAdditionalData(taskId, data)

      setTasks((prevTasks) => {
        const newTasks = prevTasks.map((task) => (task.id === taskId ? updatedTask : task))
        console.log("📋 Estado das tarefas atualizado com dados adicionais")
        return newTasks
      })

      console.log("✅ TaskContext: Tarefa atualizada com dados adicionais")
    } catch (err) {
      console.error("❌ TaskContext: Erro ao atualizar tarefa:", err)

      let errorMessage = "Erro ao salvar dados da tarefa"
      if (err instanceof Error) {
        errorMessage = err.message
      }

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
      console.error("❌ Erro ao concluir tarefa:", errorMessage)
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
        getEquipmentByUnitId, // ✅ NOVO
        submitEquipmentChecklist,
        updateTaskWithAdditionalData,
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

export type { Task, Equipment, TaskCompletionData, EquipmentChecklistItem, AdditionalDataForm }
