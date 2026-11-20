// Las 9 etapas del embudo de admisiones (PDF, Parte 1 · El recorrido del candidato).
// meta: porcentaje mínimo que debería pasar a la siguiente etapa.
// fuga: etapas donde se concentra la pérdida de candidatos según el taller.

export const ETAPAS = [
  { id: 'prospecto', orden: 1, nombre: 'Prospecto', meta: 80, fuga: false, color: '#6366f1' },
  { id: 'candidato', orden: 2, nombre: 'Candidato', meta: 75, fuga: false, color: '#8b5cf6' },
  { id: 'agenda', orden: 3, nombre: 'Agenda Campus Day', meta: 75, fuga: false, color: '#0ea5e9' },
  { id: 'asiste', orden: 4, nombre: 'Asiste Campus Day', meta: 75, fuga: true, color: '#14b8a6' },
  { id: 'prueba', orden: 5, nombre: 'Prueba Técnica', meta: 80, fuga: false, color: '#22c55e' },
  { id: 'entrevista', orden: 6, nombre: 'Entrevista', meta: 70, fuga: false, color: '#eab308' },
  { id: 'admitido', orden: 7, nombre: 'Admitido', meta: 90, fuga: true, color: '#f97316' },
  { id: 'semana', orden: 8, nombre: 'Semana de Prueba', meta: 85, fuga: false, color: '#ef4444' },
  { id: 'estudiante', orden: 9, nombre: 'Estudiante', meta: 100, fuga: false, color: '#1e3a8a' },
]

export const ETAPA_POR_ID = Object.fromEntries(ETAPAS.map((e) => [e.id, e]))

export const SEDES = ['Desamparados', 'Puntarenas']

export const CANALES = ['Redes sociales', 'Referido', 'Landing', 'Campus Day', 'Otro']

export const COHORTES = ['Gen 1-2027', 'Gen 2-2027']

// Estados de gestión que sacan a un candidato de la vista activa.
export const ESTADOS = {
  activo: 'Activo',
  espera: 'Lista de espera',
  excluido: 'Excluido',
}

export const DIAS_SIN_AVANCE_ALERTA = 3
