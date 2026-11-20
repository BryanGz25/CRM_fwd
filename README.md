# CRM FWD · Admisiones y Mercadeo

Frontend en React del CRM descrito en `docs/Taller CRM y plataforma de FWD (1).pdf`.
Todos los datos son ficticios y se guardan en el navegador (`localStorage`).

## Cómo correrlo

```bash
npm install
npm run dev       # desarrollo: http://localhost:5173
npm run build     # compilación de producción en dist/
npm run preview   # sirve dist/ en http://localhost:4173
npm run lint      # ESLint
```

## Configuración opcional (IA)

La generación de piezas con IA llama a un backend propio, nunca a la API de Claude desde el navegador.

```bash
# .env.local
VITE_API_BASE_URL=https://tu-backend.example.com/api
```

El backend debe exponer `POST /fordy/piezas` y responder `{ "piezas": [{ "texto": "...", "imagenUrl": "..." }] }`.
Sin esta variable, la app muestra que el servicio no está conectado.

## Estructura

```
docs/                       PDF del taller (fuente de requisitos)
src/
  domain/                   Reglas de negocio puras (sin React)
    etapas.js               Las 9 etapas, metas y etapas de fuga
    metricas.js             Conversión, fuga, días promedio, "qué atender hoy"
    movimientos.js          Vista previa de "Mover a…" (qué va a pasar)
    plantillas.js           Variables {{nombre}}, {{presupuesto}}, {{objetivo_negocio}}
    datosFicticios.js       Datos de demo (sin nombres ni contactos reales)
    fechas.js, formato.js, navegacion.js
  store/                    Estado global (reducer + proveedor + persistencia)
  hooks/useScroll.js        Eventos de scroll: posición, progreso, scroll-spy, carga al final
  services/fordy.js         Cliente del servicio de IA
  components/
    layout/                 Menú, cabecera, barra de progreso, botón "volver arriba"
    ui/                     Piezas base, modal, avisos, índice de secciones
    candidatos/             Tarjeta, ficha, diálogo "Mover a…"
    funnel/                 Embudo visual
  pages/
    admisiones/             Panel, fichas (carga al desplazar), kanban
    atencion/               Entrevistas, resultados, lista de espera, excluidos
    calendario/             Campus days, cohortes, landing, reporte diario, guía
    mercadeo/               Publicación orgánica, crear campaña, estado, Cerebro de Fordy
```

## Eventos de scroll

- **Barra de progreso** de lectura arriba (`useProgresoScroll`).
- **Cabecera compacta** al bajar (`useScrollPosicion`).
- **Botón "volver arriba"** después de 400 px.
- **Scroll-spy**: el índice lateral resalta la sección visible (`useScrollSpy`).
- **Revelado al entrar** en pantalla con IntersectionObserver (`Revelar`).
- **Carga progresiva** de listas al llegar al final (`useCargaAlDesplazar`).

## Reglas de diseño del PDF que se respetan

- Nunca se muestran nombres ni contactos: solo códigos (`CND-0001`).
- Las tarjetas nuevas aparecen en azul hasta que alguien las revisa.
- "Mover a…" muestra qué va a pasar antes de confirmar.
- La IA propone y una persona aprueba antes de publicar.
- Las instrucciones de Fordy se editan en la app, no en el código.
