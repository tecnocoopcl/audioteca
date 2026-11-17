import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { pedir } from './api.js'
import { DatosIniciales, claveApi } from './datos.js'

/**
 * Pide `ruta` a la API cada vez que cambian la ruta o los parámetros.
 * { datos, error, cargando, origen, reintentar, refrescar }; error.status === 404 es "no está".
 *
 * Si la respuesta ya viene escrita en el HTML prerenderizado, la usa sin
 * pedir nada. `origen` dice de dónde salió: 'estatico' (del build) o 'api'.
 * `refrescar` vuelve a pedir saltándose la copia estática.
 */
export function usarApi(ruta, parametros = {}) {
  const clave = claveApi(ruta, parametros)
  const iniciales = useContext(DatosIniciales)
  const [estado, setEstado] = useState(() =>
    ruta && clave in iniciales
      ? { datos: iniciales[clave], error: null, cargando: false, origen: 'estatico' }
      : { datos: null, error: null, cargando: true, origen: null },
  )
  const [intento, setIntento] = useState({ n: 0, soloApi: false })
  // La primera vez, lo que vino en el HTML ya está en el estado.
  const servida = useRef(ruta && clave in iniciales ? clave : null)

  useEffect(() => {
    if (!ruta) return
    if (servida.current === clave && intento.n === 0) return
    servida.current = null
    let vigente = true
    setEstado((e) => ({ ...e, error: null, cargando: true }))
    pedir(ruta, parametros, { soloApi: intento.soloApi })
      .then(({ datos, origen }) => vigente && setEstado({ datos, error: null, cargando: false, origen }))
      .catch((error) => vigente && setEstado({ datos: null, error, cargando: false, origen: null }))
    return () => {
      vigente = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave, intento])

  const reintentar = useCallback(() => setIntento((i) => ({ n: i.n + 1, soloApi: false })), [])
  const refrescar = useCallback(() => setIntento((i) => ({ n: i.n + 1, soloApi: true })), [])
  return { ...estado, reintentar, refrescar }
}
