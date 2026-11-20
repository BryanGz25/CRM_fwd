// Mapa del menú, según "Parte 3 · Mapa del CRM" del PDF.

export const MENU = [
  {
    grupo: 'Admisiones',
    items: [
      { to: '/admisiones/panel', texto: 'Panel de admisiones', icono: 'LayoutDashboard' },
      { to: '/admisiones/fichas', texto: 'Fichas de candidatos', icono: 'Users' },
      { to: '/admisiones/crm', texto: 'CRM (kanban)', icono: 'Columns3' },
    ],
  },
  {
    grupo: 'Atención',
    items: [
      { to: '/atencion/entrevistas', texto: 'Entrevistas', icono: 'ClipboardCheck' },
      { to: '/atencion/resultados', texto: 'Resultados por revisar', icono: 'ListChecks' },
      { to: '/atencion/espera', texto: 'Lista de espera', icono: 'Hourglass' },
      { to: '/atencion/excluidos', texto: 'Excluidos', icono: 'UserX' },
    ],
  },
  {
    grupo: 'Calendario y reportes',
    items: [
      { to: '/calendario/campus-days', texto: 'Campus days', icono: 'GraduationCap' },
      { to: '/calendario/cohortes', texto: 'Cohortes y calendario', icono: 'CalendarDays' },
      { to: '/calendario/fechas-landing', texto: 'Fechas del landing', icono: 'Globe' },
      { to: '/calendario/reporte-diario', texto: 'Reporte diario', icono: 'FileText' },
      { to: '/calendario/como-funciona', texto: '¿Cómo funciona?', icono: 'BookOpen' },
    ],
  },
  {
    grupo: 'Mercadeo',
    items: [
      { to: '/mercadeo/organica', texto: 'Publicación orgánica', icono: 'Share2' },
      { to: '/mercadeo/crear-campana', texto: 'Crear campañas', icono: 'Megaphone' },
      { to: '/mercadeo/estado-campanas', texto: 'Estado de campañas', icono: 'Activity' },
      { to: '/mercadeo/cerebro-fordy', texto: 'Cerebro de Fordy', icono: 'Sparkles' },
    ],
  },
]

export function tituloDeRuta(pathname) {
  for (const grupo of MENU) {
    const item = grupo.items.find((i) => pathname.startsWith(i.to))
    if (item) return { grupo: grupo.grupo, texto: item.texto }
  }
  return { grupo: '', texto: 'CRM FWD' }
}
