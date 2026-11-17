// Entrada para prerenderizar en Node (vite build --ssr). La usa
// scripts/paginas.js: no llega al navegador.
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'

import App from './App.jsx'
import { DatosIniciales } from './datos.js'

export { archivoEstatico, claveApi, necesita } from './datos.js'
export { parseRuta } from './ruta.jsx'

/** El HTML de la app en `pathname`, con las respuestas de la API ya dadas. */
export function render(pathname, datos) {
  return renderToString(
    <StrictMode>
      <DatosIniciales.Provider value={datos}>
        <App ubicacion={{ pathname, search: '' }} />
      </DatosIniciales.Provider>
    </StrictMode>,
  )
}
