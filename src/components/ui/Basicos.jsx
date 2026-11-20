import { useEffect, useRef, useState } from 'react'
import { Icono } from './iconos'

// Revela su contenido con una transición la primera vez que entra en la pantalla (IntersectionObserver).
export function Revelar({ children, className = '', ...resto }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const nodo = ref.current
    if (!nodo || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return undefined
    }
    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          setVisible(true)
          observador.disconnect()
        }
      },
      { threshold: 0.12 },
    )
    observador.observe(nodo)
    return () => observador.disconnect()
  }, [])

  return (
    <div ref={ref} className={`revelar ${visible ? 'revelar--visible' : ''} ${className}`} {...resto}>
      {children}
    </div>
  )
}

export function EncabezadoPagina({ titulo, descripcion, acciones }) {
  return (
    <header className="encabezado-pagina">
      <div>
        <h1>{titulo}</h1>
        {descripcion && <p>{descripcion}</p>}
      </div>
      {acciones && <div className="acciones">{acciones}</div>}
    </header>
  )
}

export function Tarjeta({ titulo, subtitulo, acciones, children, className = '', id }) {
  return (
    <section className={`tarjeta ${className}`} id={id}>
      {(titulo || acciones) && (
        <div className="tarjeta__cabecera">
          <div>
            {titulo && <h2>{titulo}</h2>}
            {subtitulo && <p className="tarjeta__subtitulo">{subtitulo}</p>}
          </div>
          {acciones && <div className="acciones">{acciones}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

export function Kpi({ etiqueta, valor, detalle, variante = '' }) {
  return (
    <article className={`kpi ${variante ? `kpi--${variante}` : ''}`}>
      <p className="kpi__etiqueta">{etiqueta}</p>
      <p className="kpi__valor">{valor}</p>
      {detalle && <p className="kpi__detalle">{detalle}</p>}
    </article>
  )
}

export function Insignia({ children, variante = '' }) {
  return <span className={`insignia ${variante ? `insignia--${variante}` : ''}`}>{children}</span>
}

export function Vacio({ titulo, children }) {
  return (
    <div className="vacio">
      <Icono nombre="Inbox" size={28} />
      <p style={{ margin: '8px 0 0', fontWeight: 600 }}>{titulo}</p>
      {children && <p className="texto-pequeno">{children}</p>}
    </div>
  )
}

export function Boton({ variante = '', pequeno = false, icono, children, ...resto }) {
  const clases = ['boton', variante && `boton--${variante}`, pequeno && 'boton--pequeno']
    .filter(Boolean)
    .join(' ')
  return (
    <button type="button" className={clases} {...resto}>
      {icono && <Icono nombre={icono} size={pequeno ? 14 : 16} />}
      {children}
    </button>
  )
}

export function Campo({ etiqueta, children, id }) {
  return (
    <label className="campo" htmlFor={id}>
      <span className="campo__etiqueta">{etiqueta}</span>
      {children}
    </label>
  )
}
