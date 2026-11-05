const { test } = require('node:test');
const assert = require('node:assert/strict');
require('reflect-metadata');
const { LegacyApiService } = require('../dist/legacy-api/legacy-api.service');
const { LegacyApiController, detalleFromQuery } = require('../dist/legacy-api/legacy-api.controller');

const status = code => error => error.getStatus() === code;
const noDb = { query: () => { throw new Error('No debe consultar'); } };

test('detalle desde query string: con índice, sin índice y JSON', () => {
  assert.deepEqual(detalleFromQuery('/api/vacacion?detalle%5B0%5D%5BDesde%5D=a&detalle%5B0%5D%5BDias%5D=1&detalle%5B1%5D%5BDesde%5D=b'),
    [{ Desde: 'a', Dias: '1' }, { Desde: 'b' }]);
  assert.deepEqual(detalleFromQuery('/x?detalle[][Desde]=a&detalle[][Hasta]=b&detalle[][Desde]=c'),
    [{ Desde: 'a', Hasta: 'b' }, { Desde: 'c' }]);
  assert.deepEqual(detalleFromQuery('/x?detalle=' + encodeURIComponent('[{"Desde":"a"}]')), [{ Desde: 'a' }]);
  assert.equal(detalleFromQuery('/x?otro=1'), undefined);
});

test('inventario: convierte DD-MM-AAAA y enlaza parámetros', async () => {
  const service = new LegacyApiService({ query: async (sql, params) => {
    assert.equal(sql, 'CALL "MINOILDES"."R015VencimientosYAccionesDev"(?, ?)');
    assert.deepEqual(params, ['2024-12-01', '2024-12-31']);
    return [{ Stock: 1 }];
  } });
  assert.deepEqual(await service.inventory('01-12-2024', '31-12-2024'), [{ Stock: 1 }]);
  await assert.rejects(new LegacyApiService(noDb).inventory("01-12-2024'); --", '31-12-2024'), status(400));
});

test('getUserStatus: empID numérico enlazado; 404 si no existe', async () => {
  const service = new LegacyApiService({ query: async (sql, params) => {
    assert.match(sql, /WHERE t0\."empID" = \?/);
    assert.deepEqual(params, [7]);
    return [{ login: true }];
  } });
  assert.deepEqual(await service.getUserStatus({ empID: '7' }), { success: true, data: [{ login: true }] });
  await assert.rejects(new LegacyApiService({ query: async () => [] }).getUserStatus({ empID: 7 }), status(404));
  await assert.rejects(new LegacyApiService(noDb).getUserStatus({ empID: '1 OR 1=1' }), status(400));
});

test('updateLogin / updateFinished: mismas reglas que PHP y filas afectadas', async () => {
  const sqls = [];
  const service = new LegacyApiService({ query: async sql => { sqls.push(sql); return sql.includes('"login"') ? 1 : []; } });
  assert.deepEqual(await service.updateLogin({ empID: 1, login: 0 }), { success: true, message: 'Login actualizado exitosamente.' });
  assert.deepEqual(await service.updateFinished({ empID: 1, finished: false }),
    { success: false, message: 'No se encontró ningún registro para actualizar.' });
  assert.match(sqls[1], /SET "completo" = TRUE/);
  await assert.rejects(new LegacyApiService(noDb).updateLogin({ empID: 1, login: 1 }), status(400));
  await assert.rejects(new LegacyApiService(noDb).updateFinished({ empID: 1, finished: true }), status(400));
});

test('storeResponses: una llamada por respuesta dentro de una transacción', async () => {
  const calls = [];
  const service = new LegacyApiService({ transaction: async work => work(async (sql, params) => { calls.push(params); return []; }) });
  assert.deepEqual(await service.storeResponses({ responses: [{ question_id: 1, response_id: 2 }, { question_id: 3 }] }), { success: true });
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[0].slice(0, 7), [1, 2, null, null, null, null, null]);
  assert.match(calls[0][7], /^\d{4}-\d{2}-\d{2}$/);
  assert.deepEqual(await new LegacyApiService(noDb).storeResponses({}), { success: true });
});

test('controlador: dateConsult devuelve month/year y mezcla query con cuerpo como Laravel', async () => {
  const controller = new LegacyApiController(
    { getMonths: async numero => { assert.equal(numero, '70000000'); return [{ year: 2026, month: 10 }]; } },
    { actualizarEstado: async body => body }, {}, {});
  assert.deepEqual(await controller.dateConsult({ query: { numero: '70000000' } }), [{ month: 10, year: 2026 }]);
  assert.deepEqual(await controller.actualizarEstado({ query: { estado: 'X', id_solicitud: 1 }, body: { estado: 'APROBADO' } }),
    { estado: 'APROBADO', id_solicitud: 1 });
});
