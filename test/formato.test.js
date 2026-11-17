import assert from 'node:assert/strict'
import { test } from 'node:test'
import { duracionHablada } from '../src/formato.js'

test('duracionHablada dice la duración como se oiría', () => {
  assert.equal(duracionHablada(0), '0 segundos')
  assert.equal(duracionHablada(1), '1 segundo')
  assert.equal(duracionHablada(60), '1 minuto')
  assert.equal(duracionHablada(1240), '20 minutos 40 segundos')
  assert.equal(duracionHablada(3725), '1 hora 2 minutos 5 segundos')
  assert.equal(duracionHablada(NaN), '0 segundos')
})
