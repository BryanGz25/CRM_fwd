import { useProgresoScroll, useScrollPosicion } from '../../hooks/useScroll'
import { Icono } from '../ui/iconos'

// Barra fina arriba que muestra cuánto de la página se ha recorrido.
export function BarraProgreso() {
  const progreso = useProgresoScroll()
  return (
    <div className="barra-progreso" aria-hidden="true">
      <div className="barra-progreso__valor" style={{ width: `${progreso}%` }} />
    </div>
  )
}

// Botón "volver arriba": aparece después de bajar 400 px.
export function BotonArriba() {
  const { y } = useScrollPosicion()
  const visible = y > 400
  return (
    <button
      type="button"
      className={`boton-arriba ${visible ? 'boton-arriba--visible' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Volver arriba"
      tabIndex={visible ? 0 : -1}
    >
      <Icono nombre="ArrowUp" size={20} />
    </button>
  )
}
