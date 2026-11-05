const { test } = require('node:test');
const assert = require('node:assert/strict');
require('reflect-metadata');
const { VacacionesService, toIsoDate } = require('../dist/vacaciones/vacaciones.service');
const { parseSolicitud, renderVacacionPdf } = require('../dist/vacaciones/vacacion-pdf');

const status = code => error => error.getStatus() === code;
const noDb = { query: () => { throw new Error('No debe consultar'); } };

test('fechas: acepta AAAA-MM-DD y DD-MM-AAAA, rechaza fechas imposibles', () => {
  assert.equal(toIsoDate('2026-11-04'), '2026-11-04');
  assert.equal(toIsoDate('04-11-2026'), '2026-11-04');
  assert.equal(toIsoDate('2026-11-04T10:00:00Z'), '2026-11-04');
  assert.equal(toIsoDate('2026-02-30'), null);
});

test('los parámetros se enlazan, no se concatenan en el SQL', async () => {
  const service = new VacacionesService({ query: async (sql, params) => {
    assert.equal(sql, 'CALL "MINOILDES"."RH__API_RecomendarReemplazante"(?)');
    assert.deepEqual(params, ["1'); DROP TABLE X;--"]);
    return [{ NOMBRE: 'A' }];
  } });
  assert.deepEqual(await service.recomendarReemplazante("1'); DROP TABLE X;--"),
    { empId: "1'); DROP TABLE X;--", reemplazantes: [{ NOMBRE: 'A' }] });
});

test('empleado: separa reemplazos concatenados', async () => {
  const service = new VacacionesService({ query: async () => [{
    EmpleadoID: 1, EmpleadoNombre: 'Ana', Departamento: 'TI', Anios: 3, Disponible: 5, ManagerID: 9,
    ReemplazosNombres: 'Luis, Eva', ReemplazosCargos: 'Dev, QA', ReemplazosPhones: '7, 8', ReemplazosTipo: 'T, P',
  }] });
  const [emp] = await service.getEmpleadoData('1');
  assert.equal(emp.departamento, 'TI');
  assert.equal(emp.vacation.available, 5);
  assert.equal(emp.manager.id_manager, 9);
  assert.deepEqual(emp.replacements, [
    { id: 1, name: 'Luis', cargo: 'Dev', phone: '7', type: 'T' },
    { id: 2, name: 'Eva', cargo: 'QA', phone: '8', type: 'P' },
  ]);
  assert.deepEqual(await new VacacionesService({ query: async () => [] }).getEmpleadoData('1'), []);
});

test('solicitudes por empleado: agrupa fechas y adjunta reemplazantes en una sola consulta', async () => {
  const calls = [];
  const service = new VacacionesService({ query: async (sql, params) => {
    calls.push(params);
    if (sql.startsWith('CALL')) return [
      { ID_SOLICITUD: 1, EMP_ID: 5, ESTADO: 'PROCESO', FECHA: '2026-11-10', TURNO: 'COMPLETO' },
      { ID_SOLICITUD: 1, EMP_ID: 5, ESTADO: 'PROCESO', FECHA: '2026-11-11', TURNO: 'TARDE' },
      { ID_SOLICITUD: 2, EMP_ID: 5, ESTADO: 'APROBADO', FECHA: '2026-12-01', TURNO: 'MAÑANA' },
    ];
    return [{ ID_SOLICITUD: 1, ID_REEMPLAZO: 7, NOMBRE: 'Luis' }];
  } });
  const { data } = await service.getVacacionesPorEmpleado('5');
  assert.equal(data.length, 2);
  assert.equal(data[0].fechas.length, 2);
  assert.deepEqual(data[0].reemplazantes, [{ ID_REEMPLAZO: 7, NOMBRE: 'Luis' }]);
  assert.deepEqual(data[1].reemplazantes, []);
  assert.deepEqual(calls[1], [1, 2]);
});

