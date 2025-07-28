import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { TaskProvider } from "./contexts/TaskContext"
import TaskList from "./components/TaskList"
import TaskDetails from "./components/TaskDetails"
import EquipmentChecklist from "./components/EquipmentChecklist"
import TaskCompletion from "./components/TaskCompletion"

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
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
            <Route path="/" element={<TaskList />} />
            <Route path="/task/:id" element={<TaskDetails />} />
            <Route path="/task/:id/checklist" element={<EquipmentChecklist />} />
            <Route path="/task/:id/completion" element={<TaskCompletion />} />
          </Routes>
        </Router>
      </TaskProvider>
    </ThemeProvider>
  )
}
