import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  eliminarGasto,
  ErrorDeApi,
  listarGastos,
  registrarGasto,
  type ErroresDeGasto,
  type Gasto,
  type NuevoGasto,
} from './gastos'

const formularioVacio: NuevoGasto = { fecha: '', concepto: '', monto: '', trabajador: '' }
const importe = new Intl.NumberFormat('es-PE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
const calendario = new Intl.DateTimeFormat('es-PE', { dateStyle: 'short', timeZone: 'UTC' })

const campos = [
  { name: 'fecha', label: 'Fecha', type: 'date' },
  { name: 'concepto', label: 'Concepto', type: 'text', placeholder: 'Ej. Taxi a la oficina' },
  { name: 'monto', label: 'Monto', type: 'number', step: 'any', placeholder: '0.00' },
  { name: 'trabajador', label: 'Trabajador', type: 'text', placeholder: 'Nombre del trabajador' },
] as const

export default function App() {
  const [formulario, setFormulario] = useState(formularioVacio)
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [cargando, setCargando] = useState(true)
  const [operacion, setOperacion] = useState<'registrar' | 'eliminar' | null>(null)
  const [confirmacion, setConfirmacion] = useState<string | null>(null)
  const [errorLista, setErrorLista] = useState('')
  const [errorOperacion, setErrorOperacion] = useState('')
  const [erroresCampos, setErroresCampos] = useState<ErroresDeGasto>({})
  const [aviso, setAviso] = useState('')

  const actualizar = useCallback(async (signal?: AbortSignal) => {
    setCargando(true)
    setErrorLista('')
    try {
      const lista = await listarGastos(signal)
      if (!signal?.aborted) setGastos(lista)
    } catch (error) {
      if (!signal?.aborted) {
        setErrorLista(error instanceof ErrorDeApi ? error.message : 'No se pudo leer el listado de gastos.')
      }
    } finally {
      if (!signal?.aborted) setCargando(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void actualizar(controller.signal)
    return () => controller.abort()
  }, [actualizar])

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setOperacion('registrar')
    setErrorOperacion('')
    setErroresCampos({})
    setAviso('')
    try {
      await registrarGasto(formulario)
      setFormulario(formularioVacio)
      setAviso('Gasto registrado.')
      await actualizar()
    } catch (error) {
      setErrorOperacion(error instanceof ErrorDeApi ? error.message : 'No se pudo registrar el gasto.')
      if (error instanceof ErrorDeApi && error.errores) setErroresCampos(error.errores)
    } finally {
      setOperacion(null)
    }
  }

  async function eliminar(id: string) {
    setOperacion('eliminar')
    setErrorOperacion('')
    setAviso('')
    try {
      await eliminarGasto(id)
      setConfirmacion(null)
      setAviso('Gasto eliminado.')
      await actualizar()
    } catch (error) {
      setErrorOperacion(error instanceof ErrorDeApi ? error.message : 'No se pudo eliminar el gasto.')
    } finally {
      setOperacion(null)
    }
  }

  const ocupado = operacion !== null || cargando
  const gastoPorEliminar = gastos.find(({ id }) => id === confirmacion)

  return (
    <>
      <header className="topbar">
        <div className="page-width topbar-content">
          <span className="topbar-icon"><i className="fa-solid fa-building-columns" aria-hidden="true" /></span>
          <span>Contabilidad</span>
        </div>
      </header>

      <main className="page-width">
        <h1>Gastos de movilidad</h1>

        <div className="feedback">
          <p role="status" className={aviso ? 'notice success' : 'sr-only'}>{aviso}</p>
          {errorOperacion && <p role="alert" className="notice error">{errorOperacion}</p>}
        </div>

        <div className="workspace">
          <section className="card" aria-labelledby="registro">
            <h2 id="registro"><i className="fa-solid fa-pen-to-square" aria-hidden="true" /> Registrar gasto</h2>
            <form onSubmit={guardar} noValidate>
              {campos.map(({ name, label, ...attributes }) => {
                const error = erroresCampos[name]?.join(' ')
                return (
                  <div className="field" key={name}>
                    <label htmlFor={name}>{label}</label>
                    <input {...attributes} id={name} name={name} value={formulario[name]}
                      required disabled={operacion !== null}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={error ? `${name}-error` : undefined}
                      onChange={({ target }) => {
                        setFormulario((anterior) => ({ ...anterior, [name]: target.value }))
                        setErroresCampos((anteriores) => ({ ...anteriores, [name]: undefined }))
                      }} />
                    {error && <small id={`${name}-error`} className="field-error">{error}</small>}
                  </div>
                )
              })}
              <button className="primary" type="submit" disabled={ocupado}>
                <i className="fa-solid fa-plus" aria-hidden="true" />
                {operacion === 'registrar' ? 'Registrando…' : 'Registrar gasto'}
              </button>
            </form>
          </section>

          <section className="card" aria-labelledby="listado">
            <div className="list-heading">
              <h2 id="listado"><i className="fa-solid fa-list" aria-hidden="true" /> Gastos registrados</h2>
              <button className="secondary" type="button" onClick={() => void actualizar()} disabled={ocupado}>
                <i className="fa-solid fa-arrows-rotate" aria-hidden="true" /> Actualizar
              </button>
            </div>

            {errorLista && <p className="notice error" role="alert">{errorLista}</p>}

            <div aria-busy={cargando}>
              {cargando && gastos.length === 0 && <p className="list-placeholder">Cargando gastos…</p>}
              {!cargando && !errorLista && gastos.length === 0 && (
                <div className="list-placeholder empty">
                  <i className="fa-solid fa-receipt" aria-hidden="true" />
                  <p>Aún no hay gastos registrados.</p>
                </div>
              )}

              {gastos.length > 0 && (
                <div className="table-scroll" tabIndex={0} role="region" aria-label="Tabla de gastos">
                  <table>
                    <thead>
                      <tr>
                        <th scope="col">Fecha</th>
                        <th scope="col">Concepto</th>
                        <th scope="col">Trabajador</th>
                        <th scope="col" className="amount">Monto</th>
                        <th scope="col"><span className="sr-only">Acciones</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {gastos.map((gasto) => (
                        <tr key={gasto.id}>
                          <td className="date">
                            <time dateTime={gasto.fecha}>{calendario.format(new Date(gasto.fecha))}</time>
                          </td>
                          <td>{gasto.concepto}</td>
                          <td>{gasto.trabajador}</td>
                          <td className="amount">{importe.format(gasto.monto)}</td>
                          <td className="actions">
                            <button className="delete-icon" type="button" disabled={ocupado}
                              aria-label={`Eliminar gasto: ${gasto.concepto}`}
                              onClick={() => {
                                setErrorOperacion('')
                                setConfirmacion(gasto.id)
                              }}>
                              <i className="fa-solid fa-trash-can" aria-hidden="true" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {gastoPorEliminar && (
              <div className="confirm" role="group" aria-label="Confirmación de eliminación">
                <p>¿Eliminar el gasto «{gastoPorEliminar.concepto}»?</p>
                <div className="confirm-buttons">
                  <button type="button" className="secondary" disabled={operacion !== null}
                    onClick={() => setConfirmacion(null)}>Cancelar</button>
                  <button type="button" className="danger" disabled={ocupado}
                    onClick={() => void eliminar(gastoPorEliminar.id)}>
                    {operacion === 'eliminar' ? 'Eliminando…' : 'Eliminar gasto'}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  )
}
