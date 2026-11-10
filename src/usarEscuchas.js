import { useEffect } from 'react'
import { useReproductor } from './Reproductor.jsx'
import { usarApi } from './usarApi.js'

/**
 * Cuántas veces oyeron todos cada pieza de una cuenta: `{ "cuenta/serie/pieza": n }`.
 * Se vuelve a pedir cuando aquí se completa una escucha, para que la propia
 * se vea sumada. Si la API falla, sin cifras: la audioteca se oye igual.
 */
export function usarEscuchas(cuenta) {
  const { escuchas } = useReproductor()
  const respuesta = usarApi('escuchas', { cuenta })
  const { reintentar } = respuesta

  useEffect(() => {
    if (escuchas > 0) reintentar()
  }, [escuchas, reintentar])

  return respuesta.datos?.plays ?? {}
}
