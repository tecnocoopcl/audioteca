/** Convierte la respuesta de la API en una cola que avanza del capítulo más antiguo al más nuevo. */
export function colaDeSerie(serie, cuenta = serie.account) {
  return [...serie.pieces].reverse().map((pieza) => ({
    ...pieza,
    account: cuenta,
    serie: serie.slug,
    serie_title: serie.title,
    cover: serie.cover,
  }))
}
