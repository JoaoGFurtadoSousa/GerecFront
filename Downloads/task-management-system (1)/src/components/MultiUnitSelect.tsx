import { Checkbox, FormControl, InputLabel, ListItemText, MenuItem, Select, Typography } from "@mui/material"
import type { Unit } from "../services/apiService"

interface MultiUnitSelectProps {
  units: Unit[]
  value: number[]
  onChange: (unitIds: number[]) => void
  disabled?: boolean
  error?: string
}

export default function MultiUnitSelect({ units, value, onChange, disabled, error }: MultiUnitSelectProps) {
  const allUnitIds = units.map((unit) => unit.id)
  const allSelected = allUnitIds.length > 0 && allUnitIds.every((id) => value.includes(id))

  const handleChange = (selected: number[]) => {
    const selectedAll = selected.includes(-1)
    if (selectedAll) {
      onChange(allSelected ? [] : allUnitIds)
      return
    }
    onChange(selected.filter((id) => allUnitIds.includes(id)))
  }

  return (
    <FormControl fullWidth error={Boolean(error)} disabled={disabled}>
      <InputLabel id="unidades-label">Unidades</InputLabel>
      <Select
        multiple
        labelId="unidades-label"
        label="Unidades"
        value={value}
        onChange={(event) => handleChange((typeof event.target.value === "string" ? event.target.value.split(",") : event.target.value).map(Number))}
        renderValue={(selected) => allSelected ? "Todos" : units.filter((unit) => selected.includes(unit.id)).map((unit) => unit.nome_da_unidade).join(", ")}
      >
        <MenuItem value={-1}>
          <Checkbox checked={allSelected} indeterminate={value.length > 0 && !allSelected} />
          <ListItemText primary="Todos" />
        </MenuItem>
        {units.map((unit) => (
          <MenuItem key={unit.id} value={unit.id}>
            <Checkbox checked={value.includes(unit.id)} />
            <ListItemText primary={unit.nome_da_unidade} />
          </MenuItem>
        ))}
      </Select>
      {error && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>{error}</Typography>}
    </FormControl>
  )
}
