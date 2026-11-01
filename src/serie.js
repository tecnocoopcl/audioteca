/** Convierte la respuesta de la API en una cola de reproducción. La API ya entrega las piezas de la más antigua a la más nueva. */
export function colaDeSerie(serie, cuenta = serie.account) {
  return serie.pieces.map((pieza) => ({
    ...pieza,
    account: cuenta,
    serie: serie.slug,
    serie_title: serie.title,
    cover: serie.cover,
  }))
}
