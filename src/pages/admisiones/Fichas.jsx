import { useMemo, useState } from 'react'
import { useCRM } from '../../store/CRMContext'
import { ETAPAS, ESTADOS } from '../../domain/etapas'
import { filtrarProspectos, diasSinAvance } from '../../domain/metricas'
import { EncabezadoPagina, Vacio } from '../../components/ui/Basicos'
import { BarraFiltros } from '../../components/ui/BarraFiltros'
import { Icono } from '../../components/ui/iconos'
import { TarjetaCandidato } from '../../components/candidatos/TarjetaCandidato'
import { FichaCandidato } from '../../components/candidatos/FichaCandidato'
import { useCargaAlDesplazar } from '../../hooks/useScroll'

const FILTROS_INICIALES = { sede: 'todas', cohorte: 'todas', desde: '' }
const PASO = 24

export function Fichas() {
  const { estado, acciones, hoy } = useCRM()
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)
  const [busqueda, setBusqueda] = useState('')
  const [etapa, setEtapa] = useState('todas')
  const [estadoGestion, setEstadoGestion] = useState('todos')
  const [fichaId, setFichaId] = useState(null)

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toUpperCase()
    return filtrarProspectos(estado.prospectos, filtros)
      .filter((p) => (etapa === 'todas' ? true : p.etapa === etapa))
      .filter((p) => (estadoGestion === 'todos' ? true : p.estado === estadoGestion))
      .filter((p) => (texto ? p.codigo.toUpperCase().includes(texto) : true))
      .map((p) => ({ ...p, dias: diasSinAvance(p, hoy) }))
      .sort((a, b) => b.fechaIngreso.localeCompare(a.fechaIngreso))
  }, [estado.prospectos, filtros, busqueda, etapa, estadoGestion, hoy])

  const visibles = useCargaAlDesplazar(filtrados.length, PASO)
  const mostrados = filtrados.slice(0, visibles)

  return (
    <>
      <EncabezadoPagina
        titulo="Fichas de candidatos"
        descripcion="Una ficha por candidato, con su etapa e historial. Solo se muestra el código."
      />

      <BarraFiltros
        filtros={filtros}
        onCambiar={setFiltros}
        extra={
          <>
            <label className="campo">
              <span className="campo__etiqueta">Buscar por código</span>
              <input
                type="search"
                placeholder="CND-0001"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </label>
            <label className="campo">
              <span className="campo__etiqueta">Etapa</span>
              <select value={etapa} onChange={(e) => setEtapa(e.target.value)}>
                <option value="todas">Todas</option>
                {ETAPAS.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.orden}. {e.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="campo">
              <span className="campo__etiqueta">Estado</span>
              <select value={estadoGestion} onChange={(e) => setEstadoGestion(e.target.value)}>
                <option value="todos">Todos</option>
                {Object.entries(ESTADOS).map(([valor, texto]) => (
                  <option key={valor} value={valor}>
                    {texto}
                  </option>
                ))}
              </select>
            </label>
          </>
        }
      />

      <p className="texto-suave texto-pequeno" aria-live="polite">
        <Icono nombre="Search" size={14} /> {filtrados.length} candidatos con estos filtros · mostrando {mostrados.length}
      </p>

      {filtrados.length === 0 ? (
        <Vacio titulo="Sin resultados">Prueba con otra sede, etapa o código.</Vacio>
      ) : (
        <div className="lista-candidatos">
          {mostrados.map((p) => (
            <TarjetaCandidato
              key={p.id}
              prospecto={p}
              dias={p.dias}
              onAbrir={setFichaId}
              acciones={
                p.revisado ? [] : [{ texto: 'Revisar', icono: 'Check', variante: 'exito', onClick: acciones.revisar }]
              }
            />
          ))}
        </div>
      )}

      {mostrados.length < filtrados.length && (
        <p className="texto-pequeno texto-suave" style={{ textAlign: 'center', marginTop: 16 }}>
          Cargando más al bajar…
        </p>
      )}

      {fichaId && <FichaCandidato id={fichaId} onCerrar={() => setFichaId(null)} />}
    </>
  )
}
