import { Box } from "@mui/material"
import type { ReactNode } from "react"
import AppSidebar from "./AppSidebar"

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8f9fa" }}><AppSidebar /><Box className="protected-page-content" sx={{ flexGrow: 1, minWidth: 0 }}>{children}</Box></Box>
}
