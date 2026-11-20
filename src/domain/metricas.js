// Cálculos del embudo (PDF, Parte 2 · El embudo es la columna vertebral).
// Cada etapa tiene: meta de conversión, días promedio y fuga frente a su meta.

import { ETAPAS, DIAS_SIN_AVANCE_ALERTA } from './etapas'
import { diasEntre, hoyISO } from './fechas'

// Filtra candidatos por sede, cohorte y fecha de ingreso desde.
export function filtrarProspectos(prospectos, { sede = 'todas', cohorte = 'todas', desde = '' } = {}) {
  return prospectos.filter(
    (p) =>
      (sede === 'todas' || p.sede === sede) &&
      (cohorte === 'todas' || p.cohorte === cohorte) &&
      (!desde || p.fechaIngreso >= desde),
  )
}

export function ultimoAvance(prospecto) {
  return prospecto.historial[prospecto.historial.length - 1].fecha
}

export function diasSinAvance(prospecto, hoy = hoyISO()) {
  return diasEntre(ultimoAvance(prospecto), hoy)
}

// Estadísticas por etapa: llegaron, conversión desde la etapa anterior, fuga y días promedio.
export function estadisticasEmbudo(prospectos) {
  const llegaron = ETAPAS.map((e) =>
    prospectos.filter((p) => p.historial.some((h) => h.etapa === e.id)).length,
  )
  const actuales = ETAPAS.map((e) => prospectos.filter((p) => p.etapa === e.id).length)

  return ETAPAS.map((etapa, i) => {
    const anterior = i === 0 ? llegaron[0] : llegaron[i - 1]
    const conversion = i === 0 ? 100 : anterior === 0 ? 0 : (llegaron[i] / anterior) * 100
    const fuga = i === 0 ? 0 : Math.max(anterior - llegaron[i], 0)

    const tiempos = []
    prospectos.forEach((p) => {
      const idx = p.historial.findIndex((h) => h.etapa === etapa.id)
      const siguiente = p.historial[idx + 1]
      if (idx !== -1 && siguiente) tiempos.push(diasEntre(p.historial[idx].fecha, siguiente.fecha))
    })
    const diasPromedio = tiempos.length
      ? tiempos.reduce((a, b) => a + b, 0) / tiempos.length
      : null

    return {
      ...etapa,
      llegaron: llegaron[i],
      actuales: actuales[i],
      conversion,
      fuga,
      diasPromedio,
      enFuga: i > 0 && conversion < etapa.meta,
    }
  })
}

// Panel de admisiones: cifras de la primera etapa de fuga, como en el PDF (120 → 26).
export function resumenEmbudo(stats) {
  const agenda = stats.find((s) => s.id === 'agenda')
  const asiste = stats.find((s) => s.id === 'asiste')
  return {
    total: stats[0]?.llegaron ?? 0,
    agendaron: agenda?.llegaron ?? 0,
    asistieron: asiste?.llegaron ?? 0,
    conversionCampus: asiste ? asiste.conversion : 0,
    metaCampus: asiste?.meta ?? 0,
  }
}

// Porcentaje de prospectos que llegaron por redes sociales.
export function porcentajeRedes(prospectos) {
  if (!prospectos.length) return 0
  const redes = prospectos.filter((p) => p.canal === 'Redes sociales').length
  return (redes / prospectos.length) * 100
}

// "Qué atender hoy": candidatos activos sin avance en N días, o sin revisar.
// Orden: nuevos sin revisar primero, luego los que más días llevan sin avance.
export function listaAtencion(prospectos, { diasAlerta = DIAS_SIN_AVANCE_ALERTA, hoy = hoyISO() } = {}) {
  return prospectos
    .filter((p) => p.estado === 'activo' && p.etapa !== 'estudiante')
    .map((p) => ({ ...p, dias: diasSinAvance(p, hoy) }))
    .filter((p) => !p.revisado || p.dias >= diasAlerta)
    .sort((a, b) => {
      if (a.revisado !== b.revisado) return a.revisado ? 1 : -1
      return b.dias - a.dias
    })
}

// Resumen de un día: entraron, avances y pérdidas (para el reporte diario).
export function reporteDiario(prospectos, fecha) {
  const entraron = prospectos.filter((p) => p.fechaIngreso === fecha).length
  const avances = prospectos.reduce(
    (n, p) => n + p.historial.filter((h, i) => i > 0 && h.fecha === fecha).length,
    0,
  )
  const excluidos = prospectos.filter((p) => p.estado === 'excluido' && ultimoAvance(p) === fecha).length
  const enEspera = prospectos.filter((p) => p.estado === 'espera').length
  return { fecha, entraron, avances, excluidos, enEspera }
}
