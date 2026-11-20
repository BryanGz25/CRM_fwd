// Cliente del servicio de generación de piezas con IA.
//
// La clave de la API de Claude NUNCA va en el navegador. El frontend llama a un backend propio
// (VITE_API_BASE_URL) que guarda la clave en una variable de entorno y llama a la API de Claude.
// Si no hay backend configurado, la app lo indica en vez de inventar resultados.

const BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

export const IA_CONFIGURADA = BASE.length > 0

// Pide `cantidad` piezas. Devuelve [{ texto, imagenUrl? }]. Nunca se envían datos personales.
export async function generarPiezas({ prompt, cantidad, formato = '1:1', extra = {} }, { signal } = {}) {
  if (!IA_CONFIGURADA) {
    throw new Error(
      'El servicio de IA no está configurado. Define VITE_API_BASE_URL con la URL del backend que llama a la API de Claude.',
    )
  }

  let respuesta
  try {
    respuesta = await fetch(`${BASE}/fordy/piezas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, cantidad, formato, ...extra }),
      signal,
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('No se pudo conectar con el servicio de IA. Revisa la conexión o que el backend esté activo.', {
      cause: error,
    })
  }

  if (!respuesta.ok) {
    throw new Error(`El servicio de IA respondió con error ${respuesta.status}. Intenta de nuevo.`)
  }

  const datos = await respuesta.json()
  if (!Array.isArray(datos.piezas)) {
    throw new Error('Respuesta inesperada del servicio de IA.')
  }
  return datos.piezas
}
