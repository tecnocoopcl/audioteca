import { duracion, fecha } from '../formato.js'
import { Link, conParametros } from '../ruta.jsx'

/** Piezas de varias series: con su serie y autor. */
export function ListaDePiezas({ piezas }) {
  if (!piezas.length) return <p className="estado">Todavía no hay nada aquí.</p>
  return (
    <ul className="lista">
      {piezas.map((p) => (
        <li key={`${p.account}/${p.serie}/${p.slug}`}>
          <Link className="titulo" href={`/${p.account}/${p.serie}/${p.slug}`}>
            {p.title}
          </Link>
          <p className="meta">{[p.serie_title, p.account, duracion(p.duration), fecha(p.date)].filter(Boolean).join(' · ')}</p>
        </li>
      ))}
    </ul>
  )
}

/** ← Anterior · Página n de m · Siguiente → */
export function Paginas({ ruta, parametros = {}, page, pages }) {
  if (pages <= 1) return null
  return (
    <nav className="paginas" aria-label="Páginas">
      {page > 1 ? <Link href={conParametros(ruta, { ...parametros, pagina: page - 1 })}>← Anterior</Link> : <span />}
      <span>
        Página {page} de {pages}
      </span>
      {page < pages ? <Link href={conParametros(ruta, { ...parametros, pagina: page + 1 })}>Siguiente →</Link> : <span />}
    </nav>
  )
}
