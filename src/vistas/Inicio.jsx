import { usarApi } from '../usarApi.js'
import { plural } from '../formato.js'
import { Link, navegar } from '../ruta.jsx'
import { Cargando, Fallo, useTitulo } from './Estados.jsx'
import { ListaDePiezas, Paginas } from './Listas.jsx'

export function Inicio({ pagina }) {
  useTitulo(null)
  const tematicas = usarApi('tematicas')
  const piezas = usarApi('piezas', { pagina })

  return (
    <>
      <h1>Audioteca</h1>
      <p>Charlas, crónicas, clases y relatos de la tecno-cooperativa, para escuchar en la micro, en el camino o en casa.</p>
      <FormBuscar />

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
