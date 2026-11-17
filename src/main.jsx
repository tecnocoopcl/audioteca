import React from 'react'
import ReactDOM from 'react-dom/client'

import './index.css'
import App from './App.jsx'
import { DatosIniciales } from './datos.js'
import { parseRuta } from './ruta.jsx'

const root = document.getElementById('root')

// Las páginas que escribe el build (scripts/paginas.js) traen la vista ya
// hecha y las respuestas de la API que usó: se hidratan sin pedir nada. Si la
// URL pide otra cosa (/buscar?q=…) o es 404.html, se arma desde cero.
const prerender = root.dataset.prerender
const igual = (a, b) => JSON.stringify(parseRuta(a)) === JSON.stringify(parseRuta(b))

if (prerender != null && igual({ pathname: prerender, search: '' }, window.location)) {
  let datos = {}
  try {
    datos = JSON.parse(document.getElementById('datos-iniciales')?.textContent || '{}')
  } catch {
    // Sin datos, cada vista los pide.
  }
  ReactDOM.hydrateRoot(
    root,
    <React.StrictMode>
      <DatosIniciales.Provider value={datos}>
        <App />
      </DatosIniciales.Provider>
    </React.StrictMode>,
  )
} else {
  root.textContent = ''
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}
