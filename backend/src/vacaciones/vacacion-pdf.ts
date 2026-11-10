import { BadRequestException } from '@nestjs/common';
import { jsPDF } from 'jspdf';
import { toIsoDate } from './vacaciones.service';

export interface SolicitudVacacion {
  Codigo: string;
  Empleado: string;
  Cargo: string;
  Departamento: string;
  FechaIngreso: string;
  FechaSolicitud: string;
  detalle: { Desde: string; Hasta: string; Dias: number; Turno?: string | null; Tipo?: string | null }[];
  Estado: string;
  Tipo?: string | null;
  Observaciones?: string | null;
}

const isText = (v: unknown) => typeof v === 'string' && v.trim() !== '';
const optionalText = (v: unknown) => v == null || typeof v === 'string';

/** Valida el cuerpo con las mismas reglas que la versión anterior en Laravel (Tipo es opcional). */
export function parseSolicitud(body: any): SolicitudVacacion {
  const fail = (field: string) => { throw new BadRequestException(`El campo ${field} es obligatorio o inválido.`); };
  for (const field of ['Codigo', 'Empleado', 'Cargo', 'Departamento', 'Estado']) if (!isText(body?.[field])) fail(field);
  for (const field of ['FechaIngreso', 'FechaSolicitud']) if (!toIsoDate(body[field])) fail(field);
  for (const field of ['Observaciones', 'Tipo']) if (!optionalText(body[field])) fail(field);
  if (!Array.isArray(body.detalle) || !body.detalle.length) fail('detalle');
  body.detalle.forEach((d: any, i: number) => {
    if (!toIsoDate(d?.Desde)) fail(`detalle.${i}.Desde`);
    if (!toIsoDate(d?.Hasta)) fail(`detalle.${i}.Hasta`);
    if (d?.Dias === '' || d?.Dias == null || Number.isNaN(Number(d.Dias))) fail(`detalle.${i}.Dias`);
    if (!optionalText(d?.Turno)) fail(`detalle.${i}.Turno`);
    if (!optionalText(d?.Tipo)) fail(`detalle.${i}.Tipo`);
  });
  return body;
}

const ddmmyyyy = (value: string) => {
  const iso = toIsoDate(value);
  return iso ? iso.split('-').reverse().join('/') : value;
};

const ESTADOS: Record<string, string> = {
  APROBADO: 'Autorizado', AUTORIZADO: 'Autorizado', RECHAZADO: 'Rechazado',
  'PRE-APROBADO': 'Pre-aprobado', PROCESO: 'En proceso', PENDIENTE: 'Pendiente',
};
const estadoLabel = (estado: string) => ESTADOS[estado.trim().toUpperCase()] ?? estado;

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

/** "Vacación" por defecto; medio día se indica como "Vacación (Tarde)". */
function tipoLabel(s: SolicitudVacacion, d: SolicitudVacacion['detalle'][number]): string {
  const tipo = d.Tipo?.trim() || s.Tipo?.trim() || 'Vacación';
  const turno = d.Turno?.trim().toUpperCase();
  return turno === 'MAÑANA' || turno === 'TARDE' ? `${tipo} (${capitalize(turno)})` : tipo;
}

export function pdfFileName(solicitud: SolicitudVacacion): string {
  return `SolicitudVacacion_${solicitud.Empleado.replace(/[^A-Za-z0-9]/g, '_')}.pdf`;
}

/** Formulario R-300 "Solicitud de vacación" en A4 vertical. */
export function renderVacacionPdf(s: SolicitudVacacion, logo?: Uint8Array): Buffer {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const center = pageWidth / 2;
  doc.setProperties({ title: `Solicitud de vacación - ${s.Empleado}`, author: 'MINOIL' });
  doc.setTextColor(0);
  doc.setDrawColor(0);

  const write = (content: string, x: number, y: number, bold = false, size = 10,
    align: 'left' | 'center' | 'right' = 'left') => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.text(content, x, y, { align });
  };
  /** Etiqueta en negrita seguida de su valor. */
  const field = (label: string, value: string, x: number, y: number, valueX?: number) => {
    write(label, x, y, true);
    write(value, valueX ?? x + doc.getTextWidth(label) + 4, y);
  };
  const border = () => {
    doc.setLineWidth(0.2);
    doc.setLineDashPattern([0.6, 0.6], 0);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
    doc.setLineDashPattern([], 0);
  };

  // Encabezado
  if (logo) doc.addImage(logo, 'PNG', 15, 15, 45, 9);
  write('SOLICITUD DE VACACION', center, 21, true, 14, 'center');
  write('N°', center - 3, 29, true, 10, 'right');
  write(s.Codigo, center - 1, 29);
  write('R-300', pageWidth - 28, 18, false, 10, 'center');
  write('V0 - 16-08-17', pageWidth - 28, 23, false, 10, 'center');

  // Datos del empleado
  field('Nombre y Apellido :', s.Empleado, 17, 47);
  field('Cargo :', s.Cargo, 17, 58, 36);
  field('Departamento :', s.Departamento, 95, 58, 125);
  field('Fecha de Ingreso :', ddmmyyyy(s.FechaIngreso), 17, 75);

  // Detalle
  write('Detalle solicitud', center, 99, true, 13, 'center');
  const cols: { title: string; x: number; align: 'left' | 'center' }[] = [
    { title: 'FECHA SOLICITUD', x: 33, align: 'center' },
    { title: 'DESDE', x: 67, align: 'center' },
    { title: 'HASTA', x: 96, align: 'center' },
    { title: 'DIAS', x: 122, align: 'center' },
    { title: 'TIPO', x: 134, align: 'left' },
    { title: 'ESTADO', x: 176, align: 'center' },
  ];
  const lineFrom = 19;
  const lineTo = 190;
  let y = 118;
  cols.forEach((c) => write(c.title, c.x, y, true, 10, c.align));
  doc.setLineWidth(0.5);
  doc.line(lineFrom, y + 2, lineTo, y + 2);
  y += 10;

  const estado = estadoLabel(s.Estado);
  for (const d of s.detalle) {
    if (y > pageHeight - 70) { border(); doc.addPage(); y = 25; }
    const values = [ddmmyyyy(s.FechaSolicitud), ddmmyyyy(d.Desde), ddmmyyyy(d.Hasta),
      Number(d.Dias).toFixed(2), tipoLabel(s, d), estado];
    cols.forEach((c, i) => write(values[i], c.x, y, false, 10, c.align));
    y += 8;
  }
  doc.setLineWidth(0.5);
  doc.line(lineFrom, y - 2, lineTo, y - 2);

  // Observaciones
  y += 10;
  write('Observaciones:', 16, y, true, 11);
  const observaciones = s.Observaciones?.trim();
  if (observaciones) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const lines: string[] = doc.splitTextToSize(observaciones, pageWidth - 36);
    doc.text(lines, 18, y + 7);
    y += 7 + lines.length * 5;
  }

  // Firmas
  y = Math.max(y + 40, 165);
  if (y > pageHeight - 25) { border(); doc.addPage(); y = 60; }
  const signatures = ['Solicitante', 'Jefe de Area', 'Responsable de RRHH', 'Reemplazante'];
  const left = 15;
  const slot = (pageWidth - 2 * left) / signatures.length;
  doc.setLineWidth(0.3);
  signatures.forEach((label, i) => {
    const x = left + slot * i;
    doc.line(x + 2, y, x + slot - 2, y);
    write(label, x + slot / 2, y + 5, true, 10, 'center');
  });

  border();
  return Buffer.from(doc.output('arraybuffer'));
}
