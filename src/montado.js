import { useEffect, useState } from 'react'

/**
 * false en el servidor y en el primer render del navegador; true después.
 * Lo que depende de este navegador (localStorage, la fecha de hoy) espera a
 * esto para no contradecir el HTML prerenderizado al hidratar.
 */
export function useMontado() {
  const [montado, setMontado] = useState(false)
  useEffect(() => setMontado(true), [])
  return montado
}
