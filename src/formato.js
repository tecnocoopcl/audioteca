const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

/** "2026-10-20" → "20 de octubre de 2026". */
export function fecha(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '')
  if (!m || Number(m[2]) < 1 || Number(m[2]) > 12) return iso ?? ''
  return `${Number(m[3])} de ${MESES[Number(m[2]) - 1]} de ${m[1]}`
}

/** 1240 → "20:40"; 3725 → "1:02:05"; 0 → "". */
export function duracion(segundos) {
  const s = Math.floor(Number(segundos) || 0)
  if (s <= 0) return ''
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const dd = (n) => String(n).padStart(2, '0')
  return h ? `${h}:${dd(m)}:${dd(s % 60)}` : `${m}:${dd(s % 60)}`
}

/** 1240 → "20 minutos 40 segundos": para el lector de pantalla. */
export function duracionHablada(segundos) {
  const s = Math.max(0, Math.floor(Number(segundos) || 0))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const partes = []
  if (h) partes.push(plural(h, 'hora', 'horas'))
  if (m) partes.push(plural(m, 'minuto', 'minutos'))
  if (s % 60 || partes.length === 0) partes.push(plural(s % 60, 'segundo', 'segundos'))
  return partes.join(' ')
}

export function megas(bytes) {
  return bytes > 0 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : ''
}

export const LICENCIAS = {
  'cc-by-sa': { nombre: 'CC BY-SA 4.0', url: 'https://creativecommons.org/licenses/by-sa/4.0/deed.es' },
  'cc-by': { nombre: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/deed.es' },
  'cc-by-nc-sa': { nombre: 'CC BY-NC-SA 4.0', url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es' },
  cc0: { nombre: 'CC0 — dominio público', url: 'https://creativecommons.org/publicdomain/zero/1.0/deed.es' },
  'todos-los-derechos': { nombre: 'Todos los derechos reservados', url: null },
}

export function plural(n, uno, varios) {
  return `${n} ${n === 1 ? uno : varios}`
}
