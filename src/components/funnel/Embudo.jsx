import { dias, porcentaje } from '../../domain/formato'

// Embudo de 9 etapas: la barra es la conversión desde la etapa anterior;
// la línea negra marca la meta de esa etapa (PDF, Parte 2 · Cada etapa tiene tres números).
export function Embudo({ estadisticas }) {
  return (
    <ol className="embudo" aria-label="Embudo de admisiones por etapa">
      {estadisticas.map((e) => {
        const ancho = Math.max(0, Math.min(100, e.conversion))
        const color = e.enFuga ? 'var(--color-peligro)' : e.color
        return (
          <li key={e.id} className={`embudo__fila ${e.enFuga ? 'embudo__fila--fuga' : ''}`}>
            <span className="embudo__nombre" title={e.nombre}>
              {e.orden}. {e.nombre}
              {e.fuga && <span className="badge-fuga">FUGA</span>}
            </span>
            <div
              className="embudo__pista"
              role="img"
              aria-label={`${e.nombre}: conversión ${porcentaje(e.conversion)} frente a meta de ${e.meta} %`}
            >
              <div className="embudo__relleno" style={{ width: `${ancho}%`, background: color }} />
              {e.orden > 1 && <div className="embudo__meta" style={{ left: `${e.meta}%` }} />}
            </div>
            <span className="embudo__cifras">
              {e.llegaron} · {e.orden > 1 ? porcentaje(e.conversion) : '—'} · meta {e.meta} % · {dias(e.diasPromedio)}
              {e.orden > 1 && <> · fuga {e.fuga}</>}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
