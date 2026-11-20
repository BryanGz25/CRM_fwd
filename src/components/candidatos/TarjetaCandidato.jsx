import { ETAPA_POR_ID, ESTADOS, DIAS_SIN_AVANCE_ALERTA } from '../../domain/etapas'
import { formatearFecha } from '../../domain/fechas'
import { Boton, Insignia } from '../ui/Basicos'

// Tarjeta de un candidato. Solo muestra el código: sin nombres ni contactos (PDF, Privacidad).
export function TarjetaCandidato({ prospecto, dias, acciones = [], onAbrir }) {
  const nuevo = !prospecto.revisado
  const etapa = ETAPA_POR_ID[prospecto.etapa]
  const atrasado = dias !== undefined && dias >= DIAS_SIN_AVANCE_ALERTA

  return (
    <article className={`fila-candidato ${nuevo ? 'fila-candidato--nuevo' : ''}`}>
      <div className="fila-candidato__cabecera">
        <h3 className="fila-candidato__codigo">{prospecto.codigo}</h3>
        <div className="acciones">
          {nuevo && <Insignia variante="nuevo">Sin revisar</Insignia>}
          {prospecto.estado !== 'activo' && <Insignia>{ESTADOS[prospecto.estado]}</Insignia>}
          {prospecto.pendienteResultado && <Insignia variante="morado">Resultado pendiente</Insignia>}
        </div>
      </div>
      <p className="fila-candidato__meta">
        {prospecto.sede} · {prospecto.canal} · {prospecto.cohorte}
      </p>
      <p className="fila-candidato__meta">
        Etapa: <strong>{etapa.nombre}</strong>
        {dias !== undefined && (
          <>
            {' · '}
            <span style={atrasado ? { color: 'var(--color-alerta)', fontWeight: 700 } : undefined}>
              {dias} {dias === 1 ? 'día' : 'días'} sin avance
            </span>
          </>
        )}
      </p>
      <p className="fila-candidato__meta texto-pequeno">Ingreso: {formatearFecha(prospecto.fechaIngreso)}</p>
      {(onAbrir || acciones.length > 0) && (
        <div className="fila-candidato__acciones">
          {onAbrir && (
            <Boton variante="secundario" pequeno icono="Eye" onClick={() => onAbrir(prospecto.id)}>
              Ver ficha
            </Boton>
          )}
          {acciones.map((accion) => (
            <Boton
              key={accion.texto}
              pequeno
              variante={accion.variante}
              icono={accion.icono}
              onClick={() => accion.onClick(prospecto.id)}
            >
              {accion.texto}
            </Boton>
          ))}
        </div>
      )}
    </article>
  )
}
