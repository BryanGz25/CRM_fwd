// Hooks de eventos de scroll. Todos escuchan el evento "scroll" de la ventana,
// limitan la frecuencia con requestAnimationFrame y limpian sus listeners al desmontar.

import { useEffect, useState, useRef } from 'react'

// Ejecuta `fn` como máximo una vez por frame mientras el usuario hace scroll.
function escucharScroll(fn) {
  let pendiente = false
  const manejador = () => {
    if (pendiente) return
    pendiente = true
    requestAnimationFrame(() => {
      pendiente = false
      fn()
    })
  }
  window.addEventListener('scroll', manejador, { passive: true })
  fn()
  return () => window.removeEventListener('scroll', manejador)
}

// Posición vertical actual y dirección del último desplazamiento ('arriba' | 'abajo').
export function useScrollPosicion() {
  const [estado, setEstado] = useState({ y: 0, direccion: 'abajo' })

  useEffect(() => {
    let ultimoY = window.scrollY
    return escucharScroll(() => {
      const y = window.scrollY
      if (y === ultimoY) return
      const direccion = y > ultimoY ? 'abajo' : 'arriba'
      ultimoY = y
      setEstado({ y, direccion })
    })
  }, [])

  return estado
}

// Porcentaje (0-100) de la página ya recorrida. Para la barra de progreso de lectura.
export function useProgresoScroll() {
  const [progreso, setProgreso] = useState(0)

  useEffect(
    () =>
      escucharScroll(() => {
        const maximo = document.documentElement.scrollHeight - window.innerHeight
        setProgreso(maximo > 0 ? Math.min(100, (window.scrollY / maximo) * 100) : 0)
      }),
    [],
  )

  return progreso
}

// Scroll-spy: devuelve el id de la sección que está bajo la línea de lectura.
// Útil para resaltar en un índice lateral en qué parte de la página se está.
export function useScrollSpy(ids, desplazamiento = 120) {
  const [activo, setActivo] = useState(ids[0])
  const clave = ids.join('|')

  useEffect(() => {
    const idsActuales = clave.split('|')
    return escucharScroll(() => {
      let actual = idsActuales[0]
      for (const id of idsActuales) {
        const seccion = document.getElementById(id)
        if (seccion && seccion.getBoundingClientRect().top <= desplazamiento) actual = id
      }
      setActivo(actual)
    })
  }, [clave, desplazamiento])

  return activo
}

// Carga progresiva: muestra `paso` elementos más cuando el usuario llega cerca del final.
// Si cambia el total (por filtros), la cantidad visible vuelve al primer bloque.
export function useCargaAlDesplazar(total, paso = 20) {
  const [carga, setCarga] = useState({ total, cantidad: paso })
  const cargando = useRef(false)

  // Estado derivado: si el total cambió desde la última carga, se usa el bloque inicial.
  const visibles = carga.total === total ? carga.cantidad : paso

  useEffect(
    () =>
      escucharScroll(() => {
        const cercaDelFinal =
          window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 400
        if (cercaDelFinal && !cargando.current) {
          cargando.current = true
          setCarga((c) => {
            const actual = c.total === total ? c.cantidad : paso
            return { total, cantidad: Math.min(actual + paso, Math.max(total, paso)) }
          })
          requestAnimationFrame(() => {
            cargando.current = false
          })
        }
      }),
    [total, paso],
  )

  return visibles
}
