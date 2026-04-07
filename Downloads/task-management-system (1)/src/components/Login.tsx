"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Link,
} from "@mui/material"
import { Email, Lock, Visibility, VisibilityOff, Engineering } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { authService } from "../services/authService"

interface LoginFormData {
  username: string
  password: string
}

interface LoginResponse {
  access: string
  refresh: string
  user?: {
    id: number
    nome: string
    email: string
  }
}

export default function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("🔍 Login: Verificando se já está autenticado...")

    // Registrar callback de navegação
    authService.setNavigationCallback((path: string) => {
      console.log("🔄 Login: Navegando para:", path)
      navigate(path, { replace: true })
    })

    // Verificar se já está autenticado
    const accessToken = localStorage.getItem("access_token")
    const refreshToken = localStorage.getItem("refresh_token")
    const userData = localStorage.getItem("user_data")

    if (accessToken && refreshToken && userData) {
      console.log("✅ Já autenticado, redirecionando para home...")
      navigate("/", { replace: true })
    }
  }, [navigate])

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    if (error) setError(null)
  }

  const validateForm = (): boolean => {
    if (!formData.username.trim()) {
      setError("Username é obrigatório")
      return false
    }

    if (!formData.password.trim()) {
      setError("Senha é obrigatória")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setError(null)

    try {
      console.log("🔐 Fazendo login com:", formData.username)

      const response = await fetch("http://192.168.0.101:8000/api/v1/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      })

      console.log("📡 Status da resposta:", response.status)

      if (!response.ok) {
        let errorMessage = "Erro ao fazer login"
        try {
          const errorData = await response.json()
          console.log("❌ Erro do servidor:", errorData)
          errorMessage = errorData.message || errorData.detail || "Email ou senha incorretos"
        } catch (e) {
          console.log("⚠️ Não foi possível parsear erro")
        }
        throw new Error(errorMessage)
      }

      const data: LoginResponse = await response.json()
      console.log("✅ Login bem-sucedido:", data)

      if (!data.access || !data.refresh) {
        throw new Error("Tokens não recebidos do servidor")
      }

      localStorage.setItem("access_token", data.access)
      localStorage.setItem("refresh_token", data.refresh)
      if (data.user) {
        localStorage.setItem("user_data", JSON.stringify(data.user))
      }

      console.log("💾 Tokens salvos no localStorage")

      // Configurar tokens no authService
      authService.setTokens(data.access, data.refresh, data.user)

      console.log("✅ Redirecionando para Dashboard (rota raiz /)...")

      setTimeout(() => {
        navigate("/", { replace: true })
        console.log("🚀 Usuário redirecionado para Dashboard")
      }, 100)
    } catch (err) {
      console.error("❌ Erro no login:", err)
      const errorMessage = err instanceof Error ? err.message : "Erro inesperado ao fazer login"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "white",
        p: 2,
      }}
    >
      {/* Logo/Brand */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 6 }}>
        <Engineering sx={{ fontSize: 40, color: "#4285f4", mr: 2 }} />
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: "#333",
            fontSize: "2.5rem",
          }}
        >
          TaskPulse
        </Typography>
      </Box>

      <Card
        sx={{
          maxWidth: 400,
          width: "100%",
          bgcolor: "#1a1a2e",
          border: "1px solid #333",
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: "white",
              textAlign: "center",
              mb: 1,
              fontSize: "1.75rem",
            }}
          >
            Login
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255,255,255,0.7)",
              textAlign: "center",
              mb: 4,
              fontSize: "0.9rem",
            }}
          >
            Entre com suas credenciais para acessar o sistema
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                bgcolor: "rgba(244,67,54,0.1)",
                border: "1px solid rgba(244,67,54,0.3)",
                color: "#ff6b6b",
                "& .MuiAlert-icon": {
                  color: "#ff6b6b",
                },
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255,255,255,0.9)",
                mb: 1,
                fontWeight: 500,
                fontSize: "0.9rem",
              }}
            >
              Username
            </Typography>
            <TextField
              fullWidth
              type="text"
              placeholder="seu_username"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: "rgba(255,255,255,0.5)", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#2a2a3e",
                  border: "1px solid #444",
                  borderRadius: 2,
                  color: "white",
                  height: "48px",
                  "& fieldset": {
                    border: "none",
                  },
                  "&:hover": {
                    bgcolor: "#2a2a3e",
                    border: "1px solid #555",
                  },
                  "&.Mui-focused": {
                    bgcolor: "#2a2a3e",
                    border: "1px solid #4285f4",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "white",
                  fontSize: "0.9rem",
                  "&::placeholder": {
                    color: "rgba(255,255,255,0.5)",
                    opacity: 1,
                  },
                },
              }}
            />

            <Typography
              variant="body2"
              sx={{
                color: "rgba(255,255,255,0.9)",
                mb: 1,
                fontWeight: 500,
                fontSize: "0.9rem",
              }}
            >
              Senha
            </Typography>
            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              placeholder="Digite sua senha"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: "rgba(255,255,255,0.5)", fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      edge="end"
                      sx={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 4,
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#2a2a3e",
                  border: "1px solid #444",
                  color: "white",
                  height: "48px",
                  "& fieldset": {
                    border: "none",
                  },
                  "&:hover": {
                    bgcolor: "#2a2a3e",
                    border: "1px solid #555",
                  },
                  "&.Mui-focused": {
                    bgcolor: "#2a2a3e",
                    border: "1px solid #4285f4",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "white",
                  fontSize: "0.9rem",
                  "&::placeholder": {
                    color: "rgba(255,255,255,0.5)",
                    opacity: 1,
                  },
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: 2,
                bgcolor: "#4285f4",
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "none",
                height: "48px",
                boxShadow: "none",
                "&:hover": {
                  bgcolor: "#3367d6",
                  boxShadow: "none",
                },
                "&:disabled": {
                  bgcolor: "rgba(66, 133, 244, 0.5)",
                  color: "white",
                },
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Entrar"}
            </Button>
          </Box>

          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
              Não tem uma conta?{" "}
              <Link
                component="button"
                type="button"
                onClick={() => navigate("/cadastro")}
                sx={{
                  color: "#4285f4",
                  textDecoration: "none",
                  fontWeight: 600,
                  cursor: "pointer",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Cadastre-se
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
