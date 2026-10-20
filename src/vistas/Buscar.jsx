import { plural } from '../formato.js'
import { usarApi } from '../usarApi.js'
import { Cargando, Fallo, useTitulo } from './Estados.jsx'
import { FormBuscar } from './Inicio.jsx'
import { ListaDePiezas, Paginas } from './Listas.jsx'

export function Buscar({ q, pagina }) {
  useTitulo(q ? `Buscar: ${q}` : 'Buscar')
  // Sin texto no se pide nada: la API devolvería todo.
  const piezas = usarApi(q ? 'piezas' : null, { q, pagina })

  return (
    <>
      <h1>Buscar</h1>
      <FormBuscar q={q} autoFocus={!q} />
      {q &&
        (piezas.cargando && !piezas.datos ? (
          <Cargando />
        ) : piezas.error ? (
          <Fallo {...piezas} />
        ) : (
          <>
            <p className="meta">{plural(piezas.datos.total, 'resultado', 'resultados')}</p>
            <ListaDePiezas piezas={piezas.datos.pieces} />
            <Paginas ruta="/buscar" parametros={{ q }} {...piezas.datos} />
          </>
        ))}
    </>
  )
}
