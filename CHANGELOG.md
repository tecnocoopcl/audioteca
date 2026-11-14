# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Unreleased]

### Added

- **Escuchas**: una reproducción cuenta al oír el 80 % de la pieza o 5
  minutos (adelantar no suma). Entonces la pieza queda marcada «✓ escuchada»
  en este navegador y se suma al contador de todos (`POST
  /audioteca/escuchas`, anónimo). Las series y las piezas muestran cuántas
  escuchas llevan. Requiere la versión de tecno-cooperativa-backend con
  `/audioteca/escuchas`.
- **Dentro de espacio** (SDK 0.3.0 vendorizada en `src/vendor/espacio-sdk`):
  le cuenta a Inicio las «piezas escuchadas» y los «minutos escuchados»
  (ADR-030 de espacio). Fuera de espacio no cambia nada.
- Bajo la marca, la firma «Una plataforma tecnocooperativa», enlazada a
  `tecnocooperativa.cl`, como en Música.

### Fixed

- El pie ya no queda más angosto que la barra y el contenido: su ancho máximo
  estaba en `em` y con la letra más chica medía menos. Ahora los tres tienen el
  mismo ancho y alineación.

### Changed

- La API de la cooperativa pasa de `status-tc.aebn.cl` a `api-tc.aebn.cl`,
  como en Música y espacio; también el enlace al feed RSS. El feed en
  `status-tc.aebn.cl` sigue respondiendo, así que nadie pierde su suscripción.
- El texto dice «tecnocooperativa», junto, en vez de «tecno-cooperativa»: el
  pie, la descripción de la página y el README (que además da el dominio
  `audioteca.tecnocooperativa.cl`).
- Las piezas de cada serie llegan ordenadas desde la API (de la más antigua a
  la más nueva); el sitio ya no las invierte. Requiere la versión de
  tecno-cooperativa-backend que las ordena.
- Los controles de pista de la pantalla bloqueada siguen la cola sin volver a
  anunciar la pieza que suena.

### Removed

- Las temáticas: la página `/tematica/<slug>` y la ficha de cada pieza ya no
  las muestran. El contenido se organiza por series y etiquetas.

## [0.2.0] - 2026-11-01

### Added

- Primera versión: portada, búsqueda, autor, serie y pieza, sobre la API de la
  audioteca de tecno-cooperativa-backend.
- Reproductor al pie que sigue sonando mientras se navega: recuerda la
  posición de cada pieza, salta de a 30 s, cambia de velocidad y responde a
  los controles de la pantalla bloqueada.
- Reproducción continua de series, de la pieza más antigua a la más nueva,
  con controles anterior/siguiente, posición en la cola y controles de pista
  en Media Session.
- Descubrimiento del día: una pieza estable durante el día, con descripción y
  acceso directo desde la portada.
- Navegación principal más visible, enlace para saltar al contenido y estados
  más explícitos en el reproductor.
- Estilo de tinta: negro sobre blanco y sin animaciones.
- Deploy a GitHub Pages (audioteca.aebn.cl) y CI con lint, tests y build.

### Changed

- Portada editorial: búsqueda, descubrimiento del día y las series
  actualizadas recientemente.
- Piezas de cada serie presentadas de la más antigua a la más nueva, igual que
  la cola de reproducción.

[Unreleased]: https://github.com/tecnocoopcl/audioteca/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/tecnocoopcl/audioteca/releases/tag/v0.2.0
