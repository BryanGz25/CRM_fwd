// "Mover a…": antes de cambiar una etapa, el sistema dice qué va a pasar (PDF, Parte 2 · Principio de diseño).

import { ETAPA_POR_ID } from './etapas'
import { hoyISO } from './fechas'

export function previsualizarMovimiento(prospecto, etapaDestinoId) {
  const origen = ETAPA_POR_ID[prospecto.etapa]
  const destino = ETAPA_POR_ID[etapaDestinoId]
  const lineas = []

  if (origen.id === destino.id) {
    return { valido: false, titulo: 'Sin cambios', lineas: ['El candidato ya está en esa etapa.'], tono: 'aviso' }
  }

  const avanza = destino.orden > origen.orden
  const saltos = Math.abs(destino.orden - origen.orden)

  lineas.push(`Pasa de «${origen.nombre}» a «${destino.nombre}».`)
  lineas.push(`Se registra la fecha de hoy (${hoyISO()}) en su historial.`)

  if (avanza && saltos > 1) {
    lineas.push(`Salta ${saltos - 1} etapa(s): esos pasos no quedarán registrados.`)
  }
  if (!avanza) {
    lineas.push('Retrocede en el embudo: los días promedio de las etapas se recalculan.')
  }
  if (destino.fuga) {
    lineas.push(`«${destino.nombre}» es una etapa de fuga: se contará frente a su meta de ${destino.meta} %.`)
  }
  if (destino.id === 'estudiante') {
    lineas.push('Pasa a Estudiante: sale de la lista «Qué atender hoy».')
  }
  lineas.push('Se marca como revisado: deja de verse en azul.')

  return {
    valido: true,
    titulo: `Mover a «${destino.nombre}»`,
    lineas,
    tono: avanza ? 'ok' : 'aviso',
  }
}
