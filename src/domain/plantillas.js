// Variables dinámicas del "Cerebro de Fordy" (PDF, Demo 5): {{nombre}}, {{presupuesto}}, {{objetivo_negocio}}.
// Se reemplazan con los datos de cada campaña antes de enviar la instrucción.

import { moneda } from './formato'

export const VARIABLES_DISPONIBLES = [
  { clave: 'nombre', descripcion: 'Nombre de la campaña' },
  { clave: 'presupuesto', descripcion: 'Presupuesto asignado (USD)' },
  { clave: 'objetivo_negocio', descripcion: 'Objetivo de negocio de la campaña' },
]

export const OBJETIVO_POR_DEFECTO = 'Atraer candidatos al programa'

export function datosDeCampana(campana) {
  return {
    nombre: campana.nombre,
    presupuesto: moneda(campana.presupuesto),
    objetivo_negocio: campana.objetivo || OBJETIVO_POR_DEFECTO,
  }
}

export function sustituirVariables(texto, datos) {
  return texto.replace(/\{\{\s*(\w+)\s*\}\}/g, (coincidencia, clave) =>
    Object.prototype.hasOwnProperty.call(datos, clave) ? datos[clave] : coincidencia,
  )
}

// Une todas las instrucciones activas en un solo prompt, con los datos ya sustituidos.
export function construirPrompt(instrucciones, datos) {
  return instrucciones
    .map((i) => `## ${i.titulo}\n${sustituirVariables(i.texto, datos)}`)
    .join('\n\n')
}
