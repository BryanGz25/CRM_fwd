import { SEDES, COHORTES } from '../../domain/etapas'

// Filtros comunes de sede, cohorte y fecha de ingreso desde.
export function BarraFiltros({ filtros, onCambiar, conCohorte = true, conFecha = true, extra }) {
  return (
    <div className="barra-filtros" role="search" aria-label="Filtros">
      <label className="campo">
        <span className="campo__etiqueta">Sede</span>
        <select value={filtros.sede} onChange={(e) => onCambiar({ ...filtros, sede: e.target.value })}>
          <option value="todas">Todas</option>
          {SEDES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      {conCohorte && (
        <label className="campo">
          <span className="campo__etiqueta">Cohorte</span>
          <select value={filtros.cohorte} onChange={(e) => onCambiar({ ...filtros, cohorte: e.target.value })}>
            <option value="todas">Todas</option>
            {COHORTES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      )}
      {conFecha && (
        <label className="campo">
          <span className="campo__etiqueta">Ingresó desde</span>
          <input
            type="date"
            value={filtros.desde}
            onChange={(e) => onCambiar({ ...filtros, desde: e.target.value })}
          />
        </label>
      )}
      {extra}
    </div>
  )
}
