import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { MENU, tituloDeRuta } from '../../domain/navegacion'
import { formatearFecha } from '../../domain/fechas'
import { useScrollPosicion } from '../../hooks/useScroll'
import { useCRM } from '../../store/CRMContext'
import { Icono } from '../ui/iconos'
import { Avisos } from '../ui/Avisos'
import { BarraProgreso, BotonArriba } from './ScrollUI'

export function Layout() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const { pathname } = useLocation()
  const { y } = useScrollPosicion()
  const { hoy } = useCRM()
  const titulo = tituloDeRuta(pathname)
  const compacta = y > 8

  const cerrarMenu = () => setMenuAbierto(false)

  // Al cambiar de página, volver al inicio (el scroll no se hereda entre pantallas).
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return (
    <div className="app">
      <a className="saltar-contenido" href="#contenido">
        Saltar al contenido
      </a>
      <BarraProgreso />

      <aside
        className={`app__menu ${menuAbierto ? 'app__menu--abierto' : ''}`}
        aria-label="Menú principal"
      >
        <button type="button" className="menu__boton-cerrar" onClick={cerrarMenu} aria-label="Cerrar menú">
          <Icono nombre="X" size={20} />
        </button>
        <div className="menu__marca">
          <span className="menu__logo" aria-hidden="true">F</span>
          <span>CRM FWD</span>
        </div>
        <nav>
          {MENU.map((grupo) => (
            <div className="menu__grupo" key={grupo.grupo}>
              <p className="menu__grupo-titulo">{grupo.grupo}</p>
              {grupo.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={cerrarMenu}
                  className={({ isActive }) =>
                    `menu__enlace ${isActive ? 'menu__enlace--activo' : ''}`
                  }
                >
                  <Icono nombre={item.icono} size={17} />
                  {item.texto}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {menuAbierto && (
        <button type="button" className="app__velo" onClick={cerrarMenu} aria-label="Cerrar menú" />
      )}

      <div className="app__principal">
        <header className={`cabecera ${compacta ? 'cabecera--compacta' : ''}`}>
          <button
            type="button"
            className="menu__boton-abrir"
            onClick={() => setMenuAbierto(true)}
            aria-label="Abrir menú"
          >
            <Icono nombre="Menu" size={20} />
          </button>
          <div>
            {titulo.grupo && <span className="cabecera__chip">{titulo.grupo} · </span>}
            <h2 className="cabecera__titulo" style={{ fontSize: compacta ? '0.95rem' : '1rem' }}>
              {titulo.texto}
            </h2>
          </div>
          <div className="cabecera__espacio" />
          <span className="cabecera__chip">Hoy: {formatearFecha(hoy)}</span>
        </header>

        <main id="contenido" className="app__contenido" tabIndex={-1}>
          <Outlet />
        </main>
      </div>

      <Avisos />
      <BotonArriba />
    </div>
  )
}
