import { useMemo, useState } from 'react'
import { useCRM } from '../../store/CRMContext'
import { filtrarProspectos, estadisticasEmbudo, resumenEmbudo, porcentajeRedes, listaAtencion } from '../../domain/metricas'
import { porcentaje, dias } from '../../domain/formato'
import { Embudo } from '../../components/funnel/Embudo'
import { BarraFiltros } from '../../components/ui/BarraFiltros'
import { EncabezadoPagina, Kpi, Tarjeta, Revelar, Vacio } from '../../components/ui/Basicos'
import { IndiceSecciones } from '../../components/ui/IndiceSecciones'
import { TarjetaCandidato } from '../../components/candidatos/TarjetaCandidato'
import { FichaCandidato } from '../../components/candidatos/FichaCandidato'
import { useCargaAlDesplazar } from '../../hooks/useScroll'
import { DIAS_SIN_AVANCE_ALERTA } from '../../domain/etapas'

const FILTROS_INICIALES = { sede: 'todas', cohorte: 'todas', desde: '' }
const SECCIONES = [
  { id: 'resumen', texto: 'Resumen' },
  { id: 'embudo', texto: 'Embudo' },
  { id: 'etapas', texto: 'Etapas' },
  { id: 'atender', texto: 'Qué atender hoy' },
]

export function PanelAdmisiones() {
  const { estado, acciones, hoy } = useCRM()
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)
  const [fichaId, setFichaId] = useState(null)

  const prospectos = useMemo(() => filtrarProspectos(estado.prospectos, filtros), [estado.prospectos, filtros])
  const stats = useMemo(() => estadisticasEmbudo(prospectos), [prospectos])
  const resumen = useMemo(() => resumenEmbudo(stats), [stats])
  const atencion = useMemo(() => listaAtencion(prospectos, { hoy }), [prospectos, hoy])
  const visibles = useCargaAlDesplazar(atencion.length, 12)
  const redes = porcentajeRedes(prospectos)
  const enFuga = stats.filter((s) => s.enFuga)

  return (
    <>
      <EncabezadoPagina
        titulo="Panel de admisiones"
        descripcion="El embudo en vivo: etapas con meta, días promedio y fuga. Cifras ficticias de la demo."
      />

      <BarraFiltros filtros={filtros} onCambiar={setFiltros} />

      <section className="rejilla" aria-label="Indicadores clave">
        <Kpi etiqueta="Entraron al embudo" valor={resumen.total} detalle="Prospectos en el periodo" />
        <Kpi
          etiqueta="Agendaron Campus Day"
          valor={resumen.agendaron}
          detalle={`${estado.campusDays.length} Campus Day programados`}
        />
        <Kpi
          etiqueta="Asistieron"
          valor={resumen.asistieron}
          detalle={`${porcentaje(resumen.conversionCampus)} de conversión, meta ${resumen.metaCampus} %`}
          variante={resumen.conversionCampus < resumen.metaCampus ? 'alerta' : 'exito'}
        />
        <Kpi etiqueta="Llegan por redes" valor={porcentaje(redes)} detalle="Canal principal de prospectos" />
        <Kpi
          etiqueta="Qué atender hoy"
          valor={atencion.length}
          detalle={`${atencion.filter((p) => !p.revisado).length} nuevos sin revisar`}
          variante={atencion.length > 0 ? 'alerta' : 'exito'}
        />
      </section>

      <div className="esquema" style={{ marginTop: 18 }}>
        <IndiceSecciones secciones={SECCIONES} />

        <div>
          <section id="resumen" className="esquema__seccion">
            <Revelar>
              <Tarjeta
                titulo="Dónde se cae el proceso"
                subtitulo={
                  enFuga.length
                    ? `Etapas por debajo de su meta: ${enFuga.map((e) => e.nombre).join(', ')}.`
                    : 'Todas las etapas cumplen su meta.'
                }
              >
                <p className="texto-suave" style={{ margin: 0 }}>
                  Cada etapa muestra cuántos llegaron, la conversión desde la etapa anterior y la fuga frente a la
                  meta. Las etapas marcadas como FUGA son donde se pierde más gente.
                </p>
              </Tarjeta>
            </Revelar>
          </section>

          <section id="embudo" className="esquema__seccion">
            <Revelar>
              <Tarjeta
                titulo="Embudo de 9 etapas"
                subtitulo="Barra = conversión desde la etapa anterior. Línea negra = meta. Rojo = debajo de la meta."
              >
                <Embudo estadisticas={stats} />
              </Tarjeta>
            </Revelar>
          </section>

          <section id="etapas" className="esquema__seccion">
            <Revelar>
              <Tarjeta titulo="Números por etapa" subtitulo="Desliza la tabla horizontalmente en el móvil.">
                <div className="tabla-contenedor">
                  <table className="tabla">
                    <thead>
                      <tr>
                        <th scope="col">Etapa</th>
                        <th scope="col" className="tabla__numero">Llegaron</th>
                        <th scope="col" className="tabla__numero">Ahora</th>
                        <th scope="col" className="tabla__numero">Conversión</th>
                        <th scope="col" className="tabla__numero">Meta</th>
                        <th scope="col" className="tabla__numero">Fuga</th>
                        <th scope="col" className="tabla__numero">Días prom.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.map((s) => (
                        <tr key={s.id} className={s.enFuga ? 'en-fuga' : ''}>
                          <td>
                            {s.orden}. {s.nombre}
                            {s.fuga && <span className="badge-fuga">FUGA</span>}
                          </td>
                          <td className="tabla__numero">{s.llegaron}</td>
                          <td className="tabla__numero">{s.actuales}</td>
                          <td className="tabla__numero">{s.orden > 1 ? porcentaje(s.conversion) : '—'}</td>
                          <td className="tabla__numero">{s.meta} %</td>
                          <td className="tabla__numero">{s.orden > 1 ? s.fuga : '—'}</td>
                          <td className="tabla__numero">{dias(s.diasPromedio)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Tarjeta>
            </Revelar>
          </section>

          <section id="atender" className="esquema__seccion">
            <Revelar>
              <Tarjeta
                titulo="Qué atender hoy"
                subtitulo={`Activos sin avance de ${DIAS_SIN_AVANCE_ALERTA} días o sin revisar. Los nuevos aparecen primero. Se cargan más al bajar.`}
              >
                {atencion.length === 0 ? (
                  <Vacio titulo="Nada pendiente">Todos los candidatos activos tienen avance reciente.</Vacio>
                ) : (
                  <div className="lista-candidatos">
                    {atencion.slice(0, visibles).map((p) => (
                      <TarjetaCandidato
                        key={p.id}
                        prospecto={p}
                        dias={p.dias}
                        onAbrir={setFichaId}
                        acciones={
                          p.revisado
                            ? []
                            : [{ texto: 'Revisar', icono: 'Check', variante: 'exito', onClick: acciones.revisar }]
                        }
                      />
                    ))}
                  </div>
                )}
                {visibles < atencion.length && (
                  <p className="texto-pequeno texto-suave" style={{ textAlign: 'center', marginTop: 12 }}>
                    Mostrando {visibles} de {atencion.length}. Sigue bajando para cargar más.
                  </p>
                )}
              </Tarjeta>
            </Revelar>
          </section>
        </div>
      </div>

      {fichaId && <FichaCandidato id={fichaId} onCerrar={() => setFichaId(null)} />}
    </>
  )
}
