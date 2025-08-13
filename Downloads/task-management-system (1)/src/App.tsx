import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { TaskProvider } from "./contexts/TaskContext"
import TaskList from "./components/TaskList"
import TaskDetails from "./components/TaskDetails"
import EquipmentChecklist from "./components/EquipmentChecklist"
import TaskCompletion from "./components/TaskCompletion"
import Login from "./components/Login"
import Cadastro from "./components/Cadastro"
import ProtectedRoute from "./components/ProtectedRoute"
import TaskAdditionalData from "./components/TaskAdditionalData"
import NovaTask from "./components/NovaTask"
import Historico from "./components/Historico"
import Unidades from "./components/Unidades"

const theme = createTheme({
  palette: {
    primary: {
      main: "#2196f3",
    },
    secondary: {
      main: "#4caf50",
    },
    background: {
      default: "#f8f9fa",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
  },
})

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TaskProvider>
        <Router>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />

            {/* Rotas protegidas */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <TaskList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/task/:id"
              element={
                <ProtectedRoute>
                  <TaskDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/task/:id/checklist"
              element={
                <ProtectedRoute>
                  <EquipmentChecklist />
                </ProtectedRoute>
              }
            />
            <Route
              path="/task/:id/completion"
              element={
                <ProtectedRoute>
                  <TaskCompletion />
                </ProtectedRoute>
              }
            />
            <Route
              path="/task/:id/additional-data"
              element={
                <ProtectedRoute>
                  <TaskAdditionalData />
                </ProtectedRoute>
              }
            />
            {/* ✅ NOVAS ROTAS FUNCIONAIS */}
            <Route
              path="/nova-tarefa"
              element={
                <ProtectedRoute>
                  <NovaTask />
                </ProtectedRoute>
              }
            />
            <Route
              path="/historico"
              element={
                <ProtectedRoute>
                  <Historico />
                </ProtectedRoute>
              }
            />
            <Route
              path="/unidades"
              element={
                <ProtectedRoute>
                  <Unidades />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </TaskProvider>
    </ThemeProvider>
  )
}
