import { useEffect } from 'react'
import { Link } from '../ruta.jsx'

export function Cargando() {
  return <p className="estado">Cargando…</p>
}

export function Fallo({ error, reintentar }) {
  if (error?.status === 404) return <NoEncontrada />
  return (
    <div className="estado">
      <p>No se pudo cargar la audioteca. Revisa tu conexión.</p>
      <button type="button" onClick={reintentar}>
        Reintentar
      </button>
    </div>
  )
}

export function NoEncontrada() {
  useTitulo('No está aquí')
  return (
    <>
      <h1>No está aquí</h1>
      <p>Puede que la dirección esté mal, o que su autor haya dejado de publicarlo.</p>
      <p>
        <Link href="/">Volver al inicio</Link>
      </p>
    </>
  )
}

export function useTitulo(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} · Audioteca` : 'Audioteca'
  }, [titulo])
}
