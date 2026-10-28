import { RSS_URL } from './api.js'
import { ProveedorReproductor } from './Reproductor.jsx'
import { Link, useRuta } from './ruta.jsx'
import { Autor } from './vistas/Autor.jsx'
import { Buscar } from './vistas/Buscar.jsx'
import { Inicio } from './vistas/Inicio.jsx'
import { NoEncontrada } from './vistas/Estados.jsx'
import { Pieza } from './vistas/Pieza.jsx'
import { Serie } from './vistas/Serie.jsx'
import { Tematica } from './vistas/Tematica.jsx'

/**
 * Audioteca de la tecno-cooperativa. El contenido no vive aquí: cada socio
 * lo publica desde Estudio (espacio) en su pod, y tecno-cooperativa-backend
 * lo indexa. Esta app solo lee esa API.
 *
 * Pensada para pantallas de tinta: negro sobre blanco, nada que se anime,
 * páginas numeradas en vez de scroll infinito.
 */
export default function App() {
  const ruta = useRuta()

  return (
    <ProveedorReproductor>
      <a className="saltar" href="#contenido">Saltar al contenido</a>
      <header className="barra">
        <Link className="marca" href="/">
          AUDIOTECA
        </Link>
        <nav aria-label="Navegación principal">
          <Link href="/" aria-current={ruta.vista === 'inicio' ? 'page' : undefined}>Inicio</Link>
          <Link href="/buscar" aria-current={ruta.vista === 'buscar' ? 'page' : undefined}>Buscar</Link>
          <a href={RSS_URL}>Seguir por RSS</a>
        </nav>
      </header>
      <main id="contenido">
        <Vista ruta={ruta} />
      </main>
      <footer className="pie">
        <p>Audios de los socios de la tecno-cooperativa. Cada uno vive en el pod de quien lo hizo; aquí solo se leen.</p>
        <p>
          Escúchalos sin conexión en tu app de podcasts: <a href={RSS_URL}>feed RSS</a>.
        </p>
      </footer>
    </ProveedorReproductor>
  )
}

function Vista({ ruta }) {
  switch (ruta.vista) {
    case 'inicio':
      return <Inicio pagina={ruta.pagina} />
    case 'tematica':
      return <Tematica slug={ruta.tematica} pagina={ruta.pagina} />
    case 'buscar':
      return <Buscar key={ruta.q} q={ruta.q} pagina={ruta.pagina} />
    case 'autor':
      return <Autor cuenta={ruta.cuenta} />
    case 'serie':
      return <Serie cuenta={ruta.cuenta} slug={ruta.serie} />
    case 'pieza':
      return <Pieza cuenta={ruta.cuenta} serie={ruta.serie} slug={ruta.pieza} />
    default:
      return <NoEncontrada />
  }
}
