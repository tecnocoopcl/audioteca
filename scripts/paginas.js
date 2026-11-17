// Después de `vite build`: prerenderiza la audioteca con lo que hay en la API.
// Cada cuenta, serie y pieza publicada, la portada y /buscar quedan como HTML
// con la vista ya hecha (se lee sin JavaScript), con su título, descripción y
// portada para buscadores y previsualizadores de enlaces:
//
//   dist/index.html  y  dist/buscar.html
//   dist/<cuenta>.html                  y  dist/<cuenta>/index.html
//   dist/<cuenta>/<serie>.html          y  dist/<cuenta>/<serie>/index.html
//   dist/<cuenta>/<serie>/<pieza>.html  y  dist/<cuenta>/<serie>/<pieza>/index.html
//
// GitHub Pages sirve /a/b desde a/b.html con 200; sin ese archivo redirigiría
// (301) a /a/b/. El index.html cubre a quien llegue con la barra final.
//
// Las respuestas de la API que usa cada vista quedan además en dist/_datos/
// (ver src/datos.js): al navegar, la app las lee de ahí y no de la API. Solo
// las escuchas y las búsquedas van siempre a la API.
//
// Lo que se publique entre un deploy y otro carga por 404.html (la app sin
// prerender), que se lo pide a la API. Si la API no responde al construir, el
// build no falla: queda solo ese respaldo.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

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

/**
 * Pone la vista prerenderizada dentro de #root y, después, las respuestas de
 * la API con que se hizo, para que el navegador hidrate sin pedirlas.
 */
export function conContenido(html, { ruta, marcado, datos }) {
  // En un <script>, «</script>» o «<!--» cortarían el JSON: se escapa «<».
  const json = JSON.stringify(datos).replace(/</g, '\\u003c')
  return html.replace(
    /<div id="root"><\/div>/,
    () =>
      `<div id="root" data-prerender="${escapar(ruta)}">${marcado}</div>\n    ` +
      `<script type="application/json" id="datos-iniciales">${json}</script>`,
  )
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

/** Pide a la API lo que necesita cada vista, una sola vez por petición. */
function pedidor() {
  const hechas = new Map()
  return (ruta, parametros) => {
    const url = new URL(`${API_URL}/audioteca/${ruta}`)
    for (const [k, v] of Object.entries(parametros)) url.searchParams.set(k, v)
    if (!hechas.has(url.href)) {
      hechas.set(
        url.href,
        fetch(url, { headers: { accept: 'application/json' } }).then((res) => {
          if (!res.ok) throw new Error(`${url.pathname} respondió ${res.status}`)
          return res.json()
        }),
      )
    }
    return hechas.get(url.href)
  }
}

async function escribir(dist, relativo, contenido) {
  const destino = path.join(dist, relativo)
  if (!destino.startsWith(dist + path.sep)) return
  await mkdir(path.dirname(destino), { recursive: true })
  await writeFile(destino, contenido)
}

async function main() {
  const raiz = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
  const dist = path.join(raiz, 'dist')
  const html = await readFile(path.join(dist, 'index.html'), 'utf8')

  // Respaldo para rutas que aún no tienen página (lo publicado después del deploy).
  await writeFile(path.join(dist, '404.html'), html)

  const pedir = pedidor()
  let series
  try {
    series = (await pedir('series', {})).series ?? []
  } catch (error) {
    console.warn(`[paginas] sin prerender (${error.message}); queda solo 404.html`)
    return
  }

  const app = await import(pathToFileURL(path.join(raiz, 'dist-servidor', 'servidor.js')).href)
  const copias = new Map()

  // La vista de `ruta` ya hecha, o null si la API no dio lo que necesita.
  async function prerender(ruta) {
    const datos = {}
    try {
      for (const [r, parametros] of app.necesita(app.parseRuta({ pathname: ruta, search: '' }))) {
        const respuesta = await pedir(r, parametros)
        datos[app.claveApi(r, parametros)] = respuesta
        const archivo = app.archivoEstatico(r, parametros)
        if (archivo) copias.set(archivo, respuesta)
      }
    } catch (error) {
      console.warn(`[paginas] ${ruta} sin prerender (${error.message})`)
      return null
    }
    return { ruta, datos, marcado: app.render(ruta, datos) }
  }

  const portada = await prerender('/')
  if (portada) await writeFile(path.join(dist, 'index.html'), conContenido(html, portada))
  const conTitulo = html.replace(/<title>[^<]*<\/title>/, '<title>Buscar · Audioteca</title>')
  const buscar = await prerender('/buscar')
  await escribir(dist, 'buscar.html', buscar ? conContenido(conTitulo, buscar) : conTitulo)

  const lista = paginas(html, series)
  for (const pagina of lista) {
    const vista = await prerender(pagina.ruta)
    const contenido = vista ? conContenido(pagina.html, vista) : pagina.html
    await escribir(dist, `${pagina.ruta}.html`, contenido)
    await escribir(dist, path.join(pagina.ruta, 'index.html'), contenido)
  }

  for (const [archivo, respuesta] of copias) {
    await escribir(dist, path.join('_datos', ...archivo.split('/')), JSON.stringify(respuesta))
  }
  console.log(`[paginas] ${lista.length + 2} páginas y ${copias.size} copias de la API, desde ${series.length} series`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main()
}
