import { jsPDF } from 'jspdf';
import type { NotaDespachoCabecera, NotaDespachoLinea } from './nota-despacho.service';

// ---------- Formato ----------

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** 16443.53 → "16,443.53" */
export const monto = (v: unknown) =>
  num(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** "2026-10-01 00:00:00" o Date → "01/10/2026" sin conversión de zona horaria. */
export function fecha(v: unknown): string {
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    return `${String(v.getUTCDate()).padStart(2, '0')}/${String(v.getUTCMonth() + 1).padStart(2, '0')}/${v.getUTCFullYear()}`;
  }
  const m = String(v ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

const UNIDADES = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE', 'DIEZ',
  'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE', 'VEINTE',
  'VEINTIÚN', 'VEINTIDÓS', 'VEINTITRÉS', 'VEINTICUATRO', 'VEINTICINCO', 'VEINTISÉIS', 'VEINTISIETE', 'VEINTIOCHO', 'VEINTINUEVE'];
const DECENAS = ['', '', '', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
const CENTENAS = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS',
  'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

function hastaMil(n: number): string {
  if (n === 100) return 'CIEN';
  const c = Math.floor(n / 100);
  const r = n % 100;
  let texto = CENTENAS[c];
  if (r) {
    const resto = r < 30 ? UNIDADES[r] : DECENAS[Math.floor(r / 10)] + (r % 10 ? ` Y ${UNIDADES[r % 10]}` : '');
    texto = texto ? `${texto} ${resto}` : resto;
  }
  return texto;
}

/** 198 → "CIENTO NOVENTA Y OCHO" (hasta 999.999.999). */
export function enLetras(n: number): string {
  if (n === 0) return 'CERO';
  const millones = Math.floor(n / 1_000_000);
  const miles = Math.floor((n % 1_000_000) / 1000);
  const resto = n % 1000;
  const partes: string[] = [];
  if (millones) partes.push(millones === 1 ? 'UN MILLÓN' : `${hastaMil(millones)} MILLONES`);
  if (miles) partes.push(miles === 1 ? 'MIL' : `${hastaMil(miles)} MIL`);
  if (resto) partes.push(hastaMil(resto));
  return partes.join(' ');
}

/** 198.32 → "CIENTO NOVENTA Y OCHO 32/100 BOLIVIANOS" */
export function montoEnLetras(v: unknown): string {
  const centavos = Math.round(Math.abs(num(v)) * 100);
  const entero = Math.floor(centavos / 100);
  return `${enLetras(entero)} ${String(centavos % 100).padStart(2, '0')}/100 BOLIVIANOS`;
}

// ---------- PDF ----------

/** Nota de despacho R-199 en carta horizontal; el detalle continúa en páginas siguientes si no entra. */
export function renderNotaDespachoPdf(cab: NotaDespachoCabecera, lineas: NotaDespachoLinea[]): Buffer {
  const doc = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'landscape' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const left = 15;
  const right = W - 14;
  doc.setProperties({ title: `Nota de despacho ${cab.DocNum}`, author: 'MINOIL S.A.' });
  doc.setTextColor(0);
  doc.setDrawColor(0);

  const text = (t: string, x: number, y: number, o: { bold?: boolean; size?: number; align?: 'left' | 'center' | 'right'; maxWidth?: number } = {}) => {
    doc.setFont('helvetica', o.bold ? 'bold' : 'normal');
    doc.setFontSize(o.size ?? 10);
    let value = t ?? '';
    // Recorta textos que no entran en su columna en lugar de pisar la siguiente.
    if (o.maxWidth && doc.getTextWidth(value) > o.maxWidth) {
      while (value.length > 1 && doc.getTextWidth(`${value}…`) > o.maxWidth) value = value.slice(0, -1);
      value = `${value.trimEnd()}…`;
    }
    doc.text(value, x, y, { align: o.align ?? 'left' });
  };

  // Columnas del detalle
  const col = {
    articulo: left + 1, descripcion: left + 20, barra: 128, um: 168,
    cantidad: 203, precio: 222, subtotal: 244, total: right,
  };
  const encabezadoTabla = (y: number) => {
    text('Artículo', left, y, { bold: true, size: 9 });
    text('Descripción', col.descripcion, y, { bold: true, size: 9 });
    text('Código Barra', col.barra, y, { bold: true, size: 9 });
    text('U.M.', col.um, y, { bold: true, size: 9 });
    text('Cantidad', col.cantidad, y, { bold: true, size: 9, align: 'right' });
    text('Precio', col.precio, y, { bold: true, size: 9, align: 'right' });
    text('SubTotal', col.subtotal, y, { bold: true, size: 9, align: 'right' });
    text('Total', col.total, y, { bold: true, size: 9, align: 'right' });
    doc.setLineWidth(0.5);
    doc.line(left, y + 1.8, right, y + 1.8);
    return y + 7;
  };
  const titulo = (continuacion: boolean) => {
    text('MINOIL S.A.', W / 2, 16, { bold: true, size: 14, align: 'center' });
    text('NOTA DESPACHO', W / 2, 24, { bold: true, size: 14, align: 'center' });
    text('R-199', right - 20, 15, { size: 11, align: 'center' });
    if (continuacion) text(`Nro. Ped: ${cab.Pedido}   ·   continuación`, W / 2, 31, { size: 9, align: 'center' });
  };

  // Cabecera
  titulo(false);
  const label = (t: string, x: number, y: number) => text(t, x, y, { size: 11 });
  const value = (t: string, x: number, y: number, maxWidth?: number) => text(t, x, y, { size: 11, maxWidth });
  label('FECHA:', left, 41); value(fecha(cab.Fecha), 47, 40);
  label('NOMBRE:', left, 47); value(`${cab.CardCode} ${cab.Cliente ?? ''}`.trim(), 47, 46.5, 100);
  label('VENDEDOR:', 152, 47); value(`${cab.SlpCode} ${cab.SlpName ?? ''}`.trim(), 182, 46.5, right - 182);

  label('DESTINO', left, 55);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const destino: string[] = doc.splitTextToSize(String(cab.Direccion ?? '').trim() || '-', 125).slice(0, 3);
  destino.forEach((linea, i) => doc.text(linea, 47, 55 + i * 5.5));

  const datos: [string, string][] = [
    ['NIT/CI:', String(cab.U_NIT ?? '')],
    ['Nro. Tran:', String(cab.TransId ?? '')],
    ['Nro. Ped:', String(cab.Pedido ?? '')],
    ['Nro. Fact:', String(cab.NroFactura ?? '')],
  ];
  datos.forEach(([l, v], i) => { label(l, 193, 61 + i * 6); value(v, 220, 61 + i * 6); });

  // Detalle
  let y = encabezadoTabla(90);
  let ordenActual = '1. Pedido';
  let totalCantidad = 0;
  let totalSubtotal = 0;
  let totalGeneral = 0;
  for (const l of lineas) {
    if (y > H - 14) {
      doc.addPage();
      titulo(true);
      y = encabezadoTabla(40);
    }
    if (l.Orden !== ordenActual) {
      ordenActual = l.Orden;
      const ref = l.Orden.split('-').slice(1).join('-').trim();
      text(`Bonificación proveedor${ref ? ` · ${ref}` : ''}`, col.descripcion, y, { bold: true, size: 8.5 });
      y += 5.5;
    }
    const cantidad = num(l.Quantity);
    const subtotal = num(l.SubTotal);
    const total = subtotal + num(l.ICE);
    totalCantidad += cantidad;
    totalSubtotal += subtotal;
    totalGeneral += total;

    text(String(l.ItemCode ?? ''), col.articulo, y, { size: 9 });
    text(String(l.Dscription ?? ''), col.descripcion, y, { size: 8.5, maxWidth: col.barra - col.descripcion - 3 });
    text(String(l.CodeBars ?? ''), col.barra, y, { size: 8.5 });
    text(String(l.UnidadMedida ?? ''), col.um, y, { size: 9, maxWidth: col.cantidad - col.um - 16 });
    text(monto(cantidad), col.cantidad, y, { size: 9, align: 'right' });
    text(monto(l.Precio), col.precio, y, { size: 9, align: 'right' });
    text(monto(subtotal), col.subtotal, y, { size: 9, align: 'right' });
    text(monto(total), col.total, y, { size: 9, align: 'right' });
    y += 6;
  }

  // Totales (en una página nueva si no entran)
  if (y + 34 > H - 8) {
    doc.addPage();
    titulo(true);
    y = 40;
  }
  doc.setLineWidth(0.6);
  doc.line(left - 2, y - 3, right, y - 3);
  text('Paq.:', 150, y + 2, { size: 11, align: 'right' });
  text(monto(totalCantidad), col.cantidad, y + 2, { bold: true, size: 10, align: 'right' });
  text(monto(totalSubtotal), col.subtotal, y + 2, { bold: true, size: 10, align: 'right' });
  text(monto(totalGeneral), col.total, y + 2, { bold: true, size: 10, align: 'right' });

  text('Descuento', 233, y + 11, { bold: true, size: 9.5, align: 'right' });
  text(monto(cab.DiscSumFC), right, y + 11, { bold: true, size: 10, align: 'right' });
  text('TOTAL FACTURA: BS.', 233, y + 17, { bold: true, size: 10.5, align: 'right' });
  text(monto(cab.DocTotalFC), right, y + 17, { bold: true, size: 10, align: 'right' });

  text(`SON: ${montoEnLetras(cab.DocTotalFC)}`, left, y + 17, { size: 10, maxWidth: 165 });
  text(`CxCobrar: ${monto(cab.SaldoVencido)}     Nro. Cuenta: ${cab.TransId ?? ''}     Vcto.: ${fecha(cab.Vencimiento)}`,
    left, y + 23, { size: 10 });
  text('Almacen', left, y + 29.5, { size: 11 });
  text(String(cab.Almacen ?? ''), 47, y + 29, { size: 9.5 });

  // Numeración
  const paginas = doc.getNumberOfPages();
  if (paginas > 1) {
    for (let p = 1; p <= paginas; p++) {
      doc.setPage(p);
      text(`Página ${p} de ${paginas}`, right, H - 6, { size: 8, align: 'right' });
    }
  }

  return Buffer.from(doc.output('arraybuffer'));
}
