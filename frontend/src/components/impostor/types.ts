export interface LoteReposicion {
  lote: string
  fechaVencimiento: string
  /** Cantidad de la última factura de este lote a la sala; referencia para detectar errores de tipeo. */
  facturado: number
}

export interface ProductoReposicion {
  id: string
  /** ItemCode SAP que se guarda en la BD. */
  codigoProducto: string
  item: string
  lotes: LoteReposicion[]
}

/** Cantidades por producto → índice de lote. `undefined` = todavía sin ingresar. */
export type Cantidades = Record<string, Record<number, number | undefined>>

export type EstadoVencimiento = 'vencido' | 'pronto' | 'ok' | 'sin-fecha'

/** Días hasta el vencimiento contados desde hoy (hora local); null si no hay fecha válida. */
export function diasParaVencer(fecha: string): number | null {
  const match = String(fecha ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return null
  const vence = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  return Math.round((vence.getTime() - hoy.getTime()) / 86_400_000)
}

export function estadoVencimiento(fecha: string): EstadoVencimiento {
  const dias = diasParaVencer(fecha)
  if (dias === null) return 'sin-fecha'
  if (dias < 0) return 'vencido'
  return dias <= 30 ? 'pronto' : 'ok'
}
