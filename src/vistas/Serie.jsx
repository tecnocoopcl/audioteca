import { duracion, fecha } from '../formato.js'
import { Link } from '../ruta.jsx'
import { usarApi } from '../usarApi.js'
import { Cargando, Fallo, useTitulo } from './Estados.jsx'
import { useReproductor } from '../Reproductor.jsx'
import { colaDeSerie } from '../serie.js'

export function Serie({ cuenta, slug }) {
  const serie = usarApi(`series/${encodeURIComponent(cuenta)}/${encodeURIComponent(slug)}`)
  const tematicas = usarApi('tematicas')
  const reproductor = useReproductor()
  useTitulo(serie.datos?.title)

  if (serie.cargando) return <Cargando />
  if (serie.error) return <Fallo {...serie} />
  const s = serie.datos
  const nombre = (t) => tematicas.datos?.topics.find((x) => x.slug === t)?.name ?? t
  const cola = colaDeSerie(s, cuenta)

  return (
    <>
      <h1>{s.title}</h1>
      <p className="meta">
        Una serie de <Link href={`/${cuenta}`}>{cuenta}</Link>
      </p>
      {s.cover && <img className="portada" src={s.cover} alt="" />}
      {s.description && <p>{s.description}</p>}
      {cola.length > 0 && (
        <div className="acciones">
          <button className="principal" type="button" onClick={() => reproductor.escuchar(cola[0], cola)}>
            Reproducir serie desde el comienzo
          </button>
          <span className="ayuda">Las piezas continuarán automáticamente.</span>
        </div>
      )}
      <h2>Piezas</h2>
      <ul className="lista">
        {s.pieces.map((p) => (
          <li key={p.slug}>
            <div className="fila-pieza">
              <Link className="titulo" href={`/${cuenta}/${s.slug}/${p.slug}`}>
                {p.title}
              </Link>
              <button type="button" onClick={() => reproductor.escuchar(cola.find((item) => item.slug === p.slug), cola)}>
                Escuchar
              </button>
            </div>
            <p className="meta">
              {[duracion(p.duration), p.topics.map(nombre).join(', '), fecha(p.date)].filter(Boolean).join(' · ')}
            </p>
          </li>
        ))}
      </ul>
    </>
  )
}
