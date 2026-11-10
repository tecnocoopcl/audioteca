import assert from 'node:assert/strict'
import test from 'node:test'
import { claveDePieza, fueEscuchada, marcarEscuchada, seguimiento, textoDeEscuchas, umbral } from '../src/escuchas.js'

/** Simula `timeupdate` cada 0,25 s desde `desde` hasta `hasta`. */
function sonar(s, desde, hasta, duracion) {
  const resultados = []
  for (let t = desde; t <= hasta + 1e-9; t += 0.25) resultados.push(s.avanzar(t, duracion))
  return resultados
}

test('el umbral es el 80 % o 5 minutos, lo que llegue antes', () => {
  assert.equal(umbral(100), 80)
  assert.equal(umbral(3600), 300)
  assert.equal(umbral(375), 300)
  assert.equal(umbral(0), 300)
  assert.equal(umbral(Number.NaN), 300)
})

test('una pieza corta cuenta al oír el 80 %, una sola vez', () => {
  const s = seguimiento()
  s.desde(0)
  const r = sonar(s, 0, 100, 100)
  assert.equal(r.filter((x) => x.escucha).length, 1)
  const i = r.findIndex((x) => x.escucha)
  assert.ok(Math.abs(i * 0.25 - 80) <= 0.25, `contó a los ${i * 0.25} s`)
})

test('una charla larga cuenta a los 5 minutos', () => {
  const s = seguimiento()
  s.desde(0)
  const r = sonar(s, 0, 299, 3600)
  assert.equal(r.some((x) => x.escucha), false)
  assert.equal(s.avanzar(300.25, 3600).escucha, true)
})

test('adelantar no suma: saltar al final no es escuchar', () => {
  const s = seguimiento()
  s.desde(0)
  sonar(s, 0, 10, 100)
  assert.equal(s.avanzar(95, 100).escucha, false) // salto de +85 s
  assert.ok(s.oido < 11)
  // Si tras el salto se sigue oyendo, eso sí suma desde ahí.
  sonar(s, 95.25, 100, 100)
  assert.ok(s.oido < 16)
  assert.equal(s.contada, false)
})

test('retomar donde iba no cuenta el tramo anterior', () => {
  const s = seguimiento()
  s.desde(600) // la posición guardada de la última vez
  assert.equal(s.avanzar(600.25, 3600).escucha, false)
  assert.ok(s.oido <= 0.25)
})

test('avisa los minutos completos una sola vez', () => {
  const s = seguimiento()
  s.desde(0)
  const minutos = sonar(s, 0, 150, 3600).reduce((n, x) => n + x.minutos, 0)
  assert.equal(minutos, 2)
})

test('la marca de escuchada se guarda por pieza y no rompe sin almacenamiento', () => {
  const datos = new Map()
  const storage = { getItem: (k) => datos.get(k) ?? null, setItem: (k, v) => datos.set(k, v) }
  const p = { account: 'ale', serie: 'memoria', slug: 'el-ascensor' }
  assert.equal(claveDePieza(p), 'ale/memoria/el-ascensor')
  assert.equal(fueEscuchada(p, storage), false)
  marcarEscuchada(p, storage, new Date('2026-11-10T12:00:00Z'))
  assert.equal(fueEscuchada(p, storage), true)
  assert.equal(fueEscuchada({ ...p, slug: 'otra' }, storage), false)

  const roto = {
    getItem() {
      throw new Error('bloqueado')
    },
    setItem() {
      throw new Error('bloqueado')
    },
  }
  assert.doesNotThrow(() => marcarEscuchada(p, roto))
  assert.equal(fueEscuchada(p, roto), false)
  assert.equal(fueEscuchada(p, null), false)
})

test('el texto de escuchas', () => {
  assert.equal(textoDeEscuchas(0), '')
  assert.equal(textoDeEscuchas(undefined), '')
  assert.equal(textoDeEscuchas(1), '1 escucha')
  assert.equal(textoDeEscuchas(12), '12 escuchas')
})
