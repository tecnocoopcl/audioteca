import { useCallback, useEffect, useState } from 'react'
import { pedir } from './api.js'

/**
 * Pide `ruta` a la API cada vez que cambian la ruta o los parámetros.
 * { datos, error, cargando, reintentar }; error.status === 404 es "no está".
 */
export function usarApi(ruta, parametros = {}) {
  const clave = JSON.stringify([ruta, parametros])
  const [estado, setEstado] = useState({ datos: null, error: null, cargando: true })
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    if (!ruta) return
    let vigente = true
    setEstado((e) => ({ ...e, error: null, cargando: true }))
    pedir(ruta, parametros)
      .then((datos) => vigente && setEstado({ datos, error: null, cargando: false }))
      .catch((error) => vigente && setEstado({ datos: null, error, cargando: false }))
    return () => {
      vigente = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave, intento])

  const reintentar = useCallback(() => setIntento((n) => n + 1), [])
  return { ...estado, reintentar }
}
