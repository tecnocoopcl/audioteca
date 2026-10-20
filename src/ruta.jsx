import { useEffect, useState } from 'react'

// Router mínimo, sin dependencias, como el de musica. Navegar con pushState y
// no con recargas importa: una recarga corta lo que suena.
//
//   /                          portada (?pagina=)
//   /tematica/<slug>           una temática (?pagina=)
//   /buscar                    búsqueda (?q=&pagina=)
//   /<cuenta>                  las series de un autor
//   /<cuenta>/<serie>          una serie
//   /<cuenta>/<serie>/<pieza>  una pieza
//
// En GitHub Pages cualquier ruta llega aquí gracias a 404.html (copia de
// index.html).
export function parseRuta({ pathname, search }) {
  const partes = pathname.split('/').filter(Boolean).map(decodeURIComponent)
  const q = new URLSearchParams(search)
  const pagina = Number(q.get('pagina')) || 1
  if (partes.length === 0) return { vista: 'inicio', pagina }
  if (partes[0] === 'tematica' && partes.length === 2) return { vista: 'tematica', tematica: partes[1], pagina }
  if (partes[0] === 'buscar' && partes.length === 1) return { vista: 'buscar', q: q.get('q') ?? '', pagina }
  if (partes.length === 1) return { vista: 'autor', cuenta: partes[0] }
  if (partes.length === 2) return { vista: 'serie', cuenta: partes[0], serie: partes[1] }
  if (partes.length === 3) return { vista: 'pieza', cuenta: partes[0], serie: partes[1], pieza: partes[2] }
  return { vista: 'no-encontrada' }
}

export function navegar(href) {
  const url = new URL(href, window.location.origin)
  if (url.pathname + url.search === window.location.pathname + window.location.search) return
  window.history.pushState(null, '', url.pathname + url.search)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function useRuta() {
  const [ruta, setRuta] = useState(() => parseRuta(window.location))

  useEffect(() => {
    function onPop() {
      setRuta(parseRuta(window.location))
      window.scrollTo(0, 0)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  return ruta
}

// <a> que navega sin recargar. Ctrl/Cmd+clic y clic central siguen abriendo
// una pestaña nueva, como cualquier enlace.
export function Link({ href, onClick, ...props }) {
  function handleClick(e) {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    navegar(href)
  }
  return <a href={href} onClick={handleClick} {...props} />
}

/** href con los parámetros que no están vacíos. */
export function conParametros(ruta, parametros) {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(parametros)) if (v && !(k === 'pagina' && v === 1)) q.set(k, v)
  const s = q.toString()
  return s ? `${ruta}?${s}` : ruta
}
