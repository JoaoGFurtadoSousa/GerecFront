"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Box, CircularProgress, Typography } from "@mui/material"
import { authService } from "../services/authService"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!authService.isAuthenticated()) {
          console.log("❌ Usuário não autenticado, redirecionando para login")
          navigate("/login")
          return
        }

        // Verificar se o token ainda é válido fazendo uma requisição de teste
        try {
          await authService.authenticatedFetch("http://192.168.15.17:8000/api/v1/tarefas/", {
            method: "GET",
          })
          console.log("✅ Token válido, permitindo acesso")
        } catch (error) {
          console.log("❌ Token inválido, redirecionando para login")
          navigate("/login")
          return
        }

        setIsChecking(false)
      } catch (error) {
        console.error("❌ Erro na verificação de autenticação:", error)
        navigate("/login")
      }
    }

    checkAuth()
  }, [navigate])

  if (isChecking) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          bgcolor: "#f8f9fa",
        }}
      >
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Verificando autenticação...
        </Typography>
      </Box>
    )
  }

  return <>{children}</>
}
