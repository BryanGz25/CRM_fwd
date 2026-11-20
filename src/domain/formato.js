// Formato de números para la interfaz (es-CR).

export function porcentaje(valor) {
  return `${valor.toLocaleString('es-CR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`
}

export function moneda(valor) {
  return valor.toLocaleString('es-CR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export function dias(valor) {
  if (valor === null || valor === undefined) return '—'
  return `${valor.toLocaleString('es-CR', { maximumFractionDigits: 1 })} d`
}
