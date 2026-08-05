"use client"

import type React from "react"
import { useState } from "react"
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
import { Person, Email, Lock, Visibility, VisibilityOff, Engineering, CheckCircle } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"

interface CadastroFormData {
  username: string
  email: string
  password: string
}

interface CadastroResponse {
  message?: string
  user?: {
    id: number
    username: string
    email: string
  }
}

export default function Cadastro() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<CadastroFormData>({
    username: "",
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Partial<CadastroFormData>>({})

  const handleInputChange = (field: keyof CadastroFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    if (error) setError(null)
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }

    validateField(field, value)
  }

  const validateField = (field: keyof CadastroFormData, value: string) => {
    let fieldError = ""

    switch (field) {
      case "username":
        if (!value.trim()) {
          fieldError = "username é obrigatório"
        } else if (value.trim().length < 2) {
          fieldError = "username deve ter pelo menos 2 caracteres"
        }
        break

      case "email":
        if (!value.trim()) {
          fieldError = "Email é obrigatório"
        } else if (!value.includes("@") || !value.includes(".")) {
          fieldError = "Email deve ter um formato válido"
        }
        break

      case "password":
        if (!value.trim()) {
          fieldError = "Senha é obrigatória"
        } else if (value.length < 6) {
          fieldError = "Senha deve ter pelo menos 6 caracteres"
        }
        break
    }

    setFieldErrors((prev) => ({
      ...prev,
      [field]: fieldError,
    }))

    return fieldError === ""
  }

  const validateForm = (): boolean => {
    const nomeValid = validateField("username", formData.username)
    const emailValid = validateField("email", formData.email)
    const passwordValid = validateField("password", formData.password)

    return nomeValid && emailValid && passwordValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      setError("Por favor, corrija os erros nos campos")
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("👤 Fazendo cadastro com:", formData.username, formData.email)

      const response = await fetch("http://192.168.15.29:8000/api/v1/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      })

      console.log("📡 Status da resposta:", response.status)

      if (!response.ok) {
        let errorMessage = "Erro ao fazer cadastro"

        try {
          const errorData = await response.json()
          console.log("❌ Erro do servidor:", errorData)

          if (response.status === 400 && errorData.message?.includes("email")) {
            errorMessage = "Este email já está cadastrado"
          } else {
            errorMessage = errorData.message || errorData.detail || "Erro ao criar conta"
          }
        } catch (e) {
          console.log("⚠️ Não foi possível parsear erro")
        }

        throw new Error(errorMessage)
      }

      const data: CadastroResponse = await response.json()
      console.log("✅ Cadastro realizado com sucesso:", data)

      setSuccess(true)

      setFormData({
        username: "",
        email: "",
        password: "",
      })

      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (err) {
      console.error("❌ Erro no cadastro:", err)
      const errorMessage = err instanceof Error ? err.message : "Erro inesperado ao criar conta"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
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
        <Card
          sx={{
            maxWidth: 400,
            width: "100%",
            bgcolor: "#1a1a2e",
            border: "1px solid #333",
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <CardContent sx={{ p: 6 }}>
            <CheckCircle sx={{ fontSize: 80, color: "#4caf50", mb: 3 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: "white" }}>
              Cadastro realizado!
            </Typography>
            <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)", mb: 3 }}>
              Sua conta foi criada com sucesso. Você será redirecionado para a tela de login.
            </Typography>
            <CircularProgress sx={{ color: "#4caf50" }} />
          </CardContent>
        </Card>
      </Box>
    )
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
          GerecTech
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
            Cadastro
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
            Crie sua conta para acessar o sistema
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
              placeholder="Seu username"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              disabled={loading}
              error={!!fieldErrors.username}
              helperText={fieldErrors.username}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: "rgba(255,255,255,0.5)", fontSize: 20 }} />
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
                  "&.Mui-error": {
                    border: "1px solid #ff6b6b",
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
                "& .MuiFormHelperText-root": {
                  color: "#ff6b6b",
                  fontSize: "0.75rem",
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
              Email
            </Typography>
            <TextField
              fullWidth
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              disabled={loading}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
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
                  "&.Mui-error": {
                    border: "1px solid #ff6b6b",
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
                "& .MuiFormHelperText-root": {
                  color: "#ff6b6b",
                  fontSize: "0.75rem",
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
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              disabled={loading}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
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
                  "&.Mui-error": {
                    border: "1px solid #ff6b6b",
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
                "& .MuiFormHelperText-root": {
                  color: "#ff6b6b",
                  fontSize: "0.75rem",
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
              {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Cadastrar"}
            </Button>
          </Box>

          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
              Já tem uma conta?{" "}
              <Link
                component="button"
                type="button"
                onClick={() => navigate("/login")}
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
                Faça login
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
