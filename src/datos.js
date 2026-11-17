import { createContext } from 'react'

// Qué le pide cada vista a la API, y dónde queda una copia estática de esa
// respuesta. Lo usan las vistas (para pedir), el build (para prerenderizar y
// escribir las copias) y el cliente (para leerlas antes que la API).
//
// Las copias viven en /_datos/: ningún slug empieza con «_», así que no
// chocan con las rutas de cuentas, series y piezas.

export const PREFIJO_ESTATICO = '/_datos/'

/** La API de una serie: `series/<cuenta>/<serie>`. */
export function apiSerie(cuenta, slug) {
  return `series/${encodeURIComponent(cuenta)}/${encodeURIComponent(slug)}`
}

/** Identifica una petición a la API (ruta + parámetros) entre build y cliente. */
export function claveApi(ruta, parametros = {}) {
  return JSON.stringify([ruta, parametros])
}

const vacios = (parametros) => Object.values(parametros).every((v) => v === undefined || v === null || v === '')

/**
 * Archivo con la copia estática de una petición, o null si esa petición
 * siempre va a la API (búsquedas, páginas siguientes, escuchas).
 */
export function archivoEstatico(ruta, parametros = {}) {
  if (!ruta) return null
  const { cuenta, ...resto } = parametros
  if (ruta === 'series' && cuenta && vacios(resto)) return `cuentas/${encodeURIComponent(cuenta)}.json`
  if (!vacios(parametros)) return null
  if (ruta === 'series') return 'series.json'
  if (ruta === 'piezas') return 'piezas.json'
  if (/^series\/[^/]+\/[^/]+$/.test(ruta)) return `${ruta}.json`
  return null
}

/** Las peticiones que hace la vista de una ruta (ver parseRuta) al cargar. */
export function necesita(ruta) {
  switch (ruta.vista) {
    case 'inicio':
      return [['series', {}], ['piezas', {}]]
    case 'autor':
      return [['series', { cuenta: ruta.cuenta }]]
    case 'serie':
      return [[apiSerie(ruta.cuenta, ruta.serie), {}]]
    case 'pieza':
      return [[apiSerie(ruta.cuenta, ruta.serie), {}]]
    default:
      return []
  }
}

/** Respuestas que vienen escritas en el HTML prerenderizado: { [claveApi]: datos }. */
export const DatosIniciales = createContext({})
