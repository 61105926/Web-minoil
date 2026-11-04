import { jsPDF } from 'jspdf';

export type BoletaRecord = Record<string, unknown>;
const MONTHS = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

function rawValue(record: BoletaRecord, field: string): unknown {
  const key = Object.keys(record).find(key => key.toUpperCase() === field);
  return key ? record[key] : null;
}
function value(record: BoletaRecord, field: string, fallback = ''): string {
  const result = rawValue(record, field);
  return result == null || result === '' ? fallback : String(result);
}
function dateParts(input: unknown): { year: number; month: number; day: number } | null {
  if (input instanceof Date && !Number.isNaN(input.getTime())) {
    return { year: input.getUTCFullYear(), month: input.getUTCMonth() + 1, day: input.getUTCDate() };
  }
  const match = String(input ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

/** Agrupa miles y completa decimales sin convertir importes de HANA a float. */
function amount(record: BoletaRecord, field: string): string {
  const raw = value(record, field, '-').trim();
  const normalized = /^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(raw) ? raw.replace(/,/g, '') : raw;
  const match = normalized.match(/^(-?)(\d+)(?:\.(\d+))?$/);
  if (!match) return raw;
  const [, sign, whole, fraction = ''] = match;
  return `${sign}${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${fraction.padEnd(2, '0')}`;
}

/** Boleta A4 vertical; conserva la distribución de referencia sin recalcular la nómina. */
export function renderBoletaPdf(record: BoletaRecord, logo?: Uint8Array): Buffer {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  // Adaptar las columnas de la referencia al ancho útil de una página vertical.
  const horizontalScale = (doc.internal.pageSize.getWidth() - 20) / 277;
  const pageX = (x: number) => 10 + (x - 10) * horizontalScale;
  const rect = (x: number, y: number, width: number, height: number, style?: string) =>
    doc.rect(pageX(x), y, width * horizontalScale, height, style);
  const line = (x1: number, y1: number, x2: number, y2: number) =>
    doc.line(pageX(x1), y1, pageX(x2), y2);
  const payment = dateParts(rawValue(record, 'FECHA_PAGO'));
  const entry = dateParts(rawValue(record, 'FECHA_INGRESO'));
  const month = payment ? MONTHS[payment.month - 1] : '';
  const year = payment ? String(payment.year) : '';
  doc.setProperties({ title: `Boleta de pago - ${month} ${year}`, author: 'MINOIL' });
  doc.setTextColor(0);
  doc.setDrawColor(0);
  doc.setLineWidth(0.4);
  const text = (content: string, x: number, y: number, bold = false, size = 9.5,
    align: 'left' | 'center' | 'right' = 'left', width?: number) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size * 0.8);
    if (width && doc.getTextWidth(content) > width * horizontalScale) {
      doc.setFontSize(size * 0.8 * width * horizontalScale / doc.getTextWidth(content));
    }
    doc.text(content, pageX(x), y, { align });
  };
  if (logo) {
    // El PNG es cuadrado: mostrar su logotipo sin deformarlo usando un recorte PDF.
    doc.saveGraphicsState();
    rect(15, 15, 56.3, 14, null);
    doc.clip();
    doc.discardPath();
    doc.addImage(logo, 'PNG', pageX(15), 15 - 25.5 * horizontalScale,
      64 * horizontalScale, 64 * horizontalScale, undefined, 'FAST');
    doc.restoreGraphicsState();
  } else text('MINOIL', 15, 25, true, 22);
  text('BOLETA DE PAGO', 148.5, 23, true, 12, 'center');
  text('MINOIL', 286, 17, true, 12, 'right');
  text(value(record, 'DEPARTAMENTO'), 286, 23, false, 9.5, 'right', 65);
  text(value(record, 'SUCURSAL'), 286, 29, false, 9.5, 'right', 65);

  const left = 10;
  const middle = 146;
  const right = 287;
  const infoTop = 31;
  type InfoRow = [string, string];
  const leftRows: InfoRow[] = [
    ['MES:', month], ['NOMBRE:', value(record, 'NOMBRE')],
    ['CI:', value(record, 'CI')], ['CARGO:', value(record, 'CARGO')],
    ['FECHA INGRESO:', entry ? `${String(entry.day).padStart(2, '0')}/${String(entry.month).padStart(2, '0')}/${entry.year}` : value(record, 'FECHA_INGRESO')],
  ];
  const rightRows: InfoRow[] = [
    ['SOCIO DE NEGOCIO:', value(record, 'CODSN')], ['NUA:', value(record, 'NUA')],
    ['AFP:', value(record, 'AFILIADO')], ['DIAS TRABAJADOS:', value(record, 'DIAS_TRABAJADOS')],
    ['SALDO A FAVOR RC-IVA:', amount(record, 'RCIVA')],
    ['DIAS DISPONIBLES DE VACACIÓN:', `${value(record, 'VACACIONES', '-')} Días`],
  ];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  const measure = (rows: InfoRow[], width: number) => rows.map(([, content]) =>
    Math.max(5.6, (doc.splitTextToSize(content, width * horizontalScale) as string[]).length * 4.2 + 1.4));
  const leftHeights = measure(leftRows, 92);
  const rightHeights = measure(rightRows, 53);
  const infoHeight = Math.max(40, leftHeights.reduce((a, b) => a + b, 0) + 9,
    rightHeights.reduce((a, b) => a + b, 0) + 7);
  const info = (rows: InfoRow[], heights: number[], labelX: number, valueX: number, width: number) => {
    let y = infoTop + 7;
    rows.forEach(([label, content], index) => {
      text(label, labelX, y, true, 9.5, 'left', valueX - labelX - 3);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.6);
      const lines = doc.splitTextToSize(content, width * horizontalScale) as string[];
      if (label === 'MES:') text(content, valueX, y, false, 11, 'left', 55);
      else doc.text(lines, pageX(valueX), y, { lineHeightFactor: 1.25 });
      y += heights[index];
    });
  };
  rect(left, infoTop, right - left, infoHeight);
  line(middle, infoTop, middle, infoTop + infoHeight);
  info(leftRows, leftHeights, 13.5, 50, 92);
  info(rightRows, rightHeights, 149, 228, 53);
  text('AÑO:', 111, infoTop + 7, true);
  text(year, 128, infoTop + 7, false, 11);

  // Zona de conceptos abierta: separadores verticales, sin cuadrícula por fila.
  let tableTop = infoTop + infoHeight + 2;
  if (tableTop + 111 > doc.internal.pageSize.getHeight() - 10) {
    doc.addPage();
    text('BOLETA DE PAGO', 148.5, 14, true, 12, 'center');
    tableTop = 20;
  }
  const columns = [left, 63.5, 101, middle, 198.5, 236, right];
  const groupBottom = tableTop + 6.5;
  const bodyTop = groupBottom + 6.5;
  const bodyBottom = bodyTop + 60;
  const tableBottom = bodyBottom + 6;
  rect(left, tableTop, right - left, tableBottom - tableTop);
  for (const y of [groupBottom, bodyTop, bodyBottom]) line(left, y, right, y);
  line(middle, groupBottom, middle, tableBottom);
  for (const x of [63.5, 101, 198.5, 236]) line(x, groupBottom, x, bodyBottom);
  text('INGRESOS', (left + middle) / 2, tableTop + 4.8, true, 11, 'center');
  text('DESCUENTOS', (middle + right) / 2, tableTop + 4.8, true, 11, 'center');
  ['CONCEPTO', 'CANTIDAD', 'IMPORTE', 'CONCEPTO', 'CANTIDAD', 'IMPORTE'].forEach((label, index) => {
    text(label, (columns[index] + columns[index + 1]) / 2, groupBottom + 4.8, true, 10, 'center');
  });
  const income = [
    ['Sueldo Basico', 'SUELDO_BASICO'], ['Bono de Antiguedad', 'BONO_ANTIGUEDAD'],
    ['Bonos', 'BONOS'], ['Comisiones Ventas', 'COMIVENTAS'],
  ];
  const deductions = [
    ['AFP', 'GPSSLP'], ['RC-I.V.A.', 'RCIVA'], ['Anticipo', 'ANTICIPOS'],
    ['Multas', 'MULTAS'], ['Prestamos', 'PRESTAMOS'],
  ];
  const concepts = (rows: string[][], labelX: number, amountX: number, amountWidth: number) => {
    rows.forEach(([label, field], index) => {
      const y = bodyTop + 9 + index * 5.8;
      text(label, labelX, y, true, 9.5, 'left', 49);
      text(amount(record, field), amountX, y, false, 9.5, 'right', amountWidth);
    });
  };
  concepts(income, 13.5, 136, 32);
  concepts(deductions, 152, 271, 33);
  text('TOTAL GANADO', 13.5, bodyBottom + 4.4, true);
  text(amount(record, 'TOTAL_INGRESOS'), 133, bodyBottom + 4.4, false, 9.5, 'right', 55);
  text('TOTAL DESCUENTOS', 148.5, bodyBottom + 4.4, true);
  text(amount(record, 'TOTAL_DESCUENTOS'), 271, bodyBottom + 4.4, false, 9.5, 'right', 60);
  const netTop = tableBottom + 3;
  rect(left, netTop, middle - left, 8);
  text('LIQUIDO A PAGAR', 13.5, netTop + 5.2, true);
  text(amount(record, 'LIQUIDO_PAGABLE'), 133, netTop + 5.2, false, 9.5, 'right', 55);
  line(186, netTop + 18, 257, netTop + 18);
  text('FIRMA DEL EMPLEADO', 221.5, netTop + 24, false, 12, 'center');
  return Buffer.from(doc.output('arraybuffer'));
}
