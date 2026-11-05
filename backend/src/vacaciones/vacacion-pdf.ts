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
  detalle: { Desde: string; Hasta: string; Dias: number; Turno?: string | null }[];
  Estado: string;
  Observaciones?: string | null;
}

const isText = (v: unknown) => typeof v === 'string' && v.trim() !== '';

/** Valida el cuerpo con las mismas reglas que la versión anterior en Laravel. */
export function parseSolicitud(body: any): SolicitudVacacion {
  const fail = (field: string) => { throw new BadRequestException(`El campo ${field} es obligatorio o inválido.`); };
  for (const field of ['Codigo', 'Empleado', 'Cargo', 'Departamento', 'Estado']) if (!isText(body?.[field])) fail(field);
  for (const field of ['FechaIngreso', 'FechaSolicitud']) if (!toIsoDate(body[field])) fail(field);
  if (body.Observaciones != null && typeof body.Observaciones !== 'string') fail('Observaciones');
  if (!Array.isArray(body.detalle) || !body.detalle.length) fail('detalle');
  body.detalle.forEach((d: any, i: number) => {
    if (!toIsoDate(d?.Desde)) fail(`detalle.${i}.Desde`);
    if (!toIsoDate(d?.Hasta)) fail(`detalle.${i}.Hasta`);
    if (d?.Dias === '' || d?.Dias == null || Number.isNaN(Number(d.Dias))) fail(`detalle.${i}.Dias`);
    if (d?.Turno != null && typeof d.Turno !== 'string') fail(`detalle.${i}.Turno`);
  });
  return body;
}

const ddmmyyyy = (value: string) => {
  const iso = toIsoDate(value);
  return iso ? iso.split('-').reverse().join('/') : value;
};

export function pdfFileName(solicitud: SolicitudVacacion): string {
  return `SolicitudVacacion_${solicitud.Empleado.replace(/[^A-Za-z0-9]/g, '_')}.pdf`;
}

/** Formulario A4 vertical de solicitud de vacación. */
export function renderVacacionPdf(s: SolicitudVacacion, logo?: Uint8Array): Buffer {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const left = 15;
  const width = doc.internal.pageSize.getWidth() - 30;
  doc.setProperties({ title: `Solicitud de vacación - ${s.Empleado}`, author: 'MINOIL' });
  doc.setLineWidth(0.3);

  const write = (content: string, x: number, y: number, bold = false, size = 9,
    align: 'left' | 'center' | 'right' = 'left') => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.text(content, x, y, { align });
  };

  if (logo) doc.addImage(logo, 'PNG', left, 10, 30, 15);
  write('SOLICITUD DE VACACIÓN', left + width / 2, 20, true, 14, 'center');
  write(`Código: ${s.Codigo}`, left + width, 15, false, 9, 'right');
  write(`Fecha de solicitud: ${ddmmyyyy(s.FechaSolicitud)}`, left + width, 20, false, 9, 'right');

  // Datos del empleado
  let y = 32;
  const rows: [string, string][] = [
    ['Empleado', s.Empleado], ['Cargo', s.Cargo], ['Departamento', s.Departamento],
    ['Fecha de ingreso', ddmmyyyy(s.FechaIngreso)], ['Estado', s.Estado],
  ];
  for (const [label, value] of rows) {
    doc.rect(left, y, 45, 8);
    doc.rect(left + 45, y, width - 45, 8);
    write(label, left + 2, y + 5.5, true);
    write(value, left + 47, y + 5.5);
    y += 8;
  }

  // Detalle de fechas
  y += 8;
  write('DETALLE DE LA SOLICITUD', left, y, true, 10);
  y += 3;
  const cols = [{ title: 'Desde', w: 45 }, { title: 'Hasta', w: 45 }, { title: 'Turno', w: width - 120 }, { title: 'Días', w: 30 }];
  const row = (values: string[], bold: boolean) => {
    if (y > 260) { doc.addPage(); y = 20; }
    let x = left;
    cols.forEach((col, i) => {
      if (bold) { doc.setFillColor(230, 230, 230); doc.rect(x, y, col.w, 8, 'FD'); } else doc.rect(x, y, col.w, 8);
      write(values[i], x + col.w / 2, y + 5.5, bold, 9, 'center');
      x += col.w;
    });
    y += 8;
  };
  row(cols.map((c) => c.title), true);
  let total = 0;
  for (const d of s.detalle) {
    total += Number(d.Dias);
    row([ddmmyyyy(d.Desde), ddmmyyyy(d.Hasta), d.Turno || 'COMPLETO', String(Number(d.Dias))], false);
  }
  doc.rect(left, y, width - 30, 8);
  doc.rect(left + width - 30, y, 30, 8);
  write('TOTAL DÍAS', left + width - 32, y + 5.5, true, 9, 'right');
  write(String(total), left + width - 15, y + 5.5, true, 9, 'center');
  y += 16;

  // Observaciones
  write('OBSERVACIONES', left, y, true, 10);
  y += 3;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const lines: string[] = doc.splitTextToSize(s.Observaciones?.trim() || '-', width - 4);
  const height = Math.max(16, lines.length * 4.5 + 6);
  doc.rect(left, y, width, height);
  doc.text(lines, left + 2, y + 5.5);
  y += height;

  // Firmas
  y = Math.max(y + 35, 250);
  if (y > 280) { doc.addPage(); y = 60; }
  const signatures = ['Solicitante', 'Inmediato superior', 'Recursos Humanos'];
  const slot = width / signatures.length;
  signatures.forEach((label, i) => {
    const x = left + slot * i;
    doc.line(x + 8, y, x + slot - 8, y);
    write(label, x + slot / 2, y + 5, true, 9, 'center');
  });

  return Buffer.from(doc.output('arraybuffer'));
}
