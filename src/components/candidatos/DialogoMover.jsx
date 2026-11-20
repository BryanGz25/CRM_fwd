import { useState } from 'react'
import { ETAPAS, ETAPA_POR_ID } from '../../domain/etapas'
import { previsualizarMovimiento } from '../../domain/movimientos'
import { siguienteEtapa } from '../../store/crmReducer'
import { useCRM } from '../../store/CRMContext'
import { Modal } from '../ui/Modal'
import { Boton, Campo } from '../ui/Basicos'

// Muestra qué va a pasar ANTES de mover al candidato a otra etapa.
export function DialogoMover({ prospecto, onCerrar, destinoInicial }) {
  const { acciones } = useCRM()
  const [destino, setDestino] = useState(() => destinoInicial ?? siguienteEtapa(prospecto.etapa))
  const vista = previsualizarMovimiento(prospecto, destino)

  const confirmar = () => {
    if (!vista.valido) return
    acciones.moverProspecto(prospecto.id, destino)
    onCerrar()
  }

  return (
    <Modal
      titulo={`Mover ${prospecto.codigo}`}
      onCerrar={onCerrar}
      pie={
        <>
          <Boton variante="secundario" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton variante="morado" onClick={confirmar} disabled={!vista.valido} icono="ArrowRight">
            Confirmar movimiento
          </Boton>
        </>
      }
    >
      <p className="texto-suave">
        Etapa actual: <strong>{ETAPA_POR_ID[prospecto.etapa].nombre}</strong>
      </p>
      <Campo etiqueta="Mover a…" id="etapa-destino">
        <select id="etapa-destino" value={destino} onChange={(e) => setDestino(e.target.value)}>
          {ETAPAS.map((e) => (
            <option key={e.id} value={e.id}>
              {e.orden}. {e.nombre}
              {e.id === prospecto.etapa ? ' (actual)' : ''}
            </option>
          ))}
        </select>
      </Campo>

      <div className="consecuencias" aria-live="polite">
        <strong>{vista.titulo}</strong>
        <ul>
          {vista.lineas.map((linea) => (
            <li key={linea}>{linea}</li>
          ))}
        </ul>
      </div>
    </Modal>
  )
}
