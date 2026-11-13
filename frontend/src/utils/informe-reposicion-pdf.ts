import { jsPDF } from 'jspdf'

export interface LoteInforme {
  lote: string
  fechaVencimiento: string
  cantidadSala: number
  /** null cuando la sala no tiene bodega. */
  cantidadBodega: number | null
}

export interface ProductoInforme {
  item: string
  lotes: LoteInforme[]
}

export interface DatosInforme {
  sala: string
  empleado: string
  tieneBodega: boolean
  productos: ProductoInforme[]
  totalSala: number
  totalBodega: number
  guardado: boolean
}

/** "2026-11-12" → "12/11/2026" sin pasar por Date (evita desfases de zona horaria). */
export function fechaCorta(fecha: string): string {
  const match = String(fecha ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/)
  return match ? `${match[3]}/${match[2]}/${match[1]}` : fecha || '-'
}

async function cargarLogo(): Promise<string | null> {
  try {
    const response = await fetch('/logo-minoil-informe.png')
    if (!response.ok) return null
    const blob = await response.blob()
    return await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

/** Genera y descarga el informe de reposición en A4 vertical. */
export async function descargarInformeReposicion(datos: DatosInforme): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const width = pageWidth - 2 * margin
  const azul: [number, number, number] = [30, 64, 175]
  const gris: [number, number, number] = [100, 116, 139]
  const ahora = new Date()

  const write = (text: string, x: number, y: number, opts: {
    bold?: boolean; size?: number; color?: [number, number, number]; align?: 'left' | 'center' | 'right'
  } = {}) => {
    doc.setFont('helvetica', opts.bold ? 'bold' : 'normal')
    doc.setFontSize(opts.size ?? 9)
    doc.setTextColor(...(opts.color ?? [15, 23, 42]))
    doc.text(text, x, y, { align: opts.align ?? 'left' })
  }

  // Encabezado
  const logo = await cargarLogo()
  if (logo) {
    const props = doc.getImageProperties(logo)
    const h = 9
    doc.addImage(logo, 'PNG', margin, 12, (props.width / props.height) * h, h)
  }
  write('INFORME DE REPOSICIÓN', pageWidth - margin, 17, { bold: true, size: 15, color: azul, align: 'right' })
  write('Relevamiento Impostor', pageWidth - margin, 23, { color: gris, align: 'right' })
  doc.setDrawColor(...azul)
  doc.setLineWidth(0.6)
  doc.line(margin, 29, pageWidth - margin, 29)

  // Datos del conteo
  let y = 37
  const dato = (label: string, value: string, x: number) => {
    write(label, x, y, { bold: true, size: 8, color: gris })
    write(value, x, y + 5, { size: 10 })
  }
  dato('SALA', datos.sala, margin)
  dato('FECHA', ahora.toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' }), margin + width * 0.55)
  y += 13
  dato('RESPONSABLE', datos.empleado, margin)
  dato('ESTADO', datos.guardado ? 'Guardado en sistema' : 'No guardado', margin + width * 0.55)
  y += 15

  // Totales
  const box = (label: string, value: string, x: number) => {
    doc.setFillColor(241, 245, 249)
    doc.roundedRect(x, y, width / 3 - 4, 16, 2, 2, 'F')
    write(label, x + 4, y + 6, { size: 8, color: gris })
    write(value, x + 4, y + 13, { bold: true, size: 13, color: azul })
  }
  box('Total sala', String(datos.totalSala), margin)
  box('Total bodega', datos.tieneBodega ? String(datos.totalBodega) : 'Sin bodega', margin + width / 3 + 2)
  box('Productos', String(datos.productos.length), margin + (2 * width) / 3 + 4)
  y += 26

  // Detalle
  const cols = [
    { title: 'Lote', x: margin + 3, align: 'left' as const },
    { title: 'Vence', x: margin + width * 0.42, align: 'left' as const },
    { title: 'Sala', x: margin + width * 0.72, align: 'center' as const },
    { title: 'Bodega', x: margin + width * 0.9, align: 'center' as const },
  ]
  const nuevaPagina = (espacio: number) => {
    if (y + espacio > pageHeight - 20) { doc.addPage(); y = 20 }
  }

  datos.productos.forEach((producto, i) => {
    nuevaPagina(22)
    write(`${i + 1}. ${producto.item}`, margin, y, { bold: true, size: 10 })
    y += 3
    doc.setFillColor(...azul)
    doc.rect(margin, y, width, 6, 'F')
    cols.forEach((c) => write(c.title, c.x, y + 4.2, { bold: true, size: 8, color: [255, 255, 255], align: c.align }))
    y += 6
    producto.lotes.forEach((lote, j) => {
      nuevaPagina(7)
      if (j % 2 === 1) { doc.setFillColor(248, 250, 252); doc.rect(margin, y, width, 6, 'F') }
      write(lote.lote, cols[0].x, y + 4.2, { size: 8 })
      write(fechaCorta(lote.fechaVencimiento), cols[1].x, y + 4.2, { size: 8 })
      write(String(lote.cantidadSala), cols[2].x, y + 4.2, { bold: true, size: 9, align: 'center' })
      write(lote.cantidadBodega === null ? 'Sin bodega' : String(lote.cantidadBodega), cols[3].x, y + 4.2,
        { bold: lote.cantidadBodega !== null, size: lote.cantidadBodega === null ? 7 : 9,
          color: lote.cantidadBodega === null ? gris : undefined, align: 'center' })
      y += 6
    })
    y += 6
  })

  // Pie
  const paginas = doc.getNumberOfPages()
  for (let p = 1; p <= paginas; p++) {
    doc.setPage(p)
    write(`Generado el ${ahora.toLocaleString('es-BO')}`, margin, pageHeight - 10, { size: 7, color: gris })
    write(`Página ${p} de ${paginas}`, pageWidth - margin, pageHeight - 10, { size: 7, color: gris, align: 'right' })
  }

  const fecha = ahora.toLocaleDateString('en-CA', { timeZone: 'America/La_Paz' })
  doc.save(`Informe_Reposicion_${datos.sala.replace(/[^A-Za-z0-9]+/g, '_')}_${fecha}.pdf`)
}
