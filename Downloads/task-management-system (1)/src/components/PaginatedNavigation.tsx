import { Box, Pagination, Typography } from "@mui/material"

interface PaginatedNavigationProps {
  page: number
  totalRecords: number
  pageSize: number
  onChange: (page: number) => void
}

export default function PaginatedNavigation({ page, totalRecords, pageSize, onChange }: PaginatedNavigationProps) {
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize))
  return <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 2, mt: 3 }}><Typography variant="body2" color="text.secondary">{totalRecords} registro(s) · Página {page} de {totalPages}</Typography><Pagination count={totalPages} page={page} onChange={(_, nextPage) => onChange(nextPage)} color="primary" /></Box>
}
