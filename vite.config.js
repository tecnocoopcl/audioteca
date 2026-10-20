import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base absoluta: la app también se sirve en /<cuenta>/<serie>/<pieza>, y con
// rutas relativas los assets se buscarían ahí.
export default defineConfig({
  base: '/',
  plugins: [react()],
})
