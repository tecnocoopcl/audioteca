import { usarApi } from '../usarApi.js'
import { plural } from '../formato.js'
import { Link, navegar } from '../ruta.jsx'
import { Cargando, Fallo, useTitulo } from './Estados.jsx'
import { ListaDePiezas, Paginas } from './Listas.jsx'
import { descubrimientoDelDia } from '../descubrimiento.js'
import { duracion } from '../formato.js'
import { useReproductor } from '../Reproductor.jsx'

export function Inicio({ pagina }) {
  useTitulo(null)
  const tematicas = usarApi('tematicas')
  const piezas = usarApi('piezas', { pagina })
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

      <h2>Temáticas</h2>
      {tematicas.cargando ? (
        <Cargando />
      ) : tematicas.error ? (
        <Fallo {...tematicas} />
      ) : (
        <ul className="tematicas">
          {tematicas.datos.topics.map((t) => (
            <li key={t.slug}>
              <Link href={`/tematica/${t.slug}`}>
                {t.name}
                <span>{plural(t.count, 'pieza', 'piezas')}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <h2>Lo último</h2>
      {piezas.cargando && !piezas.datos ? (
        <Cargando />
      ) : piezas.error ? (
        <Fallo {...piezas} />
      ) : (
        <>
          <ListaDePiezas piezas={piezas.datos.pieces} />
          <Paginas ruta="/" {...piezas.datos} />
        </>
      )}
    </>
  )
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
