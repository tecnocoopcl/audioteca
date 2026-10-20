import { plural } from '../formato.js'
import { Link } from '../ruta.jsx'
import { usarApi } from '../usarApi.js'
import { Cargando, Fallo, NoEncontrada, useTitulo } from './Estados.jsx'

export function Autor({ cuenta }) {
  useTitulo(cuenta)
  const series = usarApi('series', { cuenta })

  if (series.cargando) return <Cargando />
  if (series.error) return <Fallo {...series} />
  if (!series.datos.series.length) return <NoEncontrada />

  return (
    <>
      <h1>{cuenta}</h1>
      <h2>Series</h2>
      <ul className="lista">
        {series.datos.series.map((s) => (
          <li key={s.slug}>
            <Link className="titulo" href={`/${cuenta}/${s.slug}`}>
              {s.title}
            </Link>
            <p className="meta">{plural(s.pieces.length, 'pieza', 'piezas')}</p>
          </li>
        ))}
      </ul>
    </>
  )
}
