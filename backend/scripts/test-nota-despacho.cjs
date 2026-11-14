const { test } = require('node:test');
const assert = require('node:assert/strict');
require('reflect-metadata');
const { enLetras, montoEnLetras, fecha, monto, renderNotaDespachoPdf } = require('../dist/nota-despacho/nota-despacho-pdf');
const { NotaDespachoService, validarCuf } = require('../dist/nota-despacho/nota-despacho.service');

const status = code => error => error.getStatus() === code;
const CUF = '45D01BCA8AFCF8883B2103AE28D34EBE70AC1BF10132565D77E54BF74';

test('importe en letras en español', () => {
  assert.equal(enLetras(1), 'UN');
  assert.equal(enLetras(21), 'VEINTIÚN');
  assert.equal(enLetras(100), 'CIEN');
  assert.equal(enLetras(101), 'CIENTO UN');
  assert.equal(enLetras(198), 'CIENTO NOVENTA Y OCHO');
  assert.equal(enLetras(1000), 'MIL');
  assert.equal(enLetras(16443), 'DIECISÉIS MIL CUATROCIENTOS CUARENTA Y TRES');
  assert.equal(enLetras(2_500_000), 'DOS MILLONES QUINIENTOS MIL');
  assert.equal(montoEnLetras('198.32'), 'CIENTO NOVENTA Y OCHO 32/100 BOLIVIANOS');
  assert.equal(montoEnLetras('16443.530000'), 'DIECISÉIS MIL CUATROCIENTOS CUARENTA Y TRES 53/100 BOLIVIANOS');
  assert.equal(montoEnLetras(0.5), 'CERO 50/100 BOLIVIANOS');
});

test('formato de fecha y montos', () => {
  assert.equal(fecha('2026-10-01 00:00:00.000000000'), '01/10/2026');
  assert.equal(monto('16443.530000'), '16,443.53');
});

test('CUF: valida formato antes de consultar HANA', async () => {
  assert.equal(validarCuf(CUF.toLowerCase()), CUF);
  const service = new NotaDespachoService({ query: () => { throw new Error('No debe consultar'); } });
  for (const cuf of [undefined, '', "ABC' OR '1'='1", 'XYZ123']) {
    await assert.rejects(service.obtener(cuf), status(400));
  }
});

test('CUF enlazado como parámetro; 404 si no existe; bonificaciones al final', async () => {
  const calls = [];
  const service = new NotaDespachoService({ query: async (sql, params) => {
    calls.push(params);
    if (calls.length === 1) return [{ DocNum: 1, CardCode: 'C1', Cliente: 'X', DocTotalFC: '10' }];
    return [
      { Orden: '3.Bonificacion Proveedor-REF', ItemCode: 'B', VisOrder: 0 },
      { Orden: '1. Pedido', ItemCode: 'A2', VisOrder: 2 },
      { Orden: '1. Pedido', ItemCode: 'A1', VisOrder: 1 },
    ];
  } });
  const { lineas } = await service.obtener(CUF);
  assert.deepEqual(calls, [[CUF], [CUF, CUF]]);
  assert.deepEqual(lineas.map(l => l.ItemCode), ['A1', 'A2', 'B']);
  await assert.rejects(new NotaDespachoService({ query: async () => [] }).obtener(CUF), status(404));
});

test('genera un PDF de varias páginas', () => {
  const lineas = Array.from({ length: 60 }, (_, i) => ({
    Orden: i < 55 ? '1. Pedido' : '3.Bonificacion Proveedor-REF', ItemCode: String(i), Dscription: 'PRODUCTO '.repeat(8),
    UnidadMedida: 'Unidad', Quantity: 1, Precio: 2, SubTotal: 2, VisOrder: i, CodeBars: '123', ICE: 0,
  }));
  const pdf = renderNotaDespachoPdf({ DocNum: 1, CardCode: 'C1', Cliente: 'CLIENTE', Fecha: '2026-11-14', DocTotalFC: 110,
    Direccion: 'CALLE '.repeat(40), SlpCode: 1, SlpName: 'V', TransId: 9, Pedido: '7', NroFactura: 1, U_NIT: '1',
    SaldoVencido: 0, DiscSumFC: 0, Almacen: 'ALM', Vencimiento: '2026-11-30' }, lineas);
  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
});
