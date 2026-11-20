// Utilidades de fechas en formato ISO (YYYY-MM-DD), sin dependencias externas.

const MS_DIA = 24 * 60 * 60 * 1000

export function hoyISO() {
  return aISO(new Date())
}

export function aISO(fecha) {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function sumarDias(iso, dias) {
  const [y, m, d] = iso.split('-').map(Number)
  const fecha = new Date(Date.UTC(y, m - 1, d + dias))
  return fecha.toISOString().slice(0, 10)
}

// Diferencia en días entre dos fechas ISO (b - a).
export function diasEntre(a, b) {
  const [ya, ma, da] = a.split('-').map(Number)
  const [yb, mb, db] = b.split('-').map(Number)
  return Math.round((Date.UTC(yb, mb - 1, db) - Date.UTC(ya, ma - 1, da)) / MS_DIA)
}

export function formatearFecha(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('es-CR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
