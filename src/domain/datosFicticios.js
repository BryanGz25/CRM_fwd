// Datos ficticios para la demo. Nunca se usan datos reales de FWD (PDF, Miniproyecto · Reglas).
// Generación determinista: la misma semilla produce siempre los mismos candidatos.

import { ETAPAS, SEDES, CANALES, COHORTES } from './etapas'
import { hoyISO, sumarDias } from './fechas'

// Cuántos candidatos llegan a cada etapa (acumulado). Reproduce la cifra del PDF:
// 120 agendaron Campus Day, 26 asistieron (21,7 %).
const LLEGADAS = [180, 150, 120, 26, 18, 14, 10, 8, 7]

function generadorAleatorio(semilla) {
  let estado = semilla
  return () => {
    estado = (estado * 1664525 + 1013904223) % 4294967296
    return estado / 4294967296
  }
}

// Código neutro: sin nombres, cédulas ni contactos (PDF, Demo 2 · Privacidad).
function codigo(n) {
  return `CND-${String(n).padStart(4, '0')}`
}

function canalPara(azar) {
  const r = azar()
  if (r < 0.59) return 'Redes sociales'
  return CANALES[1 + Math.floor(azar() * (CANALES.length - 1))]
}

export function generarProspectos() {
  const azar = generadorAleatorio(20261120)
  const hoy = hoyISO()
  const prospectos = []

  // Cuántos llegan exactamente hasta la etapa i (índice 0..8).
  const etapaFinal = []
  LLEGADAS.forEach((llegada, i) => {
    const siguiente = LLEGADAS[i + 1] ?? 0
    for (let k = 0; k < llegada - siguiente; k++) etapaFinal.push(i)
  })

  etapaFinal.forEach((indiceFinal, n) => {
    const numero = n + 1
    const historial = []
    let fecha = sumarDias(hoy, -(60 - Math.floor(azar() * 25)))
    for (let i = 0; i <= indiceFinal; i++) {
      // Ninguna fecha del historial puede quedar en el futuro.
      historial.push({ etapa: ETAPAS[i].id, fecha: fecha > hoy ? hoy : fecha })
      fecha = sumarDias(fecha, 1 + Math.floor(azar() * 9))
    }
    const fechaIngreso = historial[0].fecha

    const reciente = fechaIngreso >= sumarDias(hoy, -7)
    const pendienteResultado =
      (ETAPAS[indiceFinal].id === 'prueba' || ETAPAS[indiceFinal].id === 'entrevista') && azar() < 0.6

    let estado = 'activo'
    if (indiceFinal === 2 && azar() < 0.08) estado = 'espera'
    if (indiceFinal <= 3 && azar() < 0.1) estado = 'excluido'

    prospectos.push({
      id: `p-${numero}`,
      codigo: codigo(numero),
      sede: SEDES[numero % 2 === 0 ? 0 : 1],
      canal: canalPara(azar),
      cohorte: COHORTES[0],
      etapa: ETAPAS[indiceFinal].id,
      historial,
      fechaIngreso,
      revisado: !reciente || azar() < 0.6,
      pendienteResultado,
      estado,
      notas: '',
    })
  })

  return prospectos
}

export const CAMPUS_DAYS_INICIALES = [
  { id: 'cd-1', sede: 'Desamparados', fecha: '2026-11-13', agendados: 120, asistieron: 26 },
  { id: 'cd-2', sede: 'Puntarenas', fecha: '2026-11-27', agendados: 0, asistieron: 0 },
  { id: 'cd-3', sede: 'Desamparados', fecha: '2026-12-04', agendados: 0, asistieron: 0 },
]

export const COHORTES_INICIALES = [
  { id: 'Gen 1-2027', inicio: '2027-01-18', fin: '2027-06-30', estado: 'Admisiones abiertas' },
  { id: 'Gen 2-2027', inicio: '2027-07-12', fin: '2027-12-10', estado: 'Próximamente' },
]

export const FECHAS_LANDING_INICIALES = [
  { id: 'fl-1', texto: 'Campus Day · Desamparados', fecha: '2026-11-13', visible: true },
  { id: 'fl-2', texto: 'Campus Day · Puntarenas', fecha: '2026-11-27', visible: true },
  { id: 'fl-3', texto: 'Inicio de admisiones Gen 1-2027', fecha: '2026-12-04', visible: false },
]

// Presupuesto total de mercadeo para el periodo (ficticio).
export const PRESUPUESTO_DISPONIBLE = 40000

export const CAMPANAS_INICIALES = [
  { id: 'c-1', nombre: 'Inscripciones Campus Day · Desamparados', objetivo: 'Llenar el Campus Day de Desamparados', presupuesto: 16000, estado: 'En generación', piezasMeta: 9, piezas: [] },
  { id: 'c-2', nombre: 'Navidad Solidaria en Desamparados 2026', objetivo: 'Dar a conocer la campaña solidaria', presupuesto: 4000, estado: 'En generación', piezasMeta: 3, piezas: [] },
  { id: 'c-3', nombre: 'Campaña de atracción de estudiantes', objetivo: 'Atraer nuevos estudiantes al programa', presupuesto: 4500, estado: 'En generación', piezasMeta: 4, piezas: [] },
]

// Las 7 instrucciones editables del "Cerebro de Fordy" (PDF, Demo 5).
export const INSTRUCCIONES_FORDY_INICIALES = [
  {
    id: 'personalidad',
    titulo: 'Personalidad base y estrategia',
    texto:
      'Eres Fordy, el asistente de mercadeo de FWD. Hablas en español de Costa Rica, con tono cercano, claro y respetuoso. Tu objetivo es atraer candidatos a la carrera y acompañarlos en el embudo de admisiones.',
  },
  {
    id: 'reglas',
    titulo: 'Reglas y contexto global',
    texto:
      'Nunca reveles datos personales de candidatos. No prometas becas ni fechas que no estén confirmadas. Toda pieza debe ser aprobada por una persona antes de publicarse.',
  },
  {
    id: 'paso1',
    titulo: 'Paso 1 · objetivo y parámetros',
    texto:
      'Objetivo de negocio: {{objetivo_negocio}}. Presupuesto disponible: {{presupuesto}}. Campaña: {{nombre}}. Confirma el objetivo antes de crear piezas.',
  },
  {
    id: 'paso2',
    titulo: 'Paso 2 · ficha y mensaje central',
    texto:
      'Resume la campaña "{{nombre}}" en una ficha breve y define un único mensaje central alineado con el objetivo: {{objetivo_negocio}}.',
  },
  {
    id: 'generacion',
    titulo: 'Generación de contenido con IA',
    texto:
      'Genera textos para redes sociales a partir de la ficha. Cada pieza debe ser corta, con llamado a la acción y sin prometer resultados.',
  },
  {
    id: 'paso4',
    titulo: 'Paso 4 · asesoría de piezas',
    texto:
      'Revisa cada pieza contra el mensaje central. Sugiere mejoras de claridad, tono y llamado a la acción. Señala cualquier riesgo de privacidad o de promesa falsa.',
  },
  {
    id: 'paso5',
    titulo: 'Paso 5 · aprobación y neuromarketing',
    texto:
      'Aplica principios de neuromarketing (urgencia responsable, prueba social, reciprocidad). Deja la pieza en estado "Pendiente de aprobación" hasta que una persona la apruebe.',
  },
]
