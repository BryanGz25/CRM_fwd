import { useState } from 'react'
import { ETAPA_POR_ID, ESTADOS } from '../../domain/etapas'
import { formatearFecha } from '../../domain/fechas'
import { diasSinAvance } from '../../domain/metricas'
import { useCRM } from '../../store/CRMContext'
import { Modal } from '../ui/Modal'
import { Boton, Campo, Insignia } from '../ui/Basicos'
import { Icono } from '../ui/iconos'
import { DialogoMover } from './DialogoMover'

// Ficha de un candidato: datos, historial de etapas, notas y estado.
// Solo muestra el código del candidato (PDF, Demo 2 · Privacidad).
export function FichaCandidato({ id, onCerrar }) {
  const { estado, acciones, hoy } = useCRM()
  const prospecto = estado.prospectos.find((p) => p.id === id)
  const [notas, setNotas] = useState(prospecto?.notas ?? '')
  const [moviendo, setMoviendo] = useState(false)

  if (!prospecto) {
    return (
      <Modal titulo="Ficha no disponible" onCerrar={onCerrar}>
        <p>Este candidato ya no existe en la demo.</p>
      </Modal>
    )
  }

  const etapa = ETAPA_POR_ID[prospecto.etapa]
  const dias = diasSinAvance(prospecto, hoy)

  if (moviendo) {
    return <DialogoMover prospecto={prospecto} onCerrar={() => setMoviendo(false)} />
  }

  return (
    <Modal
      titulo={`Ficha ${prospecto.codigo}`}
      onCerrar={onCerrar}
      pie={
        <>
          <Boton variante="secundario" onClick={() => acciones.guardarNotas(prospecto.id, notas)}>
            <Icono nombre="Save" size={16} /> Guardar nota
          </Boton>
          <Boton variante="morado" icono="ArrowRight" onClick={() => setMoviendo(true)}>
            Mover a…
          </Boton>
        </>
      }
    >
      <div className="acciones" style={{ marginBottom: 12 }}>
        <Insignia variante="morado">{etapa.nombre}</Insignia>
        {!prospecto.revisado && <Insignia variante="nuevo">Sin revisar</Insignia>}
        {prospecto.estado !== 'activo' && <Insignia>{ESTADOS[prospecto.estado]}</Insignia>}
      </div>

      <dl className="rejilla" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', margin: 0 }}>
        <div>
          <dt className="texto-pequeno texto-suave">Sede</dt>
          <dd style={{ margin: 0, fontWeight: 600 }}>{prospecto.sede}</dd>
        </div>
        <div>
          <dt className="texto-pequeno texto-suave">Canal</dt>
          <dd style={{ margin: 0, fontWeight: 600 }}>{prospecto.canal}</dd>
        </div>
        <div>
          <dt className="texto-pequeno texto-suave">Cohorte</dt>
          <dd style={{ margin: 0, fontWeight: 600 }}>{prospecto.cohorte}</dd>
        </div>
        <div>
          <dt className="texto-pequeno texto-suave">Ingreso</dt>
          <dd style={{ margin: 0, fontWeight: 600 }}>{formatearFecha(prospecto.fechaIngreso)}</dd>
        </div>
        <div>
          <dt className="texto-pequeno texto-suave">Sin avance</dt>
          <dd style={{ margin: 0, fontWeight: 600 }}>{dias} días</dd>
        </div>
      </dl>

      <h3 style={{ marginTop: 18 }}>Historial de etapas</h3>
      <ol className="linea-tiempo">
        {prospecto.historial.map((h, i) => (
          <li key={`${h.etapa}-${i}`}>
            <strong>{ETAPA_POR_ID[h.etapa].nombre}</strong>
            <span className="texto-suave"> · {formatearFecha(h.fecha)}</span>
          </li>
        ))}
      </ol>

      <h3 style={{ marginTop: 18 }}>Estado de gestión</h3>
      <Campo etiqueta="Estado" id="estado-candidato">
        <select
          id="estado-candidato"
          value={prospecto.estado}
          onChange={(e) => acciones.cambiarEstado(prospecto.id, e.target.value)}
        >
          {Object.entries(ESTADOS).map(([valor, texto]) => (
            <option key={valor} value={valor}>
              {texto}
            </option>
          ))}
        </select>
      </Campo>

      <div style={{ marginTop: 14 }}>
        <Campo etiqueta="Notas internas (sin datos personales)" id="notas-candidato">
          <textarea id="notas-candidato" value={notas} onChange={(e) => setNotas(e.target.value)} />
        </Campo>
      </div>
    </Modal>
  )
}
