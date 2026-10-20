# audioteca

La audioteca de la tecno-cooperativa (audioteca.aebn.cl): charlas, crónicas,
clases y relatos de los socios, ordenados por temática, para escuchar en la
micro, en el camino o en casa.

Como [música](https://github.com/tecnocoopcl/musica), el contenido no vive
aquí: cada socio lo publica desde **Estudio** (en
[espacio](https://github.com/tecnocoopcl/espacio)) en su propio pod, y esta app
solo lo lee. El diseño completo está en el ADR-021 de espacio.

```
pod del socio                                    tecno-cooperativa-backend          esta app
<pod>/Aplicaciones/estudio/data/audioteca.json → GET /audioteca/tematicas        → /
                               audioteca/…mp3     GET /audioteca/piezas           → /tematica/<slug>, /buscar
                                                  GET /audioteca/series[/…]       → /<cuenta>[/<serie>[/<pieza>]]
                                                  GET /audioteca/rss[/<tematica>] → apps de podcasts
```

Los audios se reproducen directo desde el pod de cada socio.

## Rutas

- `/`: temáticas y lo último publicado.
- `/tematica/<slug>`: una temática, paginada.
- `/buscar?q=`: busca en título, descripción, etiquetas, serie y autor.
- `/<cuenta>`: las series de un autor.
- `/<cuenta>/<serie>`: una serie, con sus piezas.
- `/<cuenta>/<serie>/<pieza>`: una pieza, para escuchar o descargar.

El router es mínimo y sin dependencias (`src/ruta.jsx`). En GitHub Pages
cualquier ruta llega a la app porque el deploy copia `index.html` a `404.html`.

## Pensada para pantallas de tinta

Negro sobre blanco, bordes de 1 px, nada que se anime y páginas numeradas en
vez de scroll infinito. El reproductor queda al pie mientras se navega,
recuerda por dónde iba cada pieza (en el navegador), salta de a 30 s, cambia
de velocidad y se controla desde la pantalla bloqueada (Media Session).

Para escuchar sin conexión está el feed RSS
(`https://status-tc.aebn.cl/audioteca/rss`), que sirve en cualquier app de
podcasts.

## Desarrollo

```bash
npm install
npm run dev     # contra el backend en http://localhost:8080 (.env.development)
npm run lint
npm run build
```

El backend local tiene que aceptar el origen de Vite:
`ALLOWED_ORIGINS=http://localhost:5173`.

## Deploy

Cada push a `main` construye y publica en GitHub Pages
(`.github/workflows/deploy.yml`), con el dominio `audioteca.aebn.cl`.
