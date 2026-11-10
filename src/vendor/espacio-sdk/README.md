# @tecnocoop/espacio-sdk

SDK para aplicaciones alojadas en **espacio**, el escritorio de la cooperativa.

Una app que usa esta SDK obtiene la identidad Solid del socio y un `fetch`
autenticado **acotado a su propio contenedor** del pod, sin implementar login ni
pedirle nada al usuario. La misma build sigue funcionando desplegada por su
cuenta: fuera de espacio, `connect()` devuelve `null`.

```js
import { connect } from '@tecnocoop/espacio-sdk'

const espacio = await connect()

if (espacio) {
  // Dentro de espacio: hay sesión, sin login propio.
  const url = espacio.paths.app('data/tasks.ttl')
  const dataset = await getSolidDataset(url, { fetch: espacio.fetch })
} else {
  // Fuera: el flujo de siempre.
}
```

El objetivo de diseño es que `@inrupt/solid-client` no se entere de que hay un
iframe y un proceso de por medio:

```js
await saveSolidDatasetAt(url, dataset, { fetch: espacio.fetch })
```

## Qué puede hacer una app

Lo que declare su manifiesto en el catálogo de espacio, y nada más. Por defecto,
una app solo alcanza `{pod}/apps/<su-id>/`. El shell rechaza con `403` cualquier
petición fuera de ahí, incluidas las que intenten escapar con `..`.

| | |
|---|---|
| `espacio.session` | `webId`, `issuer`, `storageUrl` |
| `espacio.fetch` | `fetch` autenticado, acotado al contenedor propio |
| `espacio.paths.app(...)` | URL dentro del contenedor propio |
| `espacio.ui.confirm` / `notify` | diálogos del shell (`window.confirm` no funciona en el iframe) |
| `espacio.actividad({ tipo, n? })` | cuenta algo hecho en la app («tareas completadas»); Inicio lo muestra en «Lo que has hecho hoy». El `tipo` se declara en `capabilities.activity` del manifiesto. SDK ≥ 0.3.0 |
| `espacio.notificar({ para?, titulo, texto?, url? })` | aviso al socio o a otros (ADR-029). Pide `"notify": true` en `capabilities`; el shell confirma la primera vez que la app avisa a alguien. SDK ≥ 0.2.0 |
| `espacio.on(...)` | `session-changed`, `theme-changed` |

## Límites

- Las respuestas de más de 8 MB se rechazan; para archivos habrá `files.read`.
- `window.prompt` y `window.confirm` **no funcionan** dentro de espacio: el
  iframe no tiene `allow-modals`. Devuelven `null` en silencio, que es peor que
  un error. Usa `espacio.ui.*`.
