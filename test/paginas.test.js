import assert from 'node:assert/strict'
import test from 'node:test'
import { conMetadatos, paginas } from '../scripts/paginas.js'

const HTML = `<html><head>
<meta
  name="description"
  content="Audioteca de tecnocooperativa."
/>
<title>Audioteca</title>
</head><body><div id="root"></div></body></html>`

const SERIES = [
  {
    slug: 'panorama',
    title: 'Panorama digital',
    description: 'Leyes, IA y centros de datos.',
    cover: 'https://pod/portada.jpg',
    account: 'ana',
    project_name: 'Ana',
    pieces: [
      { slug: 'uno', title: 'Uno', description: 'Primera pieza.' },
      { slug: 'dos', title: 'Dos', description: '.' },
    ],
  },
  { slug: 'otra', title: 'Otra', description: '', account: 'ana', pieces: [] },
]

test('una página por cuenta, serie y pieza', () => {
  const rutas = paginas(HTML, SERIES).map((p) => p.ruta)
  assert.deepEqual(rutas, ['/ana', '/ana/panorama', '/ana/panorama/uno', '/ana/panorama/dos', '/ana/otra'])
})

test('cada página lleva su título, descripción y Open Graph', () => {
  const pieza = paginas(HTML, SERIES).find((p) => p.ruta === '/ana/panorama/uno').html
  assert.match(pieza, /<title>Uno · Audioteca<\/title>/)
  assert.match(pieza, /<meta name="description" content="Primera pieza\." \/>/)
  assert.match(pieza, /og:image" content="https:\/\/pod\/portada\.jpg"/)
  assert.match(pieza, /rel="canonical" href="https:\/\/audioteca\.tecnocooperativa\.cl\/ana\/panorama\/uno"/)
  assert.equal(pieza.match(/name="description"/g).length, 1)
})

test('una pieza sin descripción usa la de la serie', () => {
  const dos = paginas(HTML, SERIES).find((p) => p.ruta === '/ana/panorama/dos').html
  assert.match(dos, /content="Panorama digital, en la audioteca de tecnocooperativa\."/)
})

test('escapa lo que viene de la API', () => {
  const html = conMetadatos(HTML, { titulo: '"><script>x</script>', descripcion: 'a & b', ruta: '/x' })
  assert.doesNotMatch(html, /<script>x/)
  assert.match(html, /&quot;&gt;&lt;script&gt;/)
  assert.match(html, /a &amp; b/)
})

test('ignora slugs que no son seguros como ruta de archivo', () => {
  const malas = [
    { slug: '../etc', title: 'x', account: 'ana', pieces: [] },
    { slug: 'ok', title: 'x', account: '..', pieces: [] },
    { slug: 'ok', title: 'x', account: 'ana', pieces: [{ slug: 'a/b', title: 'y' }] },
  ]
  assert.deepEqual(paginas(HTML, malas).map((p) => p.ruta), ['/ana', '/ana/ok'])
})
