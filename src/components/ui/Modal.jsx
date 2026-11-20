import { useEffect, useRef } from 'react'
import { Icono } from './iconos'

// Diálogo accesible: cierra con Escape o clic en el velo, bloquea el scroll de fondo
// y mueve el foco dentro del diálogo.
export function Modal({ titulo, onCerrar, children, pie }) {
  const dialogo = useRef(null)

  useEffect(() => {
    const anterior = document.activeElement
    const bloqueoAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogo.current?.focus()

    const alPulsar = (evento) => {
      if (evento.key === 'Escape') onCerrar()
    }
    window.addEventListener('keydown', alPulsar)

    return () => {
      window.removeEventListener('keydown', alPulsar)
      document.body.style.overflow = bloqueoAnterior
      if (anterior instanceof HTMLElement) anterior.focus()
    }
  }, [onCerrar])

  return (
    <div className="modal__velo" onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>
      <div
        ref={dialogo}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal"
        tabIndex={-1}
      >
        <div className="modal__cabecera">
          <h2 id="titulo-modal">{titulo}</h2>
          <button type="button" className="modal__cerrar" onClick={onCerrar} aria-label="Cerrar">
            <Icono nombre="X" size={18} />
          </button>
        </div>
        {children}
        {pie && <div className="modal__pie">{pie}</div>}
      </div>
    </div>
  )
}
