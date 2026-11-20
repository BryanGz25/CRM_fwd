import { useCRM } from '../../store/CRMContext'

export function Avisos() {
  const { avisos } = useCRM()
  return (
    <div className="avisos" role="status" aria-live="polite">
      {avisos.map((aviso) => (
        <div key={aviso.id} className={`aviso ${aviso.tipo === 'aviso' ? 'aviso--aviso' : ''}`}>
          {aviso.texto}
        </div>
      ))}
    </div>
  )
}
