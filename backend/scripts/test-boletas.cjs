const { test } = require('node:test');
const assert = require('node:assert/strict');
require('reflect-metadata');
const { BoletasService } = require('../dist/boletas/boletas.service');
const { BoletasController } = require('../dist/boletas/boletas.controller');
const { renderBoletaPdf } = require('../dist/boletas/boleta-pdf');

const telefono = '70000000';
const status = code => error => error.getStatus() === code;

test('meses: llamada enlazada, deduplicación, orden y fechas sin cambio de zona', async () => {
  const service = new BoletasService({ query: async (sql, params) => {
    assert.equal(sql, 'CALL "MINOILDES"."RH__API_Date_Consult"(?)');
    assert.deepEqual(params, [telefono]);
    return [{ FECHA_PAGO: '2026-10-31' }, { FECHA_PAGO: new Date('2026-10-01T00:00:00Z') },
      { FECHA_PAGO: '2025-12-31' }, { FECHA_PAGO: '2026-09-30' }];
  } });
  assert.deepEqual(await service.getMonths(telefono), [
    { year: 2026, month: 10 }, { year: 2026, month: 9 }, { year: 2025, month: 12 },
  ]);
});

test('boleta: teléfono enlazado y período numérico AAAAMM', async () => {
  const record = { NOMBRE: 'EJEMPLO', FECHA_PAGO: '2026-10-31' };
  const service = new BoletasService({ query: async (sql, params) => {
    assert.equal(sql, 'CALL "MINOILDES"."RH__API_ConsultaBoleta"(?, ?)');
    assert.deepEqual(params, [telefono, 202610]);
    return [record];
  } });
  assert.equal(await service.getBoleta(telefono, '202610'), record);
});

test('rechaza entradas inválidas antes de consultar HANA', async () => {
  const service = new BoletasService({ query: () => { throw new Error('No debe consultar'); } });
  for (const fecha of ['202600', '202613', '2026-10', '20261031', '202610 OR 1=1', undefined]) {
    await assert.rejects(service.getBoleta(telefono, fecha), status(400));
  }
  await assert.rejects(service.getMonths("70000000'); DROP TABLE X;--"), status(400));
});

test('sin datos devuelve 404; fallo HANA devuelve 503 sin filtrar resultados', async () => {
  const empty = new BoletasService({ query: async () => [] });
  await assert.rejects(empty.getMonths(telefono), status(404));
  await assert.rejects(empty.getBoleta(telefono, '202610'), status(404));
  const unavailable = new BoletasService({ query: async () => { throw Object.assign(new Error('detalle privado'), { code: 258 }); } });
  await assert.rejects(unavailable.getMonths(telefono), error => error.getStatus() === 503 && !error.message.includes('privado'));
});

test('el controlador recibe numero por query sin depender de una sesión', async () => {
  const controller = new BoletasController({ getMonths: async numero => {
    assert.equal(numero, telefono); return [];
  } });
  await controller.getMonths(telefono);
});

test('stream PDF inline con nombre válido y contenido PDF', async () => {
  const controller = new BoletasController({ getBoleta: async (numero, fecha) => {
    assert.equal(numero, telefono); assert.equal(fecha, '202610');
    return { NOMBRE: 'DATOS FICTICIOS', FECHA_PAGO: '2026-10-31', LIQUIDO_PAGABLE: '5264.50' };
  } });
  const response = await controller.getPdf(telefono, '202610');
  assert.equal(response.getHeaders().type, 'application/pdf');
  assert.equal(response.getHeaders().disposition, 'inline; filename="boleta-202610.pdf"');
  const chunks = [];
  for await (const chunk of response.getStream()) chunks.push(chunk);
  const pdf = Buffer.concat(chunks);
  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
  assert.equal(response.getHeaders().length, pdf.length);
  assert.equal(renderBoletaPdf({ FECHA_PAGO: '2026-10-31' }).subarray(0, 5).toString(), '%PDF-');
});

test('HTTP público: meses y PDF sin Authorization; valida parámetros y conserva no-store', async () => {
  const { Module } = require('@nestjs/common');
  const { NestFactory } = require('@nestjs/core');
  const service = new BoletasService({ query: async (sql, params) => {
    assert.equal(params[0], telefono);
    return sql.includes('RH__API_Date_Consult')
      ? [{ FECHA_PAGO: '2026-10-31' }]
      : [{ NOMBRE: 'DATOS FICTICIOS', FECHA_PAGO: '2026-10-31' }];
  } });
  class TestModule {}
  Module({ controllers: [BoletasController], providers: [{ provide: BoletasService, useValue: service }] })(TestModule);
  const app = await NestFactory.create(TestModule, { logger: false });
  try {
    await app.listen(0, '127.0.0.1');
    const base = await app.getUrl();
    const months = await fetch(`${base}/boletas/meses?numero=${telefono}`);
    assert.equal(months.status, 200);
    assert.deepEqual(await months.json(), [{ year: 2026, month: 10 }]);
    assert.equal(months.headers.get('cache-control'), 'no-store');
    const pdf = await fetch(`${base}/boletas/pdf?numero=${telefono}&fecha=202610`);
    assert.equal(pdf.status, 200);
    assert.equal(pdf.headers.get('content-type'), 'application/pdf');
    assert.equal(pdf.headers.get('content-disposition'), 'inline; filename="boleta-202610.pdf"');
    assert.equal(pdf.headers.get('cache-control'), 'no-store');
    assert.equal(Buffer.from(await pdf.arrayBuffer()).subarray(0, 5).toString(), '%PDF-');
    assert.equal((await fetch(`${base}/boletas/meses`)).status, 400);
    assert.equal((await fetch(`${base}/boletas/pdf?numero=${telefono}&fecha=202613`)).status, 400);
  } finally {
    await app.close();
  }
});
