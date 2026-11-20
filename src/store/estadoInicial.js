import {
  generarProspectos,
  CAMPUS_DAYS_INICIALES,
  COHORTES_INICIALES,
  FECHAS_LANDING_INICIALES,
  CAMPANAS_INICIALES,
  INSTRUCCIONES_FORDY_INICIALES,
} from '../domain/datosFicticios'

const CLAVE = 'crm-fwd:estado:v1'

export function crearEstadoDemo() {
  return {
    prospectos: generarProspectos(),
    campusDays: CAMPUS_DAYS_INICIALES,
    cohortes: COHORTES_INICIALES,
    fechasLanding: FECHAS_LANDING_INICIALES,
    campanas: CAMPANAS_INICIALES,
    instruccionesFordy: INSTRUCCIONES_FORDY_INICIALES,
  }
}

// Carga el estado guardado en este navegador. Si el almacenamiento no está disponible
// (modo privado, datos bloqueados) o el JSON no es válido, usa la demo.
export function cargarEstado() {
  try {
    const guardado = window.localStorage.getItem(CLAVE)
    if (!guardado) return crearEstadoDemo()
    const estado = JSON.parse(guardado)
    if (!Array.isArray(estado?.prospectos)) return crearEstadoDemo()
    return estado
  } catch {
    return crearEstadoDemo()
  }
}

export function guardarEstado(estado) {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(estado))
  } catch {
    // Sin almacenamiento disponible la app sigue funcionando en memoria.
  }
}

export function borrarEstadoGuardado() {
  try {
    window.localStorage.removeItem(CLAVE)
  } catch {
    // Nada que borrar si el almacenamiento no existe.
  }
}
