import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Link } from './ruta.jsx'

/**
 * El reproductor vive fuera de las vistas: se puede seguir navegando la
 * audioteca mientras suena una pieza, como en la micro con el teléfono.
 *
 * Recuerda por dónde iba cada pieza (en este navegador): una charla de una
 * hora rara vez se escucha de una sola vez. En la pantalla bloqueada muestra
 * título y autor (Media Session) y responde a sus botones.
 */

const Contexto = createContext(null)

export function useReproductor() {
  return useContext(Contexto)
}

const VELOCIDADES = [1, 1.25, 1.5, 0.75]
const SALTO = 30

function claveDePosicion(pieza) {
  return `audioteca:posicion:${pieza.file.url}`
}

function leerPosicion(pieza) {
  try {
    return Number(localStorage.getItem(claveDePosicion(pieza))) || 0
  } catch {
    return 0
  }
}

function guardarPosicion(pieza, segundos) {
  try {
    if (segundos > 5) localStorage.setItem(claveDePosicion(pieza), String(Math.floor(segundos)))
    else localStorage.removeItem(claveDePosicion(pieza))
  } catch {
    // Sin almacenamiento (ventana privada): se empieza desde el principio.
  }
}

export function ProveedorReproductor({ children }) {
  const [pieza, setPieza] = useState(null)
  const [sonando, setSonando] = useState(false)
  const [velocidad, setVelocidad] = useState(1)
  const audio = useRef(null)

  const escuchar = (p) => {
    if (pieza?.file.url === p.file.url) {
      audio.current?.play()
      return
    }
    setPieza(p)
  }

  // Al cambiar de pieza: retomar donde iba y anunciarla al sistema.
  useEffect(() => {
    const el = audio.current
    if (!pieza || !el) return
    const desde = leerPosicion(pieza)
    const alCargar = () => {
      if (desde && desde < el.duration - 10) el.currentTime = desde
      el.playbackRate = velocidad
      el.play().catch(() => {})
    }
    el.addEventListener('loadedmetadata', alCargar, { once: true })
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: pieza.title,
        artist: pieza.account,
        album: pieza.serie_title,
        artwork: pieza.cover ? [{ src: pieza.cover }] : [],
      })
      navigator.mediaSession.setActionHandler('seekbackward', () => (el.currentTime = Math.max(0, el.currentTime - SALTO)))
      navigator.mediaSession.setActionHandler('seekforward', () => (el.currentTime = el.currentTime + SALTO))
    }
    return () => el.removeEventListener('loadedmetadata', alCargar)
    // velocidad se aplica aparte; no debe reiniciar la pieza.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pieza])

  useEffect(() => {
    if (audio.current) audio.current.playbackRate = velocidad
  }, [velocidad])

  const saltar = (segundos) => {
    const el = audio.current
    if (el) el.currentTime = Math.max(0, el.currentTime + segundos)
  }

  return (
    <Contexto.Provider value={{ pieza, sonando, escuchar }}>
      {children}
      {pieza && (
        <section className="reproductor" aria-label="Reproductor">
          <p className="reproductor__titulo">
            <Link href={`/${pieza.account}/${pieza.serie}/${pieza.slug}`}>{pieza.title}</Link>
            <span> · {pieza.account}</span>
          </p>
          <audio
            ref={audio}
            src={pieza.file.url}
            controls
            preload="metadata"
            onPlay={() => setSonando(true)}
            onPause={(e) => {
              setSonando(false)
              guardarPosicion(pieza, e.currentTarget.currentTime)
            }}
            onTimeUpdate={(e) => {
              // Cada ~15 s basta: escribir en cada evento es gastar batería.
              const t = e.currentTarget.currentTime
              if (Math.floor(t) % 15 === 0) guardarPosicion(pieza, t)
            }}
            onEnded={() => {
              setSonando(false)
              guardarPosicion(pieza, 0)
            }}
          />
          <div className="reproductor__botones">
            <button type="button" onClick={() => saltar(-SALTO)}>
              −{SALTO} s
            </button>
            <button type="button" onClick={() => saltar(SALTO)}>
              +{SALTO} s
            </button>
            <button
              type="button"
              onClick={() => setVelocidad((v) => VELOCIDADES[(VELOCIDADES.indexOf(v) + 1) % VELOCIDADES.length])}
              aria-label={`Velocidad ${velocidad}×`}
            >
              {velocidad}×
            </button>
            <button
              type="button"
              onClick={() => {
                if (audio.current) guardarPosicion(pieza, audio.current.currentTime)
                setPieza(null)
              }}
              aria-label="Cerrar el reproductor"
            >
              Cerrar
            </button>
          </div>
        </section>
      )}
    </Contexto.Provider>
  )
}
