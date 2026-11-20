import { useEffect, useMemo, useReducer, useCallback, useState } from 'react'
import { CRMContext } from './CRMContext'
import { crmReducer, ACCIONES } from './crmReducer'
import { cargarEstado, guardarEstado, borrarEstadoGuardado, crearEstadoDemo } from './estadoInicial'
import { ETAPAS } from '../domain/etapas'
import { hoyISO } from '../domain/fechas'

export function CRMProvider({ children }) {
  const [estado, dispatch] = useReducer(crmReducer, undefined, cargarEstado)
  const [avisos, setAvisos] = useState([])

  // Persiste cada cambio en el navegador (solo preferencias de la demo).
  useEffect(() => {
    guardarEstado(estado)
  }, [estado])

  const notificar = useCallback((texto, tipo = 'ok') => {
    const id = Math.random().toString(36).slice(2)
    setAvisos((lista) => [...lista, { id, texto, tipo }])
    setTimeout(() => setAvisos((lista) => lista.filter((a) => a.id !== id)), 3500)
  }, [])

  const acciones = useMemo(
    () => ({
      moverProspecto: (id, etapa) => {
        const nombre = ETAPAS.find((e) => e.id === etapa)?.nombre
        dispatch({ type: ACCIONES.MOVER_PROSPECTO, payload: { id, etapa } })
        notificar(`Movido a «${nombre}». Fecha registrada: hoy.`)
      },
      revisar: (id) => dispatch({ type: ACCIONES.REVISAR_PROSPECTO, payload: { id } }),
      cambiarEstado: (id, estadoNuevo) => {
        dispatch({ type: ACCIONES.CAMBIAR_ESTADO, payload: { id, estado: estadoNuevo } })
        notificar('Estado actualizado.')
      },
      resolverResultado: (id, aprobado) => {
        dispatch({ type: ACCIONES.RESOLVER_RESULTADO, payload: { id, aprobado } })
        notificar(aprobado ? 'Resultado aprobado: avanza de etapa.' : 'Resultado no aprobado: pasa a Excluidos.', aprobado ? 'ok' : 'aviso')
      },
      guardarNotas: (id, notas) => dispatch({ type: ACCIONES.GUARDAR_NOTAS, payload: { id, notas } }),
      agregarProspecto: (datos) => {
        dispatch({ type: ACCIONES.AGREGAR_PROSPECTO, payload: datos })
        notificar('Entrada registrada. Aparece en azul hasta que alguien la revise.')
      },
      agregarCampusDay: (datos) => {
        dispatch({ type: ACCIONES.AGREGAR_CAMPUS_DAY, payload: datos })
        notificar('Campus Day agregado al calendario.')
      },
      agregarFechaLanding: (datos) => {
        dispatch({ type: ACCIONES.AGREGAR_FECHA_LANDING, payload: datos })
        notificar('Fecha agregada al landing.')
      },
      alternarFechaLanding: (id) => dispatch({ type: ACCIONES.ALTERNAR_FECHA_LANDING, payload: { id } }),
      agregarCampana: (datos) => {
        dispatch({ type: ACCIONES.AGREGAR_CAMPANA, payload: datos })
        notificar('Campaña creada en estado «En generación».')
      },
      cambiarEstadoPieza: (campanaId, piezaId, estadoPieza) =>
        dispatch({ type: ACCIONES.CAMBIAR_ESTADO_PIEZA, payload: { campanaId, piezaId, estado: estadoPieza } }),
      agregarPiezas: (campanaId, piezas) => {
        dispatch({ type: ACCIONES.AGREGAR_PIEZAS, payload: { campanaId, piezas } })
        notificar('Piezas agregadas: pendientes de aprobación humana.')
      },
      guardarInstruccion: (id, texto) => {
        dispatch({ type: ACCIONES.GUARDAR_INSTRUCCION, payload: { id, texto } })
        notificar('Instrucción guardada.')
      },
      restablecerInstrucciones: (instrucciones) =>
        dispatch({ type: ACCIONES.RESTABLECER_INSTRUCCIONES, payload: { instrucciones } }),
      restablecerDemo: () => {
        borrarEstadoGuardado()
        dispatch({ type: ACCIONES.RESTABLECER_DEMO, payload: { estado: crearEstadoDemo() } })
        notificar('Demo restablecida con datos ficticios.')
      },
    }),
    [notificar],
  )

  const valor = useMemo(
    () => ({ estado, acciones, avisos, hoy: hoyISO() }),
    [estado, acciones, avisos],
  )

  return <CRMContext.Provider value={valor}>{children}</CRMContext.Provider>
}
