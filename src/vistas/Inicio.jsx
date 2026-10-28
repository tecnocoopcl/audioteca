import { usarApi } from '../usarApi.js'
import { Link, navegar } from '../ruta.jsx'
import { Cargando, Fallo, useTitulo } from './Estados.jsx'
import { descubrimientoDelDia } from '../descubrimiento.js'
import { duracion } from '../formato.js'
import { useReproductor } from '../Reproductor.jsx'
import { colaDeSerie } from '../serie.js'

export function Inicio() {
  useTitulo(null)
  const piezas = usarApi('piezas')
  const series = usarApi('series')
  const reproductor = useReproductor()
  const destacada = piezas.datos ? descubrimientoDelDia(piezas.datos.pieces) : null

  return (
    <>
      <section className="portada-inicio" aria-labelledby="titulo-inicio">
        <div className="presentacion">
          <p className="sobrelinea">Conocimiento compartido por los socios</p>
          <h1 id="titulo-inicio">Escucha, aprende y descubre</h1>
          <p>Charlas, crónicas, clases y relatos para acompañarte en la micro, en el camino o en casa.</p>
          <FormBuscar />
          <p className="ayuda">Busca por título, tema, etiqueta o autor.</p>
        </div>
        {destacada && <Descubrimiento pieza={destacada} escuchar={reproductor.escuchar} />}
      </section>

      <section className="ultimas-series" aria-labelledby="titulo-ultimas-series">
        <h2 id="titulo-ultimas-series">Lo último</h2>
        <p className="bajada-seccion">Series actualizadas recientemente en la audioteca de la cooperativa.</p>
        {series.cargando && !series.datos ? (
          <Cargando />
        ) : series.error ? (
          <Fallo {...series} />
        ) : (
          <ListaDeSeries series={series.datos.series} escuchar={reproductor.escuchar} />
        )}
      </section>
    </>
  )
}

function ListaDeSeries({ series, escuchar }) {
  const ordenadas = [...series].sort((a, b) => fechaReciente(b).localeCompare(fechaReciente(a)))
  if (!ordenadas.length) return <p className="estado">Todavía no hay series publicadas.</p>
  return (
    <div className="lista-series">
      {ordenadas.map((serie) => {
        const cola = colaDeSerie(serie)
        const descripcion = serie.description?.length > 180 ? `${serie.description.slice(0, 177).trim()}…` : serie.description
        return (
          <article className="tarjeta-serie" key={`${serie.account}/${serie.slug}`}>
            {serie.cover ? (
              <Link className="tarjeta-serie__portada" href={`/${serie.account}/${serie.slug}`} aria-label={`Ver serie ${serie.title}`}>
                <img src={serie.cover} alt="" />
              </Link>
            ) : (
              <div className="tarjeta-serie__portada tarjeta-serie__portada--vacia" aria-hidden="true">AUDIO</div>
            )}
            <div className="tarjeta-serie__contenido">
              <p className="sobrelinea">{serie.account} · {serie.pieces.length} {serie.pieces.length === 1 ? 'pieza' : 'piezas'}</p>
              <h3>
                <Link href={`/${serie.account}/${serie.slug}`}>{serie.title}</Link>
              </h3>
              {descripcion && <p>{descripcion}</p>}
              <div className="acciones tarjeta-serie__acciones">
                <button type="button" onClick={() => escuchar(cola[0], cola)} disabled={!cola.length}>Reproducir serie</button>
                <Link href={`/${serie.account}/${serie.slug}`}>Ver serie</Link>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}

function fechaReciente(serie) {
  return serie.pieces.reduce((ultima, pieza) => pieza.date > ultima ? pieza.date : ultima, '')
}

function Descubrimiento({ pieza, escuchar }) {
  const href = `/${pieza.account}/${pieza.serie}/${pieza.slug}`
  const descripcion = pieza.description?.length > 240 ? `${pieza.description.slice(0, 237).trim()}…` : pieza.description
  return (
    <aside className="descubrimiento" aria-labelledby="titulo-descubrimiento">
      <p className="sobrelinea">Descubrimiento del día</p>
      <h2 id="titulo-descubrimiento">
        <Link href={href}>{pieza.title}</Link>
      </h2>
      <p className="meta">{[pieza.serie_title, pieza.account, duracion(pieza.duration)].filter(Boolean).join(' · ')}</p>
      <p>{descripcion || `Una pieza de la serie «${pieza.serie_title}» para conocer algo nuevo hoy.`}</p>
      <div className="acciones descubrimiento__acciones">
        <button className="principal" type="button" onClick={() => escuchar(pieza)}>
          Escuchar ahora
        </button>
        <Link href={href}>Ver detalles</Link>
      </div>
    </aside>
  )
}

export function FormBuscar({ q = '', autoFocus = false }) {
  return (
    <form
      className="buscar"
      role="search"
      action="/buscar"
      onSubmit={(e) => {
        e.preventDefault()
        const texto = new FormData(e.currentTarget).get('q').trim()
        navegar(texto ? `/buscar?q=${encodeURIComponent(texto)}` : '/buscar')
      }}
    >
      <input
        name="q"
        type="search"
        defaultValue={q}
        placeholder="Título, tema, etiqueta, autor"
        aria-label="Buscar"
        autoFocus={autoFocus}
      />
      <button type="submit">Buscar</button>
    </form>
  )
}
