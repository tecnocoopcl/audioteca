import { LICENCIAS, duracion, fecha, megas } from '../formato.js'
import { useReproductor } from '../Reproductor.jsx'
import { Link, conParametros } from '../ruta.jsx'
import { usarApi } from '../usarApi.js'
import { Cargando, Fallo, NoEncontrada, useTitulo } from './Estados.jsx'
import { colaDeSerie } from '../serie.js'

export function Pieza({ cuenta, serie: slugSerie, slug }) {
  const serie = usarApi(`series/${encodeURIComponent(cuenta)}/${encodeURIComponent(slugSerie)}`)
  const tematicas = usarApi('tematicas')
  const reproductor = useReproductor()
  const p = serie.datos?.pieces.find((x) => x.slug === slug)
  useTitulo(p?.title)

  if (serie.cargando) return <Cargando />
  if (serie.error) return <Fallo {...serie} />
  if (!p) return <NoEncontrada />

  const s = serie.datos
  const pieza = { ...p, account: cuenta, serie: s.slug, serie_title: s.title, cover: s.cover }
  const cola = colaDeSerie(s, cuenta)
  const actual = reproductor.pieza?.file.url === p.file.url
  const licencia = LICENCIAS[p.license] ?? LICENCIAS['cc-by-sa']
  const nombre = (t) => tematicas.datos?.topics.find((x) => x.slug === t)?.name ?? t

  return (
    <>
      <p className="meta">
        <Link href={`/${cuenta}/${s.slug}`}>{s.title}</Link> · <Link href={`/${cuenta}`}>{cuenta}</Link>
      </p>
      <h1>{p.title}</h1>
      {s.cover && <img className="portada" src={s.cover} alt="" />}

      <div className="acciones">
        <button
          type="button"
          className="principal"
          onClick={() => reproductor.escuchar(pieza, cola)}
          disabled={actual && reproductor.sonando}
        >
          {actual && reproductor.sonando ? 'Sonando' : actual ? 'Seguir escuchando' : 'Escuchar y continuar la serie'}
        </button>
        <a href={p.file.url} download>
          Descargar {p.file.format.toUpperCase()}
          {p.file.size ? ` (${megas(p.file.size)})` : ''}
        </a>
      </div>

      {p.description && <p>{p.description}</p>}

      <dl className="ficha">
        {p.duration > 0 && (
          <>
            <dt>Duración</dt>
            <dd>{duracion(p.duration)}</dd>
          </>
        )}
        {p.date && (
          <>
            <dt>Fecha</dt>
            <dd>{fecha(p.date)}</dd>
          </>
        )}
        <dt>Temáticas</dt>
        <dd>
          {p.topics.map((t, i) => (
            <span key={t}>
              {i > 0 && ', '}
              <Link href={`/tematica/${t}`}>{nombre(t)}</Link>
            </span>
          ))}
        </dd>
        {p.tags.length > 0 && (
          <>
            <dt>Etiquetas</dt>
            <dd>
              {p.tags.map((t, i) => (
                <span key={t}>
                  {i > 0 && ', '}
                  <Link href={conParametros('/buscar', { q: t })}>{t}</Link>
                </span>
              ))}
            </dd>
          </>
        )}
        <dt>Licencia</dt>
        <dd>{licencia.url ? <a href={licencia.url}>{licencia.nombre}</a> : licencia.nombre}</dd>
      </dl>
    </>
  )
}
