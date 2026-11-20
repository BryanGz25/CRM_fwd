import { useScrollSpy } from '../../hooks/useScroll'

// Índice de la página que se actualiza con el scroll (scroll-spy).
// En escritorio es una columna fija a la izquierda; en móvil, pestañas horizontales.
export function IndiceSecciones({ secciones }) {
  const ids = secciones.map((s) => s.id)
  const activo = useScrollSpy(ids)

  const enlaces = () =>
    secciones.map((s) => (
      <a
        key={s.id}
        href={`#${s.id}`}
        className={s.id === activo ? 'activo' : ''}
        aria-current={s.id === activo ? 'location' : undefined}
      >
        {s.texto}
      </a>
    ))

  return (
    <>
      <nav className="seccion-tabs" aria-label="Secciones de la página">
        {enlaces()}
      </nav>
      <nav className="esquema__indice" aria-label="Índice de la página">
        <p className="texto-pequeno texto-suave" style={{ margin: '0 0 6px', fontWeight: 700 }}>
          En esta página
        </p>
        {enlaces()}
      </nav>
    </>
  )
}
