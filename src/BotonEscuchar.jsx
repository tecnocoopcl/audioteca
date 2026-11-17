import { useReproductor } from './Reproductor.jsx'

/** «Escuchar» de una pieza en una lista; mientras suena dice «Reproduciendo». */
export function BotonEscuchar({ pieza, cola }) {
  const reproductor = useReproductor()
  const actual = reproductor.pieza?.file.url === pieza.file.url
  const suena = actual && reproductor.sonando
  return (
    <button
      type="button"
      className={suena ? 'reproduciendo' : undefined}
      onClick={() => reproductor.escuchar(pieza, cola)}
    >
      {suena ? 'Reproduciendo' : actual ? 'Seguir escuchando' : 'Escuchar'}
    </button>
  )
}
