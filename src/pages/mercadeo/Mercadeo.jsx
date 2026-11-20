import { useState } from 'react'
import { useCRM } from '../../store/CRMContext'
import { crearId } from '../../store/crmReducer'
import { INSTRUCCIONES_FORDY_INICIALES, PRESUPUESTO_DISPONIBLE } from '../../domain/datosFicticios'
import { construirPrompt, datosDeCampana, VARIABLES_DISPONIBLES, OBJETIVO_POR_DEFECTO } from '../../domain/plantillas'
import { moneda, porcentaje } from '../../domain/formato'
import { generarPiezas, IA_CONFIGURADA } from '../../services/fordy'
import { EncabezadoPagina, Tarjeta, Kpi, Boton, Campo, Insignia, Revelar, Vacio } from '../../components/ui/Basicos'
import { Icono } from '../../components/ui/iconos'

const ESTADO_PENDIENTE = 'Pendiente de aprobación'
const ESTADO_APROBADA = 'Aprobada'
const ESTADO_RECHAZADA = 'Rechazada'

export function Mercadeo({ vista }) {
  switch (vista) {
    case 'organica':
      return <PublicacionOrganica />
    case 'crear':
      return <CrearCampana />
    case 'estado':
      return <EstadoCampanas />
    case 'cerebro':
      return <CerebroFordy />
    default:
      return null
  }
}

// Aviso común cuando la IA no está conectada.
function AvisoIA({ error }) {
  if (error) {
    return (
      <div className="consecuencias" role="alert" style={{ background: 'var(--color-peligro-suave)' }}>
        <strong>No se pudieron generar las piezas.</strong>
        <p style={{ margin: '6px 0 0' }}>{error}</p>
      </div>
    )
  }
  if (!IA_CONFIGURADA) {
    return (
      <p className="nota-privacidad">
        <Icono nombre="Lock" size={16} />
        <span>
          El servicio de IA no está conectado en este entorno. Las piezas se generan cuando se configura
          VITE_API_BASE_URL. Ninguna clave de API se guarda en el navegador.
        </span>
      </p>
    )
  }
  return null
}

function Pieza({ pieza, onAprobar, onRechazar }) {
  return (
    <article className="pieza">
      {pieza.imagenUrl ? (
        <img src={pieza.imagenUrl} alt="Pieza generada" style={{ width: '100%', borderRadius: 8 }} />
      ) : (
        <div className="imagen-pieza">{pieza.texto.slice(0, 80)}</div>
      )}
      <p>{pieza.texto}</p>
      <div className="acciones" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Insignia variante={pieza.estado === ESTADO_APROBADA ? 'exito' : pieza.estado === ESTADO_RECHAZADA ? 'peligro' : 'alerta'}>
          {pieza.estado}
        </Insignia>
        {pieza.estado === ESTADO_PENDIENTE && onAprobar && (
          <div className="acciones">
            <Boton pequeno variante="exito" icono="Check" onClick={onAprobar}>Aprobar</Boton>
            <Boton pequeno variante="secundario" onClick={onRechazar}>Rechazar</Boton>
          </div>
        )}
      </div>
    </article>
  )
}

// ---------- Publicación orgánica (Fordy Creativo) ----------

const PARAMETROS_INICIALES = {
  entidad: 'FWD',
  tematica: '',
  estilo: 'Fotografía',
  iluminacion: 'Natural',
  angulo: 'Frontal',
  atmosfera: '',
  formato: '1:1',
  variaciones: 2,
  directiva: '',
  negativo: '',
}

