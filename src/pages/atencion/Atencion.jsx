import { useMemo, useState } from 'react'
import { useCRM } from '../../store/CRMContext'
import { diasSinAvance } from '../../domain/metricas'
import { EncabezadoPagina, Tarjeta, Vacio, Kpi } from '../../components/ui/Basicos'
import { BarraFiltros } from '../../components/ui/BarraFiltros'
import { TarjetaCandidato } from '../../components/candidatos/TarjetaCandidato'
import { FichaCandidato } from '../../components/candidatos/FichaCandidato'

// Cada vista de la sección "Atención" es un filtro del embudo con sus acciones propias.
const VISTAS = {
  entrevistas: {
    titulo: 'Entrevistas',
    descripcion: 'Candidatos en la etapa de entrevista, ordenados por tiempo sin avance.',
    filtro: (p) => p.etapa === 'entrevista' && p.estado === 'activo',
    acciones: (api) => [
      { texto: 'Revisar', icono: 'Check', variante: 'exito', solo: (p) => !p.revisado, onClick: api.revisar },
    ],
    vacio: 'No hay entrevistas pendientes con los filtros actuales.',
  },
  resultados: {
    titulo: 'Resultados por revisar',
    descripcion:
      'Pruebas técnicas y entrevistas esperando decisión. Aprobar avanza al candidato; no aprobar lo pasa a Excluidos.',
    filtro: (p) => p.pendienteResultado && p.estado === 'activo',
    acciones: (api) => [
      { texto: 'Aprobar', icono: 'Check', variante: 'exito', onClick: (id) => api.resolverResultado(id, true) },
      { texto: 'No aprobar', icono: 'Trash', variante: 'peligro', onClick: (id) => api.resolverResultado(id, false) },
    ],
    vacio: 'No hay resultados pendientes de revisión.',
  },
  espera: {
    titulo: 'Lista de espera',
    descripcion: 'Candidatos que quedaron en espera. Reactívalos cuando haya cupo o exclúyelos si ya no aplican.',
    filtro: (p) => p.estado === 'espera',
    acciones: (api) => [
      { texto: 'Reactivar', icono: 'RotateCcw', variante: 'exito', onClick: (id) => api.cambiarEstado(id, 'activo') },
      { texto: 'Excluir', icono: 'Trash', variante: 'peligro', onClick: (id) => api.cambiarEstado(id, 'excluido') },
    ],
    vacio: 'La lista de espera está vacía.',
  },
  excluidos: {
    titulo: 'Excluidos',
    descripcion: 'Candidatos fuera del proceso. Se pueden reactivar si la situación cambia.',
    filtro: (p) => p.estado === 'excluido',
    acciones: (api) => [
      { texto: 'Reactivar', icono: 'RotateCcw', variante: 'secundario', onClick: (id) => api.cambiarEstado(id, 'activo') },
    ],
    vacio: 'No hay candidatos excluidos.',
  },
}

const FILTROS_INICIALES = { sede: 'todas', cohorte: 'todas', desde: '' }

export function Atencion({ vista }) {
  const { estado, acciones: api, hoy } = useCRM()
  const config = VISTAS[vista]
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)
  const [fichaId, setFichaId] = useState(null)

  const lista = useMemo(
    () =>
      estado.prospectos
        .filter(config.filtro)
        .filter((p) => (filtros.sede === 'todas' ? true : p.sede === filtros.sede))
        .filter((p) => (filtros.cohorte === 'todas' ? true : p.cohorte === filtros.cohorte))
        .filter((p) => (filtros.desde ? p.fechaIngreso >= filtros.desde : true))
        .map((p) => ({ ...p, dias: diasSinAvance(p, hoy) }))
        .sort((a, b) => b.dias - a.dias),
    [estado.prospectos, config, filtros, hoy],
  )

  const acciones = config.acciones(api)

  return (
    <>
      <EncabezadoPagina titulo={config.titulo} descripcion={config.descripcion} />

      <section className="rejilla" aria-label="Resumen de la vista">
        <Kpi etiqueta="En esta vista" valor={lista.length} detalle={config.titulo} />
        <Kpi
          etiqueta="Sin revisar"
          valor={lista.filter((p) => !p.revisado).length}
          detalle="Aparecen en azul"
          variante={lista.some((p) => !p.revisado) ? 'alerta' : 'exito'}
        />
        <Kpi
          etiqueta="Más de 7 días sin avance"
          valor={lista.filter((p) => p.dias > 7).length}
          detalle="Prioridad alta"
          variante={lista.some((p) => p.dias > 7) ? 'peligro' : ''}
        />
      </section>

      <div style={{ marginTop: 16 }}>
        <BarraFiltros filtros={filtros} onCambiar={setFiltros} />
      </div>

      <Tarjeta titulo={`${config.titulo} (${lista.length})`}>
        {lista.length === 0 ? (
          <Vacio titulo="Nada por aquí">{config.vacio}</Vacio>
        ) : (
          <div className="lista-candidatos">
            {lista.map((p) => (
              <TarjetaCandidato
                key={p.id}
                prospecto={p}
                dias={p.dias}
                onAbrir={setFichaId}
                acciones={acciones.filter((a) => (a.solo ? a.solo(p) : true))}
              />
            ))}
          </div>
        )}
      </Tarjeta>

      {fichaId && <FichaCandidato id={fichaId} onCerrar={() => setFichaId(null)} />}
    </>
  )
}
