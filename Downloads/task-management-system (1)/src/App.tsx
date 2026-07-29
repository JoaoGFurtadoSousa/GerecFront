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
import Inventario from "./components/Inventario"
import QRCodePage from "./components/Qrcode"
import RFIDPage from "./components/RFID"
import ResetPassword from "./components/ResetPassword"
import CreateCloudAccessUser from "./components/CreateCloudAccessUser"
import ProtectedLayout from "./components/ProtectedLayout"

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
                  <ProtectedLayout><TaskList /></ProtectedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/task/:id"
              element={
                <ProtectedRoute>
                  <ProtectedLayout><TaskDetails /></ProtectedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/task/:id/checklist"
              element={
                <ProtectedRoute>
                  <ProtectedLayout><EquipmentChecklist /></ProtectedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/task/:id/completion"
              element={
                <ProtectedRoute>
                  <ProtectedLayout><TaskCompletion /></ProtectedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/task/:id/additional-data"
              element={
                <ProtectedRoute>
                  <ProtectedLayout><TaskAdditionalData /></ProtectedLayout>
                </ProtectedRoute>
              }
            />
            {/* ✅ NOVAS ROTAS FUNCIONAIS */}
            <Route
              path="/nova-tarefa"
              element={
                <ProtectedRoute>
                  <ProtectedLayout><NovaTask /></ProtectedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/historico"
              element={
                <ProtectedRoute>
                  <ProtectedLayout><Historico /></ProtectedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/unidades"
              element={
                <ProtectedRoute>
                  <ProtectedLayout><Unidades /></ProtectedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventario"
              element={
                <ProtectedRoute>
                  <ProtectedLayout><Inventario /></ProtectedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/qrcode"
              element={
                <ProtectedRoute>
                  <ProtectedLayout><QRCodePage /></ProtectedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/rfid"
              element={
                <ProtectedRoute>
                  <ProtectedLayout><RFIDPage /></ProtectedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reset-senha-cloudaccess"
              element={
                <ProtectedRoute>
                  <ProtectedLayout><ResetPassword /></ProtectedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/criar-usuario-cloudaccess"
              element={
                <ProtectedRoute>
                  <ProtectedLayout><CreateCloudAccessUser /></ProtectedLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </TaskProvider>
    </ThemeProvider>
  )
}
