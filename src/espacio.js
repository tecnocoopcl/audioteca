import { connect } from './vendor/espacio-sdk/index.js'

/**
 * Si la audioteca se abre dentro de espacio, le cuenta a Inicio lo que se
 * escucha (ADR-030 de espacio): «piezas escuchadas» y «minutos escuchados».
 * Solo cantidades, nunca qué se escuchó.
 *
 * El canal se abre sin bloquear la carga: fuera de espacio `connect`
 * devuelve null al instante, y dentro de un shell que no responde la
 * audioteca no espera sus 5 s para mostrarse.
 */
const conexion = connect().catch(() => null)

export async function contarActividad(tipo, n = 1) {
  if (n < 1) return
  const espacio = await conexion
  // Un shell anterior a la SDK 0.3.0 responde «método desconocido», y uno sin
  // el tipo en el manifiesto, EspacioForbidden: ninguno debe molestar al que
  // escucha.
  await espacio?.actividad({ tipo, n }).catch(() => {})
}
