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
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    console.log("🔍 ProtectedRoute: Iniciando verificação de autenticação...")

    // Registrar callback de navegação no authService
    authService.setNavigationCallback((path: string) => {
      console.log("🔄 Navegando para:", path)
      navigate(path, { replace: true })
    })

    const checkAuth = async () => {
      try {
        // ✅ CORREÇÃO: Verificar apenas tokens obrigatórios
        const accessToken = localStorage.getItem("access_token")
        const refreshToken = localStorage.getItem("refresh_token")
        // ✅ Removido verificação de userData

        console.log("🔍 Verificando tokens (apenas obrigatórios):", {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          note: "userData não é obrigatório",
        })

        if (!accessToken || !refreshToken) {
          console.log("❌ Tokens obrigatórios ausentes, redirecionando para login")
          setIsAuthenticated(false)
          setIsChecking(false)
          navigate("/login", { replace: true })
          return
        }

        // Inicializar authService apenas se tiver tokens
        authService.initialize()
        await authService.loadCurrentUser()

        console.log("✅ Usuário autenticado (baseado em tokens), permitindo acesso")
        setIsAuthenticated(true)
        setIsChecking(false)
      } catch (error) {
        console.error("❌ Erro na verificação de autenticação:", error)
        setIsAuthenticated(false)
        setIsChecking(false)
        navigate("/login", { replace: true })
      }
    }

    // Executar verificação imediatamente
    checkAuth()
  }, [navigate])

  // Mostrar loading enquanto verifica
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
        <CircularProgress size={60} sx={{ mb: 2, color: "#2196f3" }} />
        <Typography variant="h6" color="text.secondary">
          Verificando autenticação...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Validando tokens de acesso...
        </Typography>
      </Box>
    )
  }

  // Se não está autenticado, não renderizar nada (já redirecionou)
  if (!isAuthenticated) {
    return null
  }

  // Se está autenticado, renderizar o conteúdo
  return <>{children}</>
}
