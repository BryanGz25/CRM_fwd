import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { PanelAdmisiones } from './pages/admisiones/PanelAdmisiones'
import { Fichas } from './pages/admisiones/Fichas'
import { CRMKanban } from './pages/admisiones/CRMKanban'
import { Atencion } from './pages/atencion/Atencion'
import { Calendario } from './pages/calendario/Calendario'
import { Mercadeo } from './pages/mercadeo/Mercadeo'
import { Link } from 'react-router-dom'
import { Icono } from './components/ui/iconos'

function NoEncontrada() {
  return (
    <div className="pagina-404">
      <h1>Página no encontrada</h1>
      <p className="texto-suave">La sección que buscas no existe en el CRM.</p>
      <Link to="/admisiones/panel" className="boton" style={{ color: '#fff', display: 'inline-flex' }}>
        <Icono nombre="LayoutDashboard" size={16} /> Ir al panel
      </Link>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/admisiones/panel" replace />} />

        <Route path="admisiones/panel" element={<PanelAdmisiones />} />
        <Route path="admisiones/fichas" element={<Fichas />} />
        <Route path="admisiones/crm" element={<CRMKanban />} />

        <Route path="atencion/entrevistas" element={<Atencion vista="entrevistas" />} />
        <Route path="atencion/resultados" element={<Atencion vista="resultados" />} />
        <Route path="atencion/espera" element={<Atencion vista="espera" />} />
        <Route path="atencion/excluidos" element={<Atencion vista="excluidos" />} />

        <Route path="calendario/campus-days" element={<Calendario vista="campus" />} />
        <Route path="calendario/cohortes" element={<Calendario vista="cohortes" />} />
        <Route path="calendario/fechas-landing" element={<Calendario vista="landing" />} />
        <Route path="calendario/reporte-diario" element={<Calendario vista="reporte" />} />
        <Route path="calendario/como-funciona" element={<Calendario vista="como" />} />

        <Route path="mercadeo/organica" element={<Mercadeo vista="organica" />} />
        <Route path="mercadeo/crear-campana" element={<Mercadeo vista="crear" />} />
        <Route path="mercadeo/estado-campanas" element={<Mercadeo vista="estado" />} />
        <Route path="mercadeo/cerebro-fordy" element={<Mercadeo vista="cerebro" />} />

        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  )
}
