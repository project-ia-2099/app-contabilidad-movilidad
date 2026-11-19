import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

const gasto = {
  id: 'prueba',
  fecha: '2026-11-18',
  concepto: 'Taxi a la oficina',
  monto: 18.5,
  trabajador: 'Ana Pérez',
}

beforeEach(() => vi.stubEnv('VITE_API_URL', 'http://localhost:5080'))

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('Gastos de movilidad', () => {
  it('registra un gasto y actualiza el listado', async () => {
    const usuario = userEvent.setup()
    const fetch = vi.fn()
      .mockResolvedValueOnce(Response.json([]))
      .mockResolvedValueOnce(Response.json(gasto, { status: 201 }))
      .mockResolvedValueOnce(Response.json([gasto]))
    vi.stubGlobal('fetch', fetch)
    render(<App />)

    await screen.findByText('Aún no hay gastos registrados.')
    fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: gasto.fecha } })
    await usuario.type(screen.getByLabelText('Concepto'), gasto.concepto)
    fireEvent.change(screen.getByLabelText('Monto'), { target: { value: '18.50' } })
    await usuario.type(screen.getByLabelText('Trabajador'), gasto.trabajador)
    await usuario.click(screen.getByRole('button', { name: 'Registrar gasto' }))

    expect(await screen.findByText(gasto.concepto)).toBeInTheDocument()
    expect(screen.getByText(gasto.trabajador)).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Gasto registrado.')
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({
      fecha: gasto.fecha,
      concepto: gasto.concepto,
      monto: '18.50',
      trabajador: gasto.trabajador,
    })
  })

  it('permite cancelar y después confirmar la eliminación', async () => {
    const usuario = userEvent.setup()
    const fetch = vi.fn()
      .mockResolvedValueOnce(Response.json([gasto]))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(Response.json([]))
    vi.stubGlobal('fetch', fetch)
    render(<App />)

    const eliminarFila = await screen.findByRole('button', { name: 'Eliminar gasto: Taxi a la oficina' })
    await usuario.click(eliminarFila)
    await usuario.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(fetch).toHaveBeenCalledTimes(1)
    await usuario.click(eliminarFila)
    await usuario.click(screen.getByRole('button', { name: 'Eliminar gasto' }))

    expect(await screen.findByText('Aún no hay gastos registrados.')).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith('http://localhost:5080/api/gastos/prueba', { method: 'DELETE' })
  })

  it('muestra la validación de la API junto al campo', async () => {
    const usuario = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(Response.json([]))
      .mockResolvedValueOnce(Response.json({ errors: { monto: ['Ingresa un monto positivo.'] } }, { status: 400 })))
    render(<App />)

    await screen.findByText('Aún no hay gastos registrados.')
    await usuario.click(screen.getByRole('button', { name: 'Registrar gasto' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Revisa los campos indicados.')
    expect(screen.getByLabelText('Monto')).toHaveAccessibleDescription('Ingresa un monto positivo.')
  })

  it('muestra el error de red y permite reintentar el listado', async () => {
    const usuario = userEvent.setup()
    const fetch = vi.fn()
      .mockRejectedValueOnce(new TypeError('network error'))
      .mockResolvedValueOnce(Response.json([]))
    vi.stubGlobal('fetch', fetch)
    render(<App />)

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar con la API')
    await usuario.click(screen.getByRole('button', { name: 'Actualizar' }))

    expect(await screen.findByText('Aún no hay gastos registrados.')).toBeInTheDocument()
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2))
  })
})
