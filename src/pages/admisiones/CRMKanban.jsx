import { useMemo, useState } from 'react'
import { useCRM } from '../../store/CRMContext'
import { ETAPAS, CANALES, SEDES, COHORTES, DIAS_SIN_AVANCE_ALERTA } from '../../domain/etapas'
import { filtrarProspectos, diasSinAvance } from '../../domain/metricas'
import { sumarDias } from '../../domain/fechas'
import { EncabezadoPagina, Kpi, Boton, Campo, Insignia } from '../../components/ui/Basicos'
import { BarraFiltros } from '../../components/ui/BarraFiltros'
import { DialogoMover } from '../../components/candidatos/DialogoMover'
import { Icono } from '../../components/ui/iconos'

const FILTROS_INICIALES = { sede: 'todas', cohorte: 'todas', desde: '' }
const FORMULARIO_INICIAL = { sede: SEDES[0], canal: CANALES[0], cohorte: COHORTES[0] }

export function CRMKanban() {
  const { estado, acciones, hoy } = useCRM()
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)
  const [mover, setMover] = useState(null) // { prospecto, destino? }
  const [sobre, setSobre] = useState(null) // etapa bajo el cursor al arrastrar
  const [formularioAbierto, setFormularioAbierto] = useState(false)
  const [nuevo, setNuevo] = useState(FORMULARIO_INICIAL)

  const activos = useMemo(
    () =>
      filtrarProspectos(estado.prospectos, filtros)
        .filter((p) => p.estado === 'activo')
        .map((p) => ({ ...p, dias: diasSinAvance(p, hoy) })),
    [estado.prospectos, filtros, hoy],
  )

  const porEtapa = useMemo(() => {
    const mapa = Object.fromEntries(ETAPAS.map((e) => [e.id, []]))
    activos.forEach((p) => mapa[p.etapa].push(p))
    Object.values(mapa).forEach((lista) =>
      lista.sort((a, b) => Number(a.revisado) - Number(b.revisado) || b.dias - a.dias),
    )
    return mapa
  }, [activos])

  const hace7 = sumarDias(hoy, -7)
  const entraronSemana = activos.filter((p) => p.fechaIngreso >= hace7).length
  const sinAtender = activos.filter((p) => !p.revisado).length

  const alSoltar = (etapaId, evento) => {
    evento.preventDefault()
    setSobre(null)
    const id = evento.dataTransfer.getData('text/plain')
    const prospecto = activos.find((p) => p.id === id)
    if (prospecto && prospecto.etapa !== etapaId) setMover({ prospecto, destino: etapaId })
  }

  const enviarFormulario = (evento) => {
    evento.preventDefault()
    acciones.agregarProspecto(nuevo)
    setNuevo(FORMULARIO_INICIAL)
    setFormularioAbierto(false)
  }

  return (
    <>
      <EncabezadoPagina
        titulo="CRM (kanban)"
        descripcion="Cada candidato en su etapa. Arrastra una tarjeta o usa «Mover a…» para cambiar de etapa: antes te muestra qué va a pasar."
        acciones={
          <Boton variante="morado" icono="Plus" onClick={() => setFormularioAbierto((v) => !v)}>
            Entraron por día
          </Boton>
        }
      />

      {formularioAbierto && (
        <form className="tarjeta" onSubmit={enviarFormulario} style={{ marginBottom: 16 }} aria-label="Registrar entrada">
          <div className="barra-filtros" style={{ marginBottom: 12, border: 0, padding: 0 }}>
            <Campo etiqueta="Sede" id="nuevo-sede">
              <select id="nuevo-sede" value={nuevo.sede} onChange={(e) => setNuevo({ ...nuevo, sede: e.target.value })}>
                {SEDES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Campo>
            <Campo etiqueta="Canal" id="nuevo-canal">
              <select id="nuevo-canal" value={nuevo.canal} onChange={(e) => setNuevo({ ...nuevo, canal: e.target.value })}>
                {CANALES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Campo>
            <Campo etiqueta="Cohorte" id="nuevo-cohorte">
              <select id="nuevo-cohorte" value={nuevo.cohorte} onChange={(e) => setNuevo({ ...nuevo, cohorte: e.target.value })}>
                {COHORTES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Campo>
          </div>
          <p className="texto-pequeno texto-suave">
            La entrada se crea en «Prospecto» con la fecha de hoy y aparece en azul hasta que alguien la revise.
          </p>
          <div className="acciones">
            <Boton type="submit" variante="exito" icono="Check">
              Registrar entrada
            </Boton>
          </div>
        </form>
      )}

      <section className="rejilla" aria-label="Resumen del tablero">
        <Kpi etiqueta="Entraron en 7 días" valor={entraronSemana} detalle={`${sinAtender} sin atender`} variante={sinAtender ? 'alerta' : 'exito'} />
        <Kpi etiqueta="Activos en el tablero" valor={activos.length} detalle="Sin excluidos ni lista de espera" />
      </section>

      <div style={{ margin: '16px 0' }}>
        <BarraFiltros filtros={filtros} onCambiar={setFiltros} conFecha />
      </div>

      <p className="texto-pequeno texto-suave" style={{ marginBottom: 8 }}>
        <Icono nombre="Pencil" size={14} /> Arrastra tarjetas entre columnas. Las azules aún no se han revisado.
        Desliza el tablero horizontalmente.
      </p>

      <div className="kanban" role="list" aria-label="Tablero de etapas">
        {ETAPAS.map((etapa) => {
          const lista = porEtapa[etapa.id]
          return (
            <section
              key={etapa.id}
              role="listitem"
              className={`kanban__columna ${sobre === etapa.id ? 'kanban__columna--sobre' : ''}`}
              style={{ '--color-etapa': etapa.color }}
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
                if (sobre !== etapa.id) setSobre(etapa.id)
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setSobre(null)
              }}
              onDrop={(e) => alSoltar(etapa.id, e)}
              aria-label={`${etapa.nombre}, ${lista.length} candidatos`}
            >
              <header className="kanban__cabecera">
                <h3 className="kanban__titulo">
                  <span>
                    {etapa.orden}. {etapa.nombre}
                  </span>
                  <Insignia>{lista.length}</Insignia>
                </h3>
                <p className="kanban__meta">
                  Meta {etapa.meta} %{etapa.fuga ? ' · etapa de fuga' : ''}
                </p>
              </header>
              <div className="kanban__lista">
                {lista.length === 0 && <p className="texto-pequeno texto-suave">Sin candidatos aquí.</p>}
                {lista.map((p) => {
                  const nuevoSinRevisar = !p.revisado
                  return (
                    <article
                      key={p.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', p.id)
                        e.dataTransfer.effectAllowed = 'move'
                      }}
                      className={`tarjeta-candidato ${nuevoSinRevisar ? 'tarjeta-candidato--nuevo' : ''}`}
                      aria-label={`${p.codigo}, ${p.sede}, ${p.canal}`}
                    >
                      <p className="tarjeta-candidato__codigo">
                        {p.codigo}
                        {nuevoSinRevisar && (
                          <span style={{ marginLeft: 6 }}>
                            <Insignia variante="nuevo">Nuevo</Insignia>
                          </span>
                        )}
                      </p>
                      <p className="tarjeta-candidato__detalle">
                        {p.sede} · {p.canal}
                        <br />
                        <span style={p.dias >= DIAS_SIN_AVANCE_ALERTA ? { color: 'var(--color-alerta)', fontWeight: 700 } : undefined}>
                          {p.dias} {p.dias === 1 ? 'día' : 'días'} sin avance
                        </span>
                      </p>
                      <div className="tarjeta-candidato__acciones">
                        {nuevoSinRevisar && (
                          <Boton pequeno variante="exito" icono="Check" onClick={() => acciones.revisar(p.id)}>
                            Revisar
                          </Boton>
                        )}
                        <Boton pequeno variante="secundario" icono="ArrowRight" onClick={() => setMover({ prospecto: p })}>
                          Mover a…
                        </Boton>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      {mover && (
        <DialogoMover
          key={`${mover.prospecto.id}-${mover.destino ?? 'auto'}`}
          prospecto={mover.prospecto}
          destinoInicial={mover.destino}
          onCerrar={() => setMover(null)}
        />
      )}
    </>
  )
}
