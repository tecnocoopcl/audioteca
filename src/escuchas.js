/**
 * Cuándo una reproducción cuenta como escucha (ADR-021 de espacio,
 * «Escuchas»): al oír el 80 % de la pieza o 5 minutos, lo que llegue antes.
 * Solo suma lo que de verdad sonó: adelantar o saltar no cuenta, y en pausa
 * no avanza.
 *
 * Sin React ni DOM, para probarlo con `node --test`.
 */

export const MINIMO_SEGUNDOS = 5 * 60
export const FRACCION = 0.8
/** Entre dos `timeupdate` seguidos pasan ~0,25 s; más que esto es un salto. */
const MAX_PASO = 2

/** Segundos que hay que oír para que cuente. Sin duración conocida, 5 min. */
export function umbral(duracion) {
  if (!Number.isFinite(duracion) || duracion <= 0) return MINIMO_SEGUNDOS
  return Math.min(FRACCION * duracion, MINIMO_SEGUNDOS)
}

/**
 * Lleva lo oído de una pieza. `avanzar(t)` recibe la posición del audio en
 * cada `timeupdate` y devuelve `{ escucha, minutos }`: `escucha` es true una
 * sola vez, al cruzar el umbral; `minutos` son los minutos completos nuevos
 * desde la llamada anterior (para «minutos escuchados» de espacio).
 * `desde(t)` fija la posición sin sumar (al empezar, reanudar o adelantar).
 */
export function seguimiento() {
  let ultima = null
  let oido = 0
  let contada = false
  let minutosAvisados = 0

  return {
    get oido() {
      return oido
    },
    get contada() {
      return contada
    },
    desde(t) {
      ultima = t
    },
    avanzar(t, duracion) {
      const paso = ultima === null ? 0 : t - ultima
      ultima = t
      if (paso > 0 && paso <= MAX_PASO) oido += paso

      let escucha = false
      if (!contada && oido >= umbral(duracion)) {
        contada = true
        escucha = true
      }
      const completos = Math.floor(oido / 60)
      const minutos = completos - minutosAvisados
      minutosAvisados = completos
      return { escucha, minutos }
    },
  }
}

/** «1 escucha», «12 escuchas»; nada si nadie la ha oído todavía. */
export function textoDeEscuchas(n) {
  if (!n) return ''
  return n === 1 ? '1 escucha' : `${n.toLocaleString('es-CL')} escuchas`
}

/** Identifica la pieza en la API: «cuenta/serie/pieza». */
export function claveDePieza(p) {
  return `${p.account}/${p.serie}/${p.slug}`
}

const PREFIJO = 'audioteca:escuchada:'

function almacen() {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

/** ¿Esta pieza ya se escuchó en este navegador? */
export function fueEscuchada(p, storage = almacen()) {
  try {
    return storage?.getItem(PREFIJO + claveDePieza(p)) != null
  } catch {
    return false
  }
}

/** La marca vive solo en este navegador, como la posición de cada pieza. */
export function marcarEscuchada(p, storage = almacen(), ahora = new Date()) {
  try {
    storage?.setItem(PREFIJO + claveDePieza(p), ahora.toISOString().slice(0, 10))
  } catch {
    // Sin almacenamiento (ventana privada): la marca dura lo que la pestaña.
  }
}
