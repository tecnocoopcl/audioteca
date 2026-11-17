import { useEffect, useState } from 'react'
import { duracion, duracionHablada } from './formato.js'

/**
 * Controles propios del audio (el <audio> del navegador va sin `controls`:
 * cada navegador dibuja los suyos, con otro estilo y sin tinta).
 *
 * Accesibilidad (WCAG 2.2 AA):
 *  - todo se maneja con teclado; el control de posición es un <input range>
 *    nativo, con flechas, Inicio y Fin, más Re Pág / Av Pág para saltar 30 s;
 *  - cada botón tiene texto visible que es también su nombre accesible;
 *  - el estado se dice con palabras («Pausar» / «Reproducir»), no con color;
 *  - el lector de pantalla oye la posición en voz natural («3 minutos 20
 *    segundos de 20 minutos»), y el avance NO se anuncia cada segundo;
 *  - «Cargando…» y el error se anuncian (role status / alert);
 *  - blanco y negro (21:1), foco de 3 px, objetivos de 44 px y sin animación.
 */
export function PanelAudio({
  audio,
  pieza,
  sonando,
  velocidad,
  salto,
  hayCola,
  puedeAnterior,
  puedeSiguiente,
  onAnterior,
  onSiguiente,
  onSaltar,
  onVelocidad,
  onCerrar,
}) {
  const [actual, setActual] = useState(0)
  const [total, setTotal] = useState(pieza.duration || 0)
  const [cargando, setCargando] = useState(false)
  const [fallo, setFallo] = useState(false)

  // El tiempo vive aquí y no en el proveedor: así solo se redibuja el panel
  // (unas 4 veces por segundo), no toda la audioteca.
  useEffect(() => {
    const el = audio.current
    if (!el) return
    const medir = () => {
      setActual(el.currentTime || 0)
      if (Number.isFinite(el.duration) && el.duration > 0) setTotal(el.duration)
    }
    setActual(0)
    setTotal(pieza.duration || 0)
    setFallo(false)
    setCargando(true)
    const eventos = {
      timeupdate: medir,
      durationchange: medir,
      loadedmetadata: medir,
      seeked: medir,
      loadstart: () => setCargando(true),
      waiting: () => setCargando(true),
      canplay: () => setCargando(false),
      playing: () => setCargando(false),
      error: () => {
        setCargando(false)
        setFallo(true)
      },
    }
    for (const [nombre, f] of Object.entries(eventos)) el.addEventListener(nombre, f)
    return () => {
      for (const [nombre, f] of Object.entries(eventos)) el.removeEventListener(nombre, f)
    }
  }, [audio, pieza.file.url, pieza.duration])

  const alternar = () => {
    const el = audio.current
    if (!el) return
    if (el.paused) el.play().catch(() => setFallo(true))
    else el.pause()
  }

  const buscar = (segundos) => {
    const el = audio.current
    if (!el) return
    el.currentTime = segundos
    setActual(segundos)
  }

  const teclaPosicion = (e) => {
    if (e.key === 'PageUp') {
      e.preventDefault()
      onSaltar(salto)
    } else if (e.key === 'PageDown') {
      e.preventDefault()
      onSaltar(-salto)
    }
  }

  const avance = total > 0 ? Math.min(100, (actual / total) * 100) : 0
  const reloj = (s) => duracion(s) || '0:00'

  return (
    <div className="reproductor__panel">
      <div className="reproductor__posicion">
        <span className="reproductor__tiempo" aria-hidden="true">
          {reloj(actual)}
        </span>
        <input
          type="range"
          aria-label="Posición en la pieza"
          min={0}
          max={Math.floor(total) || 0}
          step={1}
          value={Math.min(Math.floor(actual), Math.floor(total) || 0)}
          disabled={!(total > 0)}
          aria-valuetext={`${duracionHablada(actual)} de ${duracionHablada(total)}`}
          style={{ '--avance': `${avance}%` }}
          onChange={(e) => buscar(Number(e.target.value))}
          onKeyDown={teclaPosicion}
        />
        <span className="reproductor__tiempo" aria-hidden="true">
          {reloj(total)}
        </span>
      </div>

      <p className="reproductor__estado" role="status">
        {cargando && !fallo ? 'Cargando…' : ''}
      </p>
      {fallo && (
        <p className="reproductor__error" role="alert">
          No se pudo reproducir este audio. Revisa tu conexión e inténtalo de nuevo.
        </p>
      )}

      <div className="reproductor__botones">
        <button type="button" className="principal reproductor__jugar" onClick={alternar}>
          {sonando ? 'Pausar' : 'Reproducir'}
        </button>
        {hayCola && (
          <button type="button" onClick={onAnterior} disabled={!puedeAnterior} aria-label="Pieza anterior de la serie">
            ← Anterior
          </button>
        )}
        <button type="button" onClick={() => onSaltar(-salto)}>
          Atrás {salto} s
        </button>
        <button type="button" onClick={() => onSaltar(salto)}>
          Adelante {salto} s
        </button>
        {hayCola && (
          <button type="button" onClick={onSiguiente} disabled={!puedeSiguiente} aria-label="Pieza siguiente de la serie">
            Siguiente →
          </button>
        )}
        <button type="button" onClick={onVelocidad}>
          Velocidad {velocidad}×
        </button>
        <button type="button" onClick={onCerrar} aria-label="Cerrar el reproductor">
          Cerrar
        </button>
      </div>
    </div>
  )
}
