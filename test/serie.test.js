import assert from 'node:assert/strict'
import test from 'node:test'
import { colaDeSerie } from '../src/serie.js'

test('conserva el orden de la API y completa los metadatos de cada pieza', () => {
  const serie = {
    slug: 'historia',
    title: 'Una historia',
    cover: 'portada.jpg',
    pieces: [
      { slug: '01', file: { url: '1.mp3' } },
      { slug: '02', file: { url: '2.mp3' } },
      { slug: '03', file: { url: '3.mp3' } },
    ],
  }
  const cola = colaDeSerie(serie, 'ana')
  assert.deepEqual(cola.map((p) => p.slug), ['01', '02', '03'])
  assert.deepEqual(cola.map((p) => p.account), ['ana', 'ana', 'ana'])
  assert.equal(cola[0].serie_title, 'Una historia')
})
