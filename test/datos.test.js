import assert from 'node:assert/strict'
import test from 'node:test'
import { apiSerie, archivoEstatico, claveApi, necesita } from '../src/datos.js'

test('copias estáticas de lo que se puede copiar', () => {
  assert.equal(archivoEstatico('series'), 'series.json')
  assert.equal(archivoEstatico('series', { cuenta: 'ana' }), 'cuentas/ana.json')
  assert.equal(archivoEstatico('piezas', {}), 'piezas.json')
  assert.equal(archivoEstatico(apiSerie('ana', 'panorama')), 'series/ana/panorama.json')
})

test('búsquedas, páginas siguientes y escuchas van siempre a la API', () => {
  assert.equal(archivoEstatico('piezas', { q: 'ia', pagina: 1 }), null)
  assert.equal(archivoEstatico('piezas', { pagina: 2 }), null)
  assert.equal(archivoEstatico('escuchas', { cuenta: 'ana' }), null)
  assert.equal(archivoEstatico('series', { cuenta: 'ana', pagina: 2 }), null)
  assert.equal(archivoEstatico(null, { q: '' }), null)
})

test('cada vista pide lo mismo al prerenderizar y en el navegador', () => {
  assert.deepEqual(necesita({ vista: 'inicio' }).map(([r, p]) => claveApi(r, p)), [claveApi('series'), claveApi('piezas')])
  assert.deepEqual(necesita({ vista: 'autor', cuenta: 'ana' }), [['series', { cuenta: 'ana' }]])
  assert.deepEqual(necesita({ vista: 'pieza', cuenta: 'ana', serie: 'p', pieza: 'x' }), [['series/ana/p', {}]])
  assert.deepEqual(necesita({ vista: 'buscar', q: 'ia' }), [])
})
