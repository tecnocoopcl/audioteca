import { PREFIJO_ESTATICO, archivoEstatico } from './datos.js'

// Dónde está el backend de la cooperativa (tecno-cooperativa-backend), que
// indexa las audiotecas de los pods. En desarrollo lo fija .env.development.
export const API_URL = import.meta.env.VITE_API_URL || 'https://api-tc.aebn.cl'

export const RSS_URL = `${API_URL}/audioteca/rss`

export class ErrorDeApi extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

/**
 * GET a la API de la audioteca: `{ datos, origen }`. Primero busca la copia
 * estática que dejó el build (origen 'estatico'); si no hay, o si se pide
 * `soloApi`, va a la API (origen 'api'). 404 se lanza con status, para "no está".
 */
export async function pedir(ruta, parametros = {}, { soloApi = false } = {}) {
  const archivo = soloApi ? null : archivoEstatico(ruta, parametros)
  if (archivo) {
    try {
      const res = await fetch(PREFIJO_ESTATICO + archivo, { headers: { accept: 'application/json' } })
      // En desarrollo Vite responde index.html (200) a lo que no existe.
      if (res.ok && res.headers.get('content-type')?.includes('json')) return { datos: await res.json(), origen: 'estatico' }
    } catch {
      // Sin copia: se pregunta a la API.
    }
  }
  return { datos: await pedirApi(ruta, parametros), origen: 'api' }
}

async function pedirApi(ruta, parametros) {
  const url = new URL(`${API_URL}/audioteca/${ruta}`)
  for (const [clave, valor] of Object.entries(parametros)) {
    if (valor !== undefined && valor !== null && valor !== '') url.searchParams.set(clave, valor)
  }
  const res = await fetch(url, { headers: { accept: 'application/json' } })
  if (!res.ok) throw new ErrorDeApi(res.status, `La audioteca respondió ${res.status}`)
  return res.json()
}

/**
 * Suma una escucha de la pieza en el contador de todos (anónimo). Si la API
 * no responde no pasa nada: la marca local y la cuenta de espacio ya están.
 */
export async function anotarEscucha(pieza) {
  try {
    await fetch(`${API_URL}/audioteca/escuchas`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ cuenta: pieza.account, serie: pieza.serie, pieza: pieza.slug }),
      keepalive: true,
    })
  } catch {
    // Sin conexión: esta escucha no suma al contador de todos.
  }
}
