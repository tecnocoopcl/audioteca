const CLAVE = 'audioteca:descubrimiento-diario'

export function fechaLocal(d = new Date()) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function indiceDelDia(fecha, cantidad) {
  if (!cantidad) return -1
  let hash = 2166136261
  for (const caracter of fecha) {
    hash ^= caracter.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0) % cantidad
}

/** Mantiene el mismo recurso todo el día aunque se vuelva a cargar la portada. */
export function descubrimientoDelDia(piezas, almacenamiento = globalThis.localStorage, hoy = fechaLocal()) {
  if (!piezas?.length) return null
  try {
    const guardado = JSON.parse(almacenamiento?.getItem(CLAVE) ?? 'null')
    if (guardado?.fecha === hoy && guardado.pieza?.file?.url) return guardado.pieza
  } catch {
    // El navegador puede bloquear el almacenamiento; la selección sigue siendo determinista.
  }
  const pieza = piezas[indiceDelDia(hoy, piezas.length)]
  try {
    almacenamiento?.setItem(CLAVE, JSON.stringify({ fecha: hoy, pieza }))
  } catch {
    // Sin persistencia, el hash de la fecha conserva una selección estable.
  }
  return pieza
}
