import { useMemo, useState } from 'react'
import { useCRM } from '../../store/CRMContext'
import { SEDES, COHORTES, ETAPAS } from '../../domain/etapas'
import { formatearFecha, hoyISO, sumarDias } from '../../domain/fechas'
import { reporteDiario, estadisticasEmbudo } from '../../domain/metricas'
import { porcentaje } from '../../domain/formato'
import { EncabezadoPagina, Tarjeta, Kpi, Boton, Campo, Insignia, Revelar } from '../../components/ui/Basicos'
import { IndiceSecciones } from '../../components/ui/IndiceSecciones'
import { Icono } from '../../components/ui/iconos'

export function Calendario({ vista }) {
  switch (vista) {
    case 'campus':
      return <CampusDays />
    case 'cohortes':
      return <Cohortes />
    case 'landing':
      return <FechasLanding />
    case 'reporte':
      return <ReporteDiario />
    case 'como':
      return <ComoFunciona />
    default:
      return null
  }
}

function CampusDays() {
  const { estado, acciones } = useCRM()
  const [nuevo, setNuevo] = useState({ sede: SEDES[0], fecha: hoyISO(), agendados: 0, asistieron: 0 })
  const meta = ETAPAS.find((e) => e.id === 'asiste').meta

  const enviar = (e) => {
    e.preventDefault()
    acciones.agregarCampusDay({ ...nuevo, agendados: Number(nuevo.agendados), asistieron: Number(nuevo.asistieron) })
  }

  return (
    <>
      <EncabezadoPagina
        titulo="Campus days"
        descripcion={`Asistencia frente a la meta de ${meta} % de los agendados.`}
      />
      <Tarjeta titulo="Programar un Campus Day">
        <form onSubmit={enviar} className="barra-filtros" style={{ border: 0, padding: 0, margin: 0 }}>
          <Campo etiqueta="Sede" id="cd-sede">
            <select id="cd-sede" value={nuevo.sede} onChange={(e) => setNuevo({ ...nuevo, sede: e.target.value })}>
              {SEDES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Campo>
          <Campo etiqueta="Fecha" id="cd-fecha">
            <input id="cd-fecha" type="date" required value={nuevo.fecha} onChange={(e) => setNuevo({ ...nuevo, fecha: e.target.value })} />
          </Campo>
          <Campo etiqueta="Agendados" id="cd-agendados">
            <input id="cd-agendados" type="number" min="0" value={nuevo.agendados} onChange={(e) => setNuevo({ ...nuevo, agendados: e.target.value })} />
          </Campo>
          <Campo etiqueta="Asistieron" id="cd-asistieron">
            <input id="cd-asistieron" type="number" min="0" value={nuevo.asistieron} onChange={(e) => setNuevo({ ...nuevo, asistieron: e.target.value })} />
          </Campo>
          <div style={{ display: 'flex', alignItems: 'end' }}>
            <Boton type="submit" icono="Plus">Agregar</Boton>
          </div>
        </form>
      </Tarjeta>

      <div style={{ marginTop: 16 }} className="tabla-contenedor">
        <table className="tabla">
          <thead>
            <tr>
              <th>Sede</th>
              <th>Fecha</th>
              <th className="tabla__numero">Agendados</th>
              <th className="tabla__numero">Asistieron</th>
              <th className="tabla__numero">Asistencia</th>
            </tr>
          </thead>
          <tbody>
            {estado.campusDays.map((c) => {
              const pct = c.agendados ? (c.asistieron / c.agendados) * 100 : 0
              return (
                <tr key={c.id}>
                  <td>{c.sede}</td>
                  <td>{formatearFecha(c.fecha)}</td>
                  <td className="tabla__numero">{c.agendados}</td>
                  <td className="tabla__numero">{c.asistieron}</td>
                  <td className="tabla__numero">
                    {c.agendados ? (
                      <Insignia variante={pct >= meta ? 'exito' : 'alerta'}>{porcentaje(pct)}</Insignia>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

function Cohortes() {
  const { estado } = useCRM()
  return (
    <>
      <EncabezadoPagina titulo="Cohortes y calendario" descripcion="Fechas de inicio y cierre de cada generación." />
      <section className="rejilla">
        {estado.cohortes.map((c, i) => (
          <Revelar key={c.id}>
            <Tarjeta titulo={c.id} subtitulo={c.estado}>
              <p style={{ margin: 0 }}>
                <Icono nombre="CalendarDays" size={16} /> Inicio: <strong>{formatearFecha(c.inicio)}</strong>
              </p>
              <p style={{ margin: '6px 0 0' }}>
                <Icono nombre="Flame" size={16} /> Cierre: <strong>{formatearFecha(c.fin)}</strong>
              </p>
              <p className="texto-pequeno texto-suave" style={{ marginTop: 10 }}>
                {i === 0 ? 'Cohorte que recibe las admisiones de este periodo.' : 'Siguiente generación en planificación.'}
              </p>
            </Tarjeta>
          </Revelar>
        ))}
      </section>
      <p className="texto-pequeno texto-suave" style={{ marginTop: 14 }}>
        Cohortes disponibles en los filtros: {COHORTES.join(', ')}.
      </p>
    </>
  )
}

function FechasLanding() {
  const { estado, acciones } = useCRM()
  const [texto, setTexto] = useState('')
  const [fecha, setFecha] = useState(hoyISO())

  const enviar = (e) => {
    e.preventDefault()
    if (!texto.trim()) return
    acciones.agregarFechaLanding({ texto: texto.trim(), fecha, visible: true })
    setTexto('')
  }

  return (
    <>
      <EncabezadoPagina
        titulo="Fechas del landing"
        descripcion="Lo que muestra la página pública. Oculta una fecha sin borrarla."
      />
      <Tarjeta titulo="Agregar fecha">
        <form onSubmit={enviar} className="barra-filtros" style={{ border: 0, padding: 0, margin: 0 }}>
          <Campo etiqueta="Texto visible" id="fl-texto">
            <input id="fl-texto" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Campus Day · Puntarenas" />
          </Campo>
          <Campo etiqueta="Fecha" id="fl-fecha">
            <input id="fl-fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </Campo>
          <div style={{ display: 'flex', alignItems: 'end' }}>
            <Boton type="submit" icono="Plus">Agregar al landing</Boton>
          </div>
        </form>
      </Tarjeta>

      <ul className="lista-candidatos" style={{ marginTop: 16, listStyle: 'none', padding: 0 }}>
        {estado.fechasLanding.map((f) => (
          <li key={f.id}>
            <Revelar>
              <div className="fila-candidato" style={{ opacity: f.visible ? 1 : 0.6 }}>
                <div className="fila-candidato__cabecera">
                  <strong>{f.texto}</strong>
                  <Insignia variante={f.visible ? 'exito' : ''}>{f.visible ? 'Visible' : 'Oculta'}</Insignia>
                </div>
                <p className="fila-candidato__meta">{formatearFecha(f.fecha)}</p>
                <div className="fila-candidato__acciones">
                  <Boton variante="secundario" pequeno icono="Eye" onClick={() => acciones.alternarFechaLanding(f.id)}>
                    {f.visible ? 'Ocultar del landing' : 'Mostrar en el landing'}
                  </Boton>
                </div>
              </div>
            </Revelar>
          </li>
        ))}
      </ul>
    </>
  )
}

function ReporteDiario() {
  const { estado, hoy } = useCRM()
  const [fecha, setFecha] = useState(hoy)
  const reporte = useMemo(() => reporteDiario(estado.prospectos, fecha), [estado.prospectos, fecha])
  const ultimos = useMemo(
    () => Array.from({ length: 7 }, (_, i) => reporteDiario(estado.prospectos, sumarDias(hoy, -i))),
    [estado.prospectos, hoy],
  )
  const etapas = useMemo(() => estadisticasEmbudo(estado.prospectos), [estado.prospectos])

  const descargarCsv = () => {
    const cabecera = ['fecha', 'entraron', 'avances', 'excluidos', 'en_espera']
    const filas = ultimos
      .slice()
      .reverse()
      .map((r) => [r.fecha, r.entraron, r.avances, r.excluidos, r.enEspera].join(','))
    const contenido = [cabecera.join(','), ...filas].join('\n')
    try {
      const url = URL.createObjectURL(new Blob([contenido], { type: 'text/csv;charset=utf-8' }))
      const enlace = document.createElement('a')
      enlace.href = url
      enlace.download = `reporte-diario-${hoy}.csv`
      enlace.click()
      URL.revokeObjectURL(url)
    } catch {
      // Si el navegador no permite descargas, no hay nada más que hacer.
    }
  }

  return (
    <>
      <EncabezadoPagina
        titulo="Reporte diario"
        descripcion="Lo que entró, avanzó y se perdió en un día. Solo cifras agregadas."
        acciones={
          <Boton variante="secundario" icono="Download" onClick={descargarCsv}>
            Descargar CSV (7 días)
          </Boton>
        }
      />

      <div className="barra-filtros" style={{ margin: '0 0 16px' }}>
        <Campo etiqueta="Fecha del reporte" id="rep-fecha">
          <input id="rep-fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </Campo>
      </div>

      <section className="rejilla">
        <Kpi etiqueta="Entraron" valor={reporte.entraron} detalle={formatearFecha(fecha)} />
        <Kpi etiqueta="Avances de etapa" valor={reporte.avances} detalle="Movimientos registrados" />
        <Kpi etiqueta="Excluidos" valor={reporte.excluidos} detalle="Pasaron a Excluidos ese día" variante={reporte.excluidos ? 'peligro' : ''} />
        <Kpi etiqueta="En lista de espera" valor={reporte.enEspera} detalle="Total actual" />
      </section>

      <div style={{ marginTop: 16 }} className="tabla-contenedor">
        <table className="tabla">
          <thead>
            <tr>
              <th>Día</th>
              <th className="tabla__numero">Entraron</th>
              <th className="tabla__numero">Avances</th>
              <th className="tabla__numero">Excluidos</th>
            </tr>
          </thead>
          <tbody>
            {ultimos.map((r) => (
              <tr key={r.fecha}>
                <td>{formatearFecha(r.fecha)}</td>
                <td className="tabla__numero">{r.entraron}</td>
                <td className="tabla__numero">{r.avances}</td>
                <td className="tabla__numero">{r.excluidos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Tarjeta titulo="Embudo al día de hoy" subtitulo="Cifras acumuladas del embudo completo.">
        <p className="texto-suave texto-pequeno" style={{ margin: 0 }}>
          Llegaron {etapas[0].llegaron} prospectos; {etapas[8].llegaron} son estudiantes.
        </p>
      </Tarjeta>
    </>
  )
}

const SECCIONES_COMO = [
  { id: 'problema', texto: 'El problema' },
  { id: 'embudo', texto: 'El embudo' },
  { id: 'gestion', texto: 'Gestión de candidatos' },
  { id: 'mercadeo', texto: 'Mercadeo y Fordy' },
  { id: 'reglas', texto: 'Reglas de diseño' },
]

function ComoFunciona() {
  return (
    <>
      <EncabezadoPagina
        titulo="¿Cómo funciona?"
        descripcion="Guía rápida del CRM, basada en el taller de admisiones y mercadeo de FWD."
      />
      <div className="esquema">
        <IndiceSecciones secciones={SECCIONES_COMO} />
        <div>
          <section id="problema" className="esquema__seccion">
            <Tarjeta titulo="El problema">
              <p>No se medía la conversión por etapa ni el costo por admitido. Las decisiones se tomaban por intuición.</p>
              <p>
                Este sistema responde tres preguntas: <strong>¿cuánta gente entra?</strong>,{' '}
                <strong>¿dónde se cae?</strong> y <strong>¿de dónde vienen?</strong>
              </p>
            </Tarjeta>
          </section>
          <section id="embudo" className="esquema__seccion">
            <Tarjeta titulo="El embudo: 9 etapas">
              <ol style={{ margin: 0, paddingLeft: 20 }}>
                {ETAPAS.map((e) => (
                  <li key={e.id}>
                    {e.nombre} · meta {e.meta} %{e.fuga ? ' · FUGA' : ''}
                  </li>
                ))}
              </ol>
              <p className="texto-pequeno texto-suave" style={{ marginTop: 10 }}>
                Cada etapa tiene meta de conversión, días promedio y fuga frente a la meta.
              </p>
            </Tarjeta>
          </section>
          <section id="gestion" className="esquema__seccion">
            <Tarjeta titulo="Gestión de candidatos">
              <ul>
                <li>Una ficha por candidato, con su etapa e historial.</li>
                <li>Kanban: mover la tarjeta cambia la etapa y registra la fecha.</li>
                <li>«Qué atender hoy»: lista priorizada de seguimientos.</li>
                <li>Vistas aparte para entrevistas, resultados, lista de espera y excluidos.</li>
              </ul>
            </Tarjeta>
          </section>
          <section id="mercadeo" className="esquema__seccion">
            <Tarjeta titulo="Mercadeo y Fordy">
              <p>
                Las piezas las propone la IA, pero una persona las aprueba antes de publicarse. El comportamiento de
                Fordy se edita en «Cerebro de Fordy»; no está escondido en el código.
              </p>
            </Tarjeta>
          </section>
          <section id="reglas" className="esquema__seccion">
            <Tarjeta titulo="Reglas de diseño">
              <ul>
                <li><strong>Control del proceso:</strong> el flujo de contenido y el de admisiones viven en la plataforma.</li>
                <li><strong>Humano en el circuito:</strong> la IA propone y una persona aprueba.</li>
                <li><strong>Instrucciones visibles:</strong> el comportamiento se edita, no se entierra en el código.</li>
                <li><strong>Datos personales con cuidado:</strong> no se muestran nombres ni contactos.</li>
              </ul>
            </Tarjeta>
          </section>
        </div>
      </div>
    </>
  )
}
