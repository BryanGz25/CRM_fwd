// Reducer del estado del CRM. Toda la lógica de cambio vive aquí, sin efectos secundarios.

import { ETAPAS, ETAPA_POR_ID } from '../domain/etapas'
import { hoyISO } from '../domain/fechas'

export function crearId(prefijo) {
  return `${prefijo}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

export function siguienteEtapa(etapaId) {
  const actual = ETAPA_POR_ID[etapaId]
  return ETAPAS.find((e) => e.orden === actual.orden + 1)?.id ?? etapaId
}

function actualizarProspecto(state, id, cambios) {
  return {
    ...state,
    prospectos: state.prospectos.map((p) => (p.id === id ? { ...p, ...cambios(p) } : p)),
  }
}

export const ACCIONES = {
  MOVER_PROSPECTO: 'MOVER_PROSPECTO',
  REVISAR_PROSPECTO: 'REVISAR_PROSPECTO',
  CAMBIAR_ESTADO: 'CAMBIAR_ESTADO',
  RESOLVER_RESULTADO: 'RESOLVER_RESULTADO',
  GUARDAR_NOTAS: 'GUARDAR_NOTAS',
  AGREGAR_PROSPECTO: 'AGREGAR_PROSPECTO',
  AGREGAR_CAMPUS_DAY: 'AGREGAR_CAMPUS_DAY',
  AGREGAR_FECHA_LANDING: 'AGREGAR_FECHA_LANDING',
  ALTERNAR_FECHA_LANDING: 'ALTERNAR_FECHA_LANDING',
  AGREGAR_CAMPANA: 'AGREGAR_CAMPANA',
  CAMBIAR_ESTADO_PIEZA: 'CAMBIAR_ESTADO_PIEZA',
  AGREGAR_PIEZAS: 'AGREGAR_PIEZAS',
  GUARDAR_INSTRUCCION: 'GUARDAR_INSTRUCCION',
  RESTABLECER_INSTRUCCIONES: 'RESTABLECER_INSTRUCCIONES',
  RESTABLECER_DEMO: 'RESTABLECER_DEMO',
}

export function crmReducer(state, accion) {
  const hoy = hoyISO()

  switch (accion.type) {
    case ACCIONES.MOVER_PROSPECTO: {
      const { id, etapa, fecha = hoy } = accion.payload
      return actualizarProspecto(state, id, (p) => ({
        etapa,
        revisado: true,
        pendienteResultado: false,
        historial: [...p.historial, { etapa, fecha }],
      }))
    }

    case ACCIONES.REVISAR_PROSPECTO:
      return actualizarProspecto(state, accion.payload.id, () => ({ revisado: true }))

    case ACCIONES.CAMBIAR_ESTADO:
      return actualizarProspecto(state, accion.payload.id, () => ({ estado: accion.payload.estado }))

    case ACCIONES.RESOLVER_RESULTADO: {
      const { id, aprobado } = accion.payload
      return actualizarProspecto(state, id, (p) => {
        if (!aprobado) return { pendienteResultado: false, estado: 'excluido' }
        const etapa = siguienteEtapa(p.etapa)
        return {
          pendienteResultado: false,
          revisado: true,
          etapa,
          historial: etapa === p.etapa ? p.historial : [...p.historial, { etapa, fecha: hoy }],
        }
      })
    }

    case ACCIONES.GUARDAR_NOTAS:
      return actualizarProspecto(state, accion.payload.id, () => ({ notas: accion.payload.notas }))

    case ACCIONES.AGREGAR_PROSPECTO: {
      const nuevo = {
        id: crearId('p'),
        codigo: `CND-${String(state.prospectos.length + 1).padStart(4, '0')}`,
        sede: accion.payload.sede,
        canal: accion.payload.canal,
        cohorte: accion.payload.cohorte,
        etapa: 'prospecto',
        historial: [{ etapa: 'prospecto', fecha: hoy }],
        fechaIngreso: hoy,
        revisado: false,
        pendienteResultado: false,
        estado: 'activo',
        notas: '',
      }
      return { ...state, prospectos: [nuevo, ...state.prospectos] }
    }

    case ACCIONES.AGREGAR_CAMPUS_DAY:
      return { ...state, campusDays: [...state.campusDays, { id: crearId('cd'), agendados: 0, asistieron: 0, ...accion.payload }] }

    case ACCIONES.AGREGAR_FECHA_LANDING:
      return { ...state, fechasLanding: [...state.fechasLanding, { id: crearId('fl'), visible: true, ...accion.payload }] }

    case ACCIONES.ALTERNAR_FECHA_LANDING:
      return {
        ...state,
        fechasLanding: state.fechasLanding.map((f) =>
          f.id === accion.payload.id ? { ...f, visible: !f.visible } : f,
        ),
      }

    case ACCIONES.AGREGAR_CAMPANA:
      return {
        ...state,
        campanas: [
          ...state.campanas,
          { id: crearId('c'), piezas: [], estado: 'En generación', piezasMeta: 0, ...accion.payload },
        ],
      }

    case ACCIONES.CAMBIAR_ESTADO_PIEZA:
      return {
        ...state,
        campanas: state.campanas.map((c) =>
          c.id !== accion.payload.campanaId
            ? c
            : {
                ...c,
                piezas: c.piezas.map((pieza) =>
                  pieza.id === accion.payload.piezaId ? { ...pieza, estado: accion.payload.estado } : pieza,
                ),
              },
        ),
      }

    case ACCIONES.AGREGAR_PIEZAS:
      return {
        ...state,
        campanas: state.campanas.map((c) =>
          c.id !== accion.payload.campanaId
            ? c
            : { ...c, piezas: [...c.piezas, ...accion.payload.piezas] },
        ),
      }

    case ACCIONES.GUARDAR_INSTRUCCION:
      return {
        ...state,
        instruccionesFordy: state.instruccionesFordy.map((i) =>
          i.id === accion.payload.id ? { ...i, texto: accion.payload.texto } : i,
        ),
      }

    case ACCIONES.RESTABLECER_INSTRUCCIONES:
      return { ...state, instruccionesFordy: accion.payload.instrucciones }

    case ACCIONES.RESTABLECER_DEMO:
      return accion.payload.estado

    default:
      return state
  }
}