test('actualizar estado valida antes de llamar a HANA', async () => {
  const service = new VacacionesService(noDb);
  await assert.rejects(service.actualizarEstado({ id_solicitud: 1, estado: 'OTRO' }), status(400));
  await assert.rejects(service.actualizarEstado({ id_solicitud: 'x', estado: 'APROBADO' }), status(400));
  await assert.rejects(service.actualizarEstado({ id_solicitud: 1, estado: 'APROBADO', comentario: 'x'.repeat(201) }), status(400));
});

test('registrar solicitud: medio día por turno, transacción y 422 con errores', async () => {
  assert.equal(VacacionesService.diasPorTurno('mañana'), 0.5);
  assert.equal(VacacionesService.diasPorTurno('Tarde'), 0.5);
  assert.equal(VacacionesService.diasPorTurno('COMPLETO'), 1);

  const sqls = [];
  const service = new VacacionesService({ transaction: async work => work(async (sql, params) => {
    sqls.push([sql, params]);
    return sql.includes('MAX') ? [{ ID: 42 }] : [];
  }) });
  const result = await service.storeVacationData({
    emp_id: '5', tipo: 'VACACION', manager_id: '9',
    detalle: [{ fecha: '2026-11-10', turno: 'COMPLETO' }, { fecha: '11-11-2026', turno: 'TARDE' }],
    reemplazantes: [{ nombre: 'Luis' }],
  });
  assert.deepEqual(result, { status: 'success', solicitud_id: 42, total_dias: 1.5 });
  assert.equal(sqls[2][1][1], '2026-11-10');
  assert.equal(sqls[3][1][1], '2026-11-11');
  assert.deepEqual(sqls[4][1], [42, null, 'Luis', null, null, 'TEMPORAL']);

  await assert.rejects(new VacacionesService(noDb).storeVacationData({ detalle: [] }),
    e => e.getStatus() === 422 && 'emp_id' in e.getResponse().errors);
});

test('SAP: detecta fechas duplicadas con parámetros enlazados (409)', async () => {
  const service = new VacacionesService({ query: async (sql, params) => {
    assert.match(sql, /LIKE '%' \|\| \? \|\| '%'/);
    assert.deepEqual(params, [5, '2026-11-11', '2026-11-10', '10-11-2026', '11-11-2026']);
    return [{ U_COMMENT: 'Fechas: 11-11-2026' }];
  } });
  await assert.rejects(service.addVacation({ EMPID: 5, FROMDATE: '2026-11-10', TODATE: '2026-11-11',
    COMMENT: '10-11-2026, 11-11-2026' }), e => e.getStatus() === 409
      && e.getResponse().fechas_duplicadas.join() === '11-11-2026');
});

test('SAP: siguiente Code con ceros a la izquierda e INSERT parametrizado', async () => {
  let insert;
  const service = new VacacionesService({ query: async (sql, params) => {
    if (sql.includes('MAX("Code")')) return [{ LAST_CODE: '00000041' }];
    insert = { sql, params };
    return [];
  } });
  const result = await service.addVacation({ EMPID: '5', FECHA: '04-11-2026', COMMENT: "O'Brien" });
  assert.deepEqual(result, { success: true, message: 'Vacación registrada correctamente', code: '00000042' });
  assert.ok(!insert.sql.includes("O'Brien"));
  assert.deepEqual(insert.params.slice(0, 8), ['00000042', '00000042', 42, '2026-11-04', 0, 5, "O'Brien", '0']);
});

test('PDF de solicitud: valida y genera un PDF', () => {
  assert.throws(() => parseSolicitud({ Codigo: 'X' }), status(400));
  const solicitud = parseSolicitud({
    Codigo: 'V-1', Empleado: 'Ana Pérez', Cargo: 'Dev', Departamento: 'TI',
    FechaIngreso: '2020-01-15', FechaSolicitud: '2026-11-04', Estado: 'PROCESO',
    detalle: [{ Desde: '2026-11-10', Hasta: '2026-11-11', Dias: 1.5, Turno: 'TARDE' }],
  });
  const pdf = renderVacacionPdf(solicitud);
  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
});