function PublicacionOrganica() {
  const { estado } = useCRM()
  const [parametros, setParametros] = useState(PARAMETROS_INICIALES)
  const [referencia, setReferencia] = useState(null)
  const [piezas, setPiezas] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const cambiar = (campo) => (e) => setParametros({ ...parametros, [campo]: e.target.value })

  const generar = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)
    const parametrosTexto = Object.entries(parametros)
      .filter(([, v]) => v !== '')
      .map(([k, v]) => `- ${k}: ${v}`)
      .join('\n')
    const prompt = `${construirPrompt(estado.instruccionesFordy, {
      nombre: parametros.tematica || 'Publicación orgánica',
      presupuesto: 'Sin presupuesto asignado',
      objetivo_negocio: 'Publicación orgánica en redes sociales',
    })}\n\n## Parámetros de la pieza\n${parametrosTexto}\nPaleta: "Colores FWD" (azul y morado).`

    try {
      const nuevas = await generarPiezas({
        prompt,
        cantidad: Number(parametros.variaciones),
        formato: parametros.formato,
        extra: { paleta: ['#1e3a8a', '#7c3aed'], negativo: parametros.negativo, referencia: referencia?.name ?? null },
      })
      setPiezas((lista) => [
        ...nuevas.map((p) => ({ id: crearId('org'), texto: p.texto ?? '', imagenUrl: p.imagenUrl, estado: ESTADO_PENDIENTE })),
        ...lista,
      ])
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  const cambiarEstado = (id, nuevo) =>
    setPiezas((lista) => lista.map((p) => (p.id === id ? { ...p, estado: nuevo } : p)))

  return (
    <>
      <EncabezadoPagina
        titulo="Publicación orgánica"
        descripcion="Imágenes para Facebook con IA. Elegís los parámetros, la IA propone y una persona aprueba antes de publicar."
      />

      <div className="rejilla--dos">
        <Tarjeta titulo="Parámetros">
          <form onSubmit={generar} className="stack" aria-label="Parámetros de la publicación">
            <div className="rejilla">
              <Campo etiqueta="Entidad" id="org-entidad">
                <input id="org-entidad" value={parametros.entidad} onChange={cambiar('entidad')} />
              </Campo>
              <Campo etiqueta="Temática" id="org-tematica">
                <input id="org-tematica" value={parametros.tematica} onChange={cambiar('tematica')} placeholder="Campus Day de Desamparados" />
              </Campo>
              <Campo etiqueta="Estilo de arte" id="org-estilo">
                <select id="org-estilo" value={parametros.estilo} onChange={cambiar('estilo')}>
                  {['Fotografía', 'Ilustración', 'Minimalista', 'Collage'].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Campo>
              <Campo etiqueta="Iluminación" id="org-luz">
                <select id="org-luz" value={parametros.iluminacion} onChange={cambiar('iluminacion')}>
                  {['Natural', 'Estudio', 'Dramática', 'Neón'].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Campo>
              <Campo etiqueta="Ángulo" id="org-angulo">
                <select id="org-angulo" value={parametros.angulo} onChange={cambiar('angulo')}>
                  {['Frontal', 'Picado', 'Contrapicado', 'Cenital'].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Campo>
              <Campo etiqueta="Atmósfera" id="org-atmosfera">
                <input id="org-atmosfera" value={parametros.atmosfera} onChange={cambiar('atmosfera')} placeholder="Cálida y cercana" />
              </Campo>
              <Campo etiqueta="Formato" id="org-formato">
                <select id="org-formato" value={parametros.formato} onChange={cambiar('formato')}>
                  {['1:1', '9:16', '16:9'].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Campo>
              <Campo etiqueta="Variaciones (1 a 4)" id="org-variaciones">
                <input
                  id="org-variaciones"
                  type="number"
                  min="1"
                  max="4"
                  value={parametros.variaciones}
                  onChange={cambiar('variaciones')}
                />
              </Campo>
            </div>

            <div>
              <span className="campo__etiqueta">Paleta</span>
              <div className="acciones" style={{ marginTop: 6 }}>
                <span title="Azul FWD" style={{ width: 28, height: 28, borderRadius: 8, background: '#1e3a8a' }} />
                <span title="Morado FWD" style={{ width: 28, height: 28, borderRadius: 8, background: '#7c3aed' }} />
                <span className="texto-pequeno texto-suave" style={{ alignSelf: 'center' }}>«Colores FWD» azul y morado</span>
              </div>
            </div>

            <Campo etiqueta="Directiva específica" id="org-directiva">
              <textarea id="org-directiva" value={parametros.directiva} onChange={cambiar('directiva')} placeholder="Qué debe transmitir la pieza" />
            </Campo>
            <Campo etiqueta="Prompt negativo" id="org-negativo">
              <input id="org-negativo" value={parametros.negativo} onChange={cambiar('negativo')} placeholder="Sin texto ilegible, sin personas reconocibles" />
            </Campo>
            <Campo etiqueta="Imagen de referencia (opcional)" id="org-referencia">
              <input
                id="org-referencia"
                type="file"
                accept="image/*"
                onChange={(e) => setReferencia(e.target.files?.[0] ?? null)}
              />
            </Campo>
            {referencia && <p className="texto-pequeno texto-suave">Referencia: {referencia.name}</p>}

            <AvisoIA error={error} />
            <div className="acciones">
              <Boton type="submit" variante="morado" icono="Sparkles" disabled={cargando || !IA_CONFIGURADA}>
                {cargando ? 'Generando…' : 'Generar piezas'}
              </Boton>
            </div>
          </form>
        </Tarjeta>

        <Tarjeta titulo="Piezas propuestas" subtitulo="Nada se publica sin aprobación humana.">
          {piezas.length === 0 ? (
            <Vacio titulo="Aún no hay piezas">Genera piezas para verlas aquí y aprobarlas.</Vacio>
          ) : (
            <div className="cuadricula-piezas">
              {piezas.map((p) => (
                <Pieza
                  key={p.id}
                  pieza={p}
                  onAprobar={() => cambiarEstado(p.id, ESTADO_APROBADA)}
                  onRechazar={() => cambiarEstado(p.id, ESTADO_RECHAZADA)}
                />
              ))}
            </div>
          )}
        </Tarjeta>
      </div>
    </>
  )
}

// ---------- Crear campañas ----------

const PASOS = [
  'Objetivo y parámetros',
  'Ficha y mensaje central',
  'Generación de piezas',
  'Asesoría de piezas',
  'Aprobación y neuromarketing',
]

function CrearCampana() {
  const { estado, acciones } = useCRM()
  const comprometido = estado.campanas.reduce((suma, c) => suma + c.presupuesto, 0)
  const disponible = PRESUPUESTO_DISPONIBLE - comprometido
  const [datos, setDatos] = useState({ nombre: '', objetivo: '', presupuesto: 1000, piezasMeta: 4 })
  const presupuestoValido = Number(datos.presupuesto) > 0 && Number(datos.presupuesto) <= disponible

  const enviar = (e) => {
    e.preventDefault()
    if (!datos.nombre.trim() || !presupuestoValido) return
    acciones.agregarCampana({
      nombre: datos.nombre.trim(),
      objetivo: datos.objetivo.trim() || OBJETIVO_POR_DEFECTO,
      presupuesto: Number(datos.presupuesto),
      piezasMeta: Number(datos.piezasMeta),
    })
    setDatos({ nombre: '', objetivo: '', presupuesto: 1000, piezasMeta: 4 })
  }

  return (
    <>
      <EncabezadoPagina
        titulo="Crear campañas"
        descripcion="Una campaña paso a paso, con el presupuesto disponible a la vista."
      />

      <section className="rejilla" aria-label="Presupuesto">
        <Kpi etiqueta="Presupuesto total" valor={moneda(PRESUPUESTO_DISPONIBLE)} />
        <Kpi etiqueta="Comprometido" valor={moneda(comprometido)} detalle={`${estado.campanas.length} campañas`} />
        <Kpi
          etiqueta="Disponible"
          valor={moneda(disponible)}
          variante={disponible < 0 ? 'peligro' : 'exito'}
          detalle={porcentaje((comprometido / PRESUPUESTO_DISPONIBLE) * 100) + ' usado'}
        />
      </section>

      <div className="rejilla--dos" style={{ marginTop: 16 }}>
        <Tarjeta titulo="Nueva campaña">
          <form onSubmit={enviar} className="stack">
            <Campo etiqueta="Nombre" id="camp-nombre">
              <input id="camp-nombre" required value={datos.nombre} onChange={(e) => setDatos({ ...datos, nombre: e.target.value })} placeholder="Inscripciones Campus Day · Puntarenas" />
            </Campo>
            <Campo etiqueta="Objetivo de negocio" id="camp-objetivo">
              <input id="camp-objetivo" value={datos.objetivo} onChange={(e) => setDatos({ ...datos, objetivo: e.target.value })} placeholder={OBJETIVO_POR_DEFECTO} />
            </Campo>
            <div className="rejilla">
              <Campo etiqueta="Presupuesto (USD)" id="camp-presupuesto">
                <input id="camp-presupuesto" type="number" min="1" max={Math.max(disponible, 0)} value={datos.presupuesto} onChange={(e) => setDatos({ ...datos, presupuesto: e.target.value })} />
              </Campo>
              <Campo etiqueta="Piezas meta" id="camp-piezas">
                <input id="camp-piezas" type="number" min="1" max="20" value={datos.piezasMeta} onChange={(e) => setDatos({ ...datos, piezasMeta: e.target.value })} />
              </Campo>
            </div>
            {!presupuestoValido && (
              <p className="texto-pequeno" role="alert" style={{ color: 'var(--color-peligro)', margin: 0 }}>
                El presupuesto debe ser mayor que 0 y no superar lo disponible ({moneda(Math.max(disponible, 0))}).
              </p>
            )}
            <div className="acciones">
              <Boton type="submit" variante="morado" icono="Megaphone" disabled={!datos.nombre.trim() || !presupuestoValido}>
                Crear campaña
              </Boton>
            </div>
          </form>
        </Tarjeta>

        <Tarjeta titulo="Pasos de una campaña" subtitulo="Así avanza cada campaña en Fordy.">
          <ol className="stack" style={{ paddingLeft: 20, margin: 0 }}>
            {PASOS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>
        </Tarjeta>
      </div>
    </>
  )
}

// ---------- Estado de campañas ----------

function EstadoCampanas() {
  const { estado, acciones } = useCRM()
  const [cargando, setCargando] = useState(null)
  const [error, setError] = useState('')

  const generarParaCampana = async (campana) => {
    setError('')
    setCargando(campana.id)
    const restantes = Math.max(1, Math.min(4, campana.piezasMeta - campana.piezas.length))
    try {
      const prompt = construirPrompt(estado.instruccionesFordy, datosDeCampana(campana))
      const nuevas = await generarPiezas({ prompt, cantidad: restantes, formato: '1:1' })
      acciones.agregarPiezas(
        campana.id,
        nuevas.map((p) => ({ id: crearId('pz'), texto: p.texto ?? '', imagenUrl: p.imagenUrl, estado: ESTADO_PENDIENTE })),
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(null)
    }
  }

  const aprobadas = (c) => c.piezas.filter((p) => p.estado === ESTADO_APROBADA).length

  return (
    <>
      <EncabezadoPagina
        titulo="Estado de campañas"
        descripcion="Cada campaña, su presupuesto y cuántas piezas están aprobadas."
      />

      <div className="tabla-contenedor">
        <table className="tabla">
          <thead>
            <tr>
              <th>Campaña</th>
              <th className="tabla__numero">Presupuesto</th>
              <th>Estado</th>
              <th>Piezas aprobadas</th>
            </tr>
          </thead>
          <tbody>
            {estado.campanas.map((c) => {
              const ok = aprobadas(c)
              const lista = ok >= c.piezasMeta
              return (
                <tr key={c.id}>
                  <td>{c.nombre}</td>
                  <td className="tabla__numero">{moneda(c.presupuesto)}</td>
                  <td>
                    <Insignia variante={lista ? 'exito' : ''}>{lista ? 'Lista para publicar' : c.estado}</Insignia>
                  </td>
                  <td>
                    {ok} / {c.piezasMeta}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {error && (
        <div className="consecuencias" role="alert" style={{ background: 'var(--color-peligro-suave)', marginTop: 16 }}>
          {error}
        </div>
      )}
      {!IA_CONFIGURADA && <div style={{ marginTop: 16 }}><AvisoIA /></div>}

      <div className="stack" style={{ marginTop: 18 }}>
        {estado.campanas.map((c) => (
          <Revelar key={c.id}>
            <Tarjeta
              titulo={c.nombre}
              subtitulo={`${moneda(c.presupuesto)} · ${c.objetivo || OBJETIVO_POR_DEFECTO}`}
              acciones={
                <Boton
                  pequeno
                  variante="morado"
                  icono="Sparkles"
                  disabled={!IA_CONFIGURADA || cargando === c.id || c.piezas.length >= c.piezasMeta}
                  onClick={() => generarParaCampana(c)}
                >
                  {cargando === c.id ? 'Generando…' : 'Generar piezas'}
                </Boton>
              }
            >
              <div className="barra-progreso-mini" aria-hidden="true">
                <span style={{ width: `${Math.min(100, (aprobadas(c) / c.piezasMeta) * 100)}%` }} />
              </div>
              <p className="texto-pequeno texto-suave" style={{ margin: '6px 0 12px' }}>
                {c.piezas.length} generadas · {aprobadas(c)} aprobadas · meta {c.piezasMeta}
              </p>
              {c.piezas.length === 0 ? (
                <Vacio titulo="Sin piezas">Genera piezas con IA; cada una queda pendiente de aprobación.</Vacio>
              ) : (
                <div className="cuadricula-piezas">
                  {c.piezas.map((p) => (
                    <Pieza
                      key={p.id}
                      pieza={p}
                      onAprobar={() => acciones.cambiarEstadoPieza(c.id, p.id, ESTADO_APROBADA)}
                      onRechazar={() => acciones.cambiarEstadoPieza(c.id, p.id, ESTADO_RECHAZADA)}
                    />
                  ))}
                </div>
              )}
            </Tarjeta>
          </Revelar>
        ))}
      </div>
    </>
  )
}

// ---------- Cerebro de Fordy ----------

function CerebroFordy() {
  const { estado, acciones } = useCRM()
  const [borradores, setBorradores] = useState({})
  const [campanaId, setCampanaId] = useState(estado.campanas[0]?.id ?? '')

  const campana = estado.campanas.find((c) => c.id === campanaId) ?? estado.campanas[0]

  // Vista previa en vivo: usa los borradores si existen, o el texto guardado.
  const instruccionesVivas = estado.instruccionesFordy.map((i) => ({
    ...i,
    texto: borradores[i.id] ?? i.texto,
  }))
  const prompt = campana ? construirPrompt(instruccionesVivas, datosDeCampana(campana)) : ''

  const restablecer = () => {
    acciones.restablecerInstrucciones(INSTRUCCIONES_FORDY_INICIALES)
    setBorradores({})
  }

  return (
    <>
      <EncabezadoPagina
        titulo="Cerebro de Fordy"
        descripcion={`${estado.instruccionesFordy.length} instrucciones activas. Se editan aquí, no están escondidas en el código.`}
        acciones={
          <Boton variante="secundario" icono="RotateCcw" onClick={restablecer}>
            Restablecer por defecto
          </Boton>
        }
      />

      <Tarjeta titulo="Variables dinámicas" subtitulo="Se reemplazan en vivo con los datos de cada campaña.">
        <div className="acciones" style={{ marginBottom: 8 }}>
          {VARIABLES_DISPONIBLES.map((v) => (
            <Insignia key={v.clave} variante="morado">
              {`{{${v.clave}}}`} · {v.descripcion}
            </Insignia>
          ))}
        </div>
      </Tarjeta>

      <div className="rejilla--dos" style={{ marginTop: 16 }}>
        <div className="stack">
          {estado.instruccionesFordy.map((instruccion) => {
            const valorActual = borradores[instruccion.id] ?? instruccion.texto
            const cambiado = valorActual !== instruccion.texto
            return (
              <Revelar key={instruccion.id}>
                <Tarjeta titulo={instruccion.titulo} subtitulo={cambiado ? 'Cambios sin guardar' : 'Guardada'}>
                  <Campo etiqueta="Instrucción" id={`fordy-${instruccion.id}`}>
                    <textarea
                      id={`fordy-${instruccion.id}`}
                      value={valorActual}
                      onChange={(e) => setBorradores({ ...borradores, [instruccion.id]: e.target.value })}
                    />
                  </Campo>
                  <div className="acciones" style={{ marginTop: 10 }}>
                    <Boton
                      pequeno
                      icono="Save"
                      disabled={!cambiado}
                      onClick={() => {
                        acciones.guardarInstruccion(instruccion.id, valorActual)
                        setBorradores((previo) => {
                          const copia = { ...previo }
                          delete copia[instruccion.id]
                          return copia
                        })
                      }}
                    >
                      Guardar instrucción
                    </Boton>
                  </div>
                </Tarjeta>
              </Revelar>
            )
          })}
        </div>

        <Tarjeta
          titulo="Vista previa del prompt"
          subtitulo="Así llega la instrucción a la IA para la campaña elegida."
          acciones={
            <label className="campo" style={{ minWidth: 200 }}>
              <span className="sr-only">Campaña</span>
              <select value={campana?.id ?? ''} onChange={(e) => setCampanaId(e.target.value)}>
                {estado.campanas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </label>
          }
        >
          {campana ? (
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                background: '#0f172a',
                color: '#e2e8f0',
                padding: 14,
                borderRadius: 10,
                fontSize: '0.82rem',
                maxHeight: '60vh',
                overflow: 'auto',
                margin: 0,
              }}
            >
              {prompt}
            </pre>
          ) : (
            <Vacio titulo="Sin campañas">Crea una campaña para ver la vista previa.</Vacio>
          )}
        </Tarjeta>
      </div>
    </>
  )
}
