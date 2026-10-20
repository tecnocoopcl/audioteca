import { API_URL } from '../api.js'
import { plural } from '../formato.js'
import { usarApi } from '../usarApi.js'
import { Cargando, Fallo, NoEncontrada, useTitulo } from './Estados.jsx'
import { ListaDePiezas, Paginas } from './Listas.jsx'

export function Tematica({ slug, pagina }) {
  const tematicas = usarApi('tematicas')
  const piezas = usarApi('piezas', { tematica: slug, pagina })
  const tematica = tematicas.datos?.topics.find((t) => t.slug === slug)
  useTitulo(tematica?.name)

  if (tematicas.cargando) return <Cargando />
  if (tematicas.error) return <Fallo {...tematicas} />
  if (!tematica) return <NoEncontrada />

  return (
    <>
      <h1>{tematica.name}</h1>
      <p className="meta">
        {piezas.datos ? `${plural(piezas.datos.total, 'pieza', 'piezas')} · ` : ''}
        <a href={`${API_URL}/audioteca/rss/${slug}`}>RSS de {tematica.name}</a>
      </p>
      {piezas.cargando && !piezas.datos ? (
        <Cargando />
      ) : piezas.error ? (
        <Fallo {...piezas} />
      ) : (
        <>
          <ListaDePiezas piezas={piezas.datos.pieces} />
          <Paginas ruta={`/tematica/${slug}`} {...piezas.datos} />
        </>
      )}
    </>
  )
}
