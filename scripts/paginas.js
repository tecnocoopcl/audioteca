// Después de `vite build`: escribe un HTML por cada cuenta, serie y pieza
// publicada, para que GitHub Pages responda 200 (y no 404) en esas rutas y
// para que buscadores y previsualizadores de enlaces vean su título, su
// descripción y su portada sin ejecutar la app.
//
//   dist/<cuenta>.html                  y  dist/<cuenta>/index.html
//   dist/<cuenta>/<serie>.html          y  dist/<cuenta>/<serie>/index.html
//   dist/<cuenta>/<serie>/<pieza>.html  y  dist/<cuenta>/<serie>/<pieza>/index.html
//
// GitHub Pages sirve /a/b desde a/b.html con 200; sin ese archivo redirigiría
// (301) a /a/b/. El index.html cubre a quien llegue con la barra final.
//
// Lo que se publique entre un deploy y otro sigue cargando por 404.html (copia
// de index.html), como antes. Si la API no responde, el build no falla: solo
// queda ese respaldo.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ORIGEN = 'https://audioteca.tecnocooperativa.cl'
const API_URL = process.env.VITE_API_URL || 'https://api-tc.aebn.cl'
const SLUG = /^[a-z0-9][a-z0-9_-]*$/i

const escapar = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function resumir(texto, largo = 200) {
  const limpio = String(texto ?? '').replace(/\s+/g, ' ').trim()
  if (limpio.length <= largo) return limpio
  return limpio.slice(0, largo - 1).replace(/\s+\S*$/, '') + '…'
}

/** Copia de index.html con el título y los metadatos de una ruta. */
export function conMetadatos(html, { titulo, descripcion, imagen, ruta, tipo = 'website' }) {
  const url = `${ORIGEN}${ruta}`
  const desc = escapar(resumir(descripcion))
  const etiquetas = [
    `<link rel="canonical" href="${escapar(url)}" />`,
    `<meta property="og:site_name" content="Audioteca" />`,
    `<meta property="og:type" content="${tipo}" />`,
    `<meta property="og:title" content="${escapar(titulo)}" />`,
    `<meta property="og:description" content="${desc}" />`,
    `<meta property="og:url" content="${escapar(url)}" />`,
    imagen && `<meta property="og:image" content="${escapar(imagen)}" />`,
    `<meta name="twitter:card" content="${imagen ? 'summary_large_image' : 'summary'}" />`,
  ].filter(Boolean)
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${escapar(titulo)} · Audioteca</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/, `<meta name="description" content="${desc}" />`)
    .replace(/\s*<\/head>/, `\n    ${etiquetas.join('\n    ')}\n  </head>`)
}

/** Las páginas a escribir: [{ ruta: '/cuenta/serie', html }]. */
export function paginas(html, series) {
  const salida = new Map()
  const agregar = (ruta, datos) => salida.set(ruta, { ruta, html: conMetadatos(html, { ...datos, ruta }) })

  for (const serie of series) {
    const { account: cuenta, slug } = serie
    if (!SLUG.test(cuenta ?? '') || !SLUG.test(slug ?? '')) continue

    if (!salida.has(`/${cuenta}`)) {
      agregar(`/${cuenta}`, {
        titulo: cuenta,
        descripcion: `Las series de ${serie.project_name || cuenta} en la audioteca de tecnocooperativa.`,
        tipo: 'profile',
      })
    }
    agregar(`/${cuenta}/${slug}`, {
      titulo: serie.title,
      descripcion: serie.description,
      imagen: serie.cover,
    })
    for (const pieza of serie.pieces ?? []) {
      if (!SLUG.test(pieza.slug ?? '')) continue
      agregar(`/${cuenta}/${slug}/${pieza.slug}`, {
        titulo: pieza.title,
        descripcion: pieza.description && pieza.description !== '.' ? pieza.description : `${serie.title}, en la audioteca de tecnocooperativa.`,
        imagen: serie.cover,
        tipo: 'article',
      })
    }
  }
  return [...salida.values()]
}

async function main() {
  const dist = path.resolve(fileURLToPath(new URL('../dist', import.meta.url)))
  const html = await readFile(path.join(dist, 'index.html'), 'utf8')

  // Respaldo para rutas que aún no tienen página (lo publicado después del deploy).
  await writeFile(path.join(dist, '404.html'), html)

  let series
  try {
    const res = await fetch(`${API_URL}/audioteca/series`, { headers: { accept: 'application/json' } })
    if (!res.ok) throw new Error(`la API respondió ${res.status}`)
    series = (await res.json()).series ?? []
  } catch (error) {
    console.warn(`[paginas] sin páginas por ruta (${error.message}); queda solo 404.html`)
    return
  }

  const lista = paginas(html, series)
  for (const { ruta, html: contenido } of lista) {
    for (const destino of [path.join(dist, `${ruta}.html`), path.join(dist, ruta, 'index.html')]) {
      if (!destino.startsWith(dist + path.sep)) continue
      await mkdir(path.dirname(destino), { recursive: true })
      await writeFile(destino, contenido)
    }
  }
  console.log(`[paginas] ${lista.length} páginas desde ${series.length} series`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main()
}
