export type NuevoGasto = {
  fecha: string
  concepto: string
  monto: string
  trabajador: string
}

export type Gasto = Omit<NuevoGasto, 'monto'> & {
  id: string
  monto: number
}

export type ErroresDeGasto = Partial<Record<keyof NuevoGasto, string[]>>

type Problema = { errors?: ErroresDeGasto }

export class ErrorDeApi extends Error {
  constructor(message: string, readonly errores?: ErroresDeGasto) {
    super(message)
  }
}

async function solicitarGastos(ruta = '', init?: RequestInit) {
  const url = import.meta.env.VITE_API_URL?.trim()
  if (!url) {
    throw new ErrorDeApi('Falta configurar la dirección de la API de gastos.')
  }

  let respuesta: Response
  try {
    respuesta = await fetch(`${url.replace(/\/+$/, '')}/api/gastos${ruta}`, init)
  } catch (error) {
    if (init?.signal?.aborted) throw error
    throw new ErrorDeApi('No se pudo conectar con la API de gastos.')
  }

  if (!respuesta.ok) {
    if (respuesta.status === 400) {
      if (respuesta.headers.get('content-type')?.includes('json')) {
        const problema: Problema = await respuesta.json()
        if (problema.errors) {
          throw new ErrorDeApi('Revisa los campos indicados.', problema.errors)
        }
      }
      throw new ErrorDeApi('Revisa que la fecha y el monto tengan un formato válido.')
    }
    if (respuesta.status === 404 && init?.method === 'DELETE') {
      throw new ErrorDeApi('El gasto ya no existe. Actualiza el listado.')
    }
    throw new ErrorDeApi(`La API de gastos respondió con un error (${respuesta.status}).`)
  }
  return respuesta
}

export async function listarGastos(signal?: AbortSignal): Promise<Gasto[]> {
  return (await solicitarGastos('', { signal })).json()
}

export async function registrarGasto(gasto: NuevoGasto) {
  await solicitarGastos('', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...gasto, fecha: gasto.fecha || null, monto: gasto.monto || null }),
  })
}

export async function eliminarGasto(id: string) {
  await solicitarGastos(`/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
