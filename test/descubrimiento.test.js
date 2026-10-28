import assert from 'node:assert/strict'
import test from 'node:test'
import { descubrimientoDelDia, fechaLocal, indiceDelDia } from '../src/descubrimiento.js'

test('usa una fecha local sin desplazamientos de zona horaria', () => {
  assert.equal(fechaLocal(new Date(2026, 9, 27, 23, 30)), '2026-10-27')
})

test('elige siempre el mismo índice durante un día', () => {
  assert.equal(indiceDelDia('2026-10-27', 7), indiceDelDia('2026-10-27', 7))
  assert.ok(indiceDelDia('2026-10-27', 7) >= 0)
})

test('conserva la pieza guardada aunque cambie la lista', () => {
  const datos = new Map()
  const almacenamiento = { getItem: (k) => datos.get(k), setItem: (k, v) => datos.set(k, v) }
  const a = { title: 'A', file: { url: 'https://pod/a.mp3' } }
  const b = { title: 'B', file: { url: 'https://pod/b.mp3' } }
  const elegida = descubrimientoDelDia([a, b], almacenamiento, '2026-10-27')
  assert.deepEqual(descubrimientoDelDia([b], almacenamiento, '2026-10-27'), elegida)
})
