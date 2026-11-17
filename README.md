# audioteca

La audioteca de tecnocooperativa (audioteca.tecnocooperativa.cl): charlas, crónicas,
clases y relatos de los socios, organizados en series, para escuchar en la
micro, en el camino o en casa.

Como [música](https://github.com/tecnocoopcl/musica), el contenido no vive
aquí: cada socio lo publica desde **Estudio** (en
[espacio](https://github.com/tecnocoopcl/espacio)) en su propio pod, y esta app
solo lo lee. El diseño completo está en el ADR-021 de espacio.

```
pod del socio                                    tecno-cooperativa-backend          esta app
<pod>/Aplicaciones/estudio/data/audioteca.json → GET /audioteca/series           → /
                               audioteca/…mp3     GET /audioteca/piezas           → /, /buscar
                                                  GET /audioteca/series/…         → /<cuenta>[/<serie>[/<pieza>]]
                                                  GET /audioteca/rss              → apps de podcasts
```

Los audios se reproducen directo desde el pod de cada socio.

## Rutas

- `/`: descubrimiento del día y series actualizadas recientemente.
- `/buscar?q=`: busca en título, descripción, etiquetas, serie y autor.
- `/<cuenta>`: las series de un autor.
- `/<cuenta>/<serie>`: una serie, con sus piezas.
- `/<cuenta>/<serie>/<pieza>`: una pieza, para escuchar o descargar.

El router es mínimo y sin dependencias (`src/ruta.jsx`).

### Prerender

El sitio publicado es estático. Al construir, `scripts/paginas.js` pide el
catálogo a la API y prerenderiza la portada, `/buscar` y cada cuenta, serie y
pieza (con `src/servidor.jsx`): cada una queda como HTML con la vista ya hecha,
que se lee sin JavaScript, con su título, descripción y portada (Open Graph)
para buscadores, WhatsApp o Slack, y con 200 en GitHub Pages. En el navegador,
la app hidrata ese HTML sin pedir nada.

Las respuestas de la API que usa cada vista quedan además en `/_datos/`
(`src/datos.js` dice cuáles): al navegar, la app las lee de ahí. A la API solo
van las búsquedas y las escuchas, y lo publicado después del último deploy: esas
rutas cargan por `404.html` (la app sin prerender), y una pieza nueva de una
serie ya copiada se busca en la API antes de decir que no está. El deploy se
repite cada 3 horas.

Lo que depende de cada navegador (la marca «✓ escuchada», el descubrimiento
del día) aparece después de hidratar (`src/montado.js`).

## Pensada para pantallas de tinta

Negro sobre blanco, bordes de 1 px, nada que se anime y páginas numeradas en
vez de scroll infinito. El reproductor queda al pie mientras se navega,
recuerda por dónde iba cada pieza (en el navegador), reproduce las series
completas desde el primer capítulo, salta de a 30 s, cambia de velocidad y se
controla desde la pantalla bloqueada (Media Session).

Para escuchar sin conexión está el feed RSS
(`https://api-tc.aebn.cl/audioteca/rss`), que sirve en cualquier app de
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
(`.github/workflows/deploy.yml`), con el dominio `audioteca.tecnocooperativa.cl`.
También se publica cada 3 horas, para generar las páginas de lo nuevo.
