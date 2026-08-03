import { useEffect, useState } from "react"
import { Alert, Box, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import { apiService, type PasswordResetHistoryItem } from "../services/apiService"
import PaginatedNavigation from "./PaginatedNavigation"

const PAGE_SIZE = 10

export default function PasswordResetHistory() {
  const [page, setPage] = useState(1); const [items, setItems] = useState<PasswordResetHistoryItem[]>([]); const [count, setCount] = useState(0); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null)
  useEffect(() => { let active = true; const load = async () => { setLoading(true); setError(null); try { const response = await apiService.getPasswordResetHistoryPage(page); if (active) { setItems(response.results); setCount(response.count) } } catch (requestError) { if (active) setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar o histórico de resets.") } finally { if (active) setLoading(false) } }; load(); return () => { active = false } }, [page])
  const columns = Array.from(items.reduce((keys, item) => { Object.keys(item).forEach((key) => keys.add(key)); return keys }, new Set<string>()))
  return <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1200, mx: "auto", width: "100%" }}><Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>Histórico de Reset de Senhas</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Registros de reset processados no CloudAccess.</Typography>{error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}{loading ? <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}><CircularProgress /></Box> : <Paper variant="outlined"><TableContainer sx={{ overflowX: "auto" }}><Table size="small"><TableHead><TableRow>{columns.map((column) => <TableCell key={column} sx={{ fontWeight: 700 }}>{column}</TableCell>)}</TableRow></TableHead><TableBody>{items.map((item, index) => <TableRow key={String(item.id ?? index)} hover>{columns.map((column) => <TableCell key={column}>{formatValue(item[column])}</TableCell>)}</TableRow>)}{items.length === 0 && <TableRow><TableCell colSpan={Math.max(columns.length, 1)} align="center">Nenhum reset encontrado.</TableCell></TableRow>}</TableBody></Table></TableContainer><Box sx={{ px: 2 }}><PaginatedNavigation page={page} totalRecords={count} pageSize={PAGE_SIZE} onChange={setPage} /></Box></Paper>}</Box>
}

function formatValue(value: unknown): string { if (value === null || value === undefined) return "-"; if (typeof value === "object") return JSON.stringify(value); return String(value) }
