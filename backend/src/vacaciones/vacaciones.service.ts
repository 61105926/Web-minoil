import {
  BadRequestException, ConflictException, HttpException, Inject, Injectable,
  ServiceUnavailableException, UnprocessableEntityException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

type Row = Record<string, any>;
type Body = Record<string, any>;

const ESTADOS = ['APROBADO', 'RECHAZADO', 'PRE-APROBADO'];
const SAP_DATE_FIELDS = ['FECHA', 'FROMDATE', 'TODATE', 'FROMDATE1', 'TODATE1', 'FROMDATE2', 'TODATE2',
  'FROMDATE3', 'TODATE3', 'FROMDATE4', 'TODATE4'];

const isBlank = (value: unknown) => value === undefined || value === null || String(value).trim() === '';
const optional = (value: unknown) => (isBlank(value) ? null : value);

/** Exige un texto (o número) no vacío y de largo acotado. */
function text(value: unknown, field: string, max = 200): string {
  if (isBlank(value) || !['string', 'number'].includes(typeof value) || String(value).length > max) {
    throw new BadRequestException(`El campo ${field} es obligatorio (máximo ${max} caracteres).`);
  }
  return String(value).trim();
}

function integer(value: unknown, field: string): number {
  if (!/^\d{1,10}$/.test(String(value ?? '').trim())) {
    throw new BadRequestException(`El campo ${field} debe ser un número entero.`);
  }
  return Number(value);
}

/** Normaliza AAAA-MM-DD, DD-MM-AAAA, DD/MM/AAAA o ISO con hora a AAAA-MM-DD; null si no es una fecha. */
export function toIsoDate(value: unknown): string | null {
  const raw = String(value ?? '').trim();
  let match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  let parts = match ? [match[1], match[2], match[3]] : null;
  if (!parts) {
    match = raw.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
    parts = match ? [match[3], match[2], match[1]] : null;
  }
  if (!parts) return null;
  const [y, m, d] = parts.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return parts.join('-');
}

/** Separa listas que HANA devuelve concatenadas en una sola columna. */
const splitList = (value: unknown, separator: string) =>
  String(value ?? '').split(separator).map((item) => item.trim());

@Injectable()
export class VacacionesService {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  private async query(sql: string, params: unknown[], label: string): Promise<Row[]> {
    try {
      const rows = await this.db.query(sql, params, true);
      if (!Array.isArray(rows)) throw new Error('Formato de resultado inesperado');
      return rows;
    } catch (error: any) {
      // No registrar parámetros: contienen datos personales.
      console.error(`[VACACIONES] Falló ${label}; código HANA: ${error.code ?? 'no disponible'}`);
      throw new ServiceUnavailableException('No se pudo completar la operación de vacaciones. Contacta al administrador.');
    }
  }

  async recomendarReemplazante(empId: unknown) {
    const id = text(empId, 'empId', 20);
    const reemplazantes = await this.query('CALL "MINOILDES"."RH__API_RecomendarReemplazante"(?)', [id],
      'RH__API_RecomendarReemplazante');
    return { empId: id, reemplazantes };
  }

  async getEmpleadoData(empId: unknown) {
    const rows = await this.query('CALL "MINOILDES"."EMP_INFO_BASICO"(?)', [text(empId, 'emp_id', 20)],
      'EMP_INFO_BASICO');
    if (!rows.length) return [];
    const row = rows[0];

    const names = splitList(row.ReemplazosNombres, ', ');
    const cargos = splitList(row.ReemplazosCargos, ', ');
    const phones = splitList(row.ReemplazosPhones, ', ');
    const types = splitList(row.ReemplazosTipo, ', ');
    const replacements = names.flatMap((name, i) => (name
      ? [{ id: i + 1, name, cargo: cargos[i] ?? '', phone: phones[i] ?? '', type: types[i] ?? '' }]
      : []));

    return [{
      ...this.empleadoBase(row),
      departamento: row.Departamento,
      vacation: this.vacation(row),
      manager: this.manager(row),
      replacements,
    }];
  }

  async getEmpleadoVacationData(mobile: unknown) {
    const rows = await this.query('CALL "MINOILDES"."RRHH_Detail_Vacation"(?)', [text(mobile, 'mobile', 30)],
      'RRHH_Detail_Vacation');
    if (!rows.length) return [];
    const row = rows[0];
    return [{
      ...this.empleadoBase(row),
      vacation: this.vacation(row),
      manager: this.manager(row),
      replacements: rows.filter((r) => r.ReemplazoID).map((r) => ({
        id: r.ReemplazoID, name: r.ReemplazoNombre, cargo: r.ReemplazoCargo,
        phone: r.ReemplazoPhone, type: r.TipoReemplazo,
      })),
    }];
  }

  private empleadoBase(row: Row) {
    return {
      empID: row.EmpleadoID, fullName: row.EmpleadoNombre, phone: row.EmpleadoPhone,
      cargo: row.EmpleadoCargo, regional: row.EmpleadoRegional, fechaIngreso: row.FechaIngreso,
    };
  }

  private vacation(row: Row) {
    return { years: row.Anios, total: row.TotalVacacion, taken: row.Tomados, available: row.Disponible };
  }

  private manager(row: Row) {
    return { id_manager: row.ManagerID, name: row.ManagerNombre, phone: row.ManagerPhone };
  }

  async actualizarEstado(body: Body) {
    const idSolicitud = integer(body.id_solicitud, 'id_solicitud');
    const estado = String(body.estado ?? '');
    if (!ESTADOS.includes(estado)) {
      throw new BadRequestException(`El estado debe ser uno de: ${ESTADOS.join(', ')}.`);
    }
    const comentario = isBlank(body.comentario) ? '' : String(body.comentario);
    if (comentario.length > 200) throw new BadRequestException('El comentario admite máximo 200 caracteres.');

    await this.query('CALL "MINOILDES"."VAC_ACTUALIZAR_ESTADO"(?, ?, ?)', [idSolicitud, estado, comentario],
      'VAC_ACTUALIZAR_ESTADO');
    return { success: true, message: 'Solicitud actualizada correctamente', data: { id_solicitud: idSolicitud, estado } };
  }

  /** Agrupa las filas (una por fecha) en solicitudes con su arreglo de fechas. */
  private groupSolicitudes(rows: Row[]) {
    const solicitudes = new Map<unknown, Row>();
    for (const row of rows) {
      if (!solicitudes.has(row.ID_SOLICITUD)) {
        solicitudes.set(row.ID_SOLICITUD, {
          id_solicitud: row.ID_SOLICITUD, emp_id: row.EMP_ID, fecha_solicitud: row.FECHA_SOLICITUD,
          estado: row.ESTADO, tipo: row.TIPO, total_dias: row.TOTAL_DIAS, fechas: [],
        });
      }
      solicitudes.get(row.ID_SOLICITUD)!.fechas.push({ fecha: row.FECHA, turno: row.TURNO, observacion: row.OBSERVACION });
    }
    return [...solicitudes.values()];
  }

  async getVacacionesPorManager(manager: unknown) {
    const rows = await this.query('CALL "MINOILDES"."VACACIONES_POR_MANAGER"(?)', [text(manager, 'manager', 20)],
      'VACACIONES_POR_MANAGER');
    return { success: true, data: this.groupSolicitudes(rows) };
  }

  async getVacacionesPorEmpleado(empId: unknown) {
    const rows = await this.query('CALL "MINOILDES"."VACACIONES_POR_EMPLEADO"(?)', [text(empId, 'emp_id', 20)],
      'VACACIONES_POR_EMPLEADO');
    const solicitudes: Row[] = this.groupSolicitudes(rows).map((s) => ({ ...s, reemplazantes: [] }));
    if (solicitudes.length) {
      const ids = solicitudes.map((s) => s.id_solicitud);
      const reemplazantes = await this.query(
        `SELECT "ID_SOLICITUD", "ID_REEMPLAZO", "NOMBRE", "CARGO", "TELEFONO", "TIPO"
         FROM "MINOILDES"."VAC_REEMPLAZANTES" WHERE "ID_SOLICITUD" IN (${ids.map(() => '?').join(', ')})`,
        ids, 'VAC_REEMPLAZANTES');
      for (const s of solicitudes) {
        s.reemplazantes = reemplazantes
          .filter((r) => String(r.ID_SOLICITUD) === String(s.id_solicitud))
          .map(({ ID_SOLICITUD, ...r }) => r);
      }
    }
    return { success: true, data: solicitudes };
  }

  async reemplazanteVacation(empId: unknown) {
    const rows = await this.query('CALL "MINOILDES"."EMP_REEMPLAZOS"(?)', [text(empId, 'emp_id', 20)],
      'EMP_REEMPLAZOS');
    const row = rows[0];
    if (!row || isBlank(row.REEMPLAZOS_NOMBRES)) return { success: true, data: [] };

    const ids = splitList(row.REEMPLAZOS_EMPIDS, ',');
    const cargos = splitList(row.REEMPLAZOS_CARGOS, ',');
    const phones = splitList(row.REEMPLAZOS_PHONES, ',');
    const tipos = splitList(row.REEMPLAZOS_TIPO, ',');
    const data = splitList(row.REEMPLAZOS_NOMBRES, ',').map((nombre, i) => ({
      emp_id: ids[i] ?? null, nombre, cargo: cargos[i] ?? null, telefono: phones[i] ?? null, tipo: tipos[i] ?? null,
    }));
    return { success: true, data };
  }

  async guardarReemplazante(body: Body) {
    const params = [
      integer(body.id_solicitud, 'id_solicitud'),
      text(body.emp_id, 'emp_id', 20),
      text(body.nombre, 'nombre', 150),
      text(body.cargo, 'cargo', 150),
      isBlank(body.telefono) ? null : text(body.telefono, 'telefono', 50),
      isBlank(body.tipo) ? null : text(body.tipo, 'tipo', 50),
    ];
    await this.query(
      `INSERT INTO "MINOILDES"."VAC_REEMPLAZANTES" ("ID_SOLICITUD", "EMP_ID", "NOMBRE", "CARGO", "TELEFONO", "TIPO")
       VALUES (?, ?, ?, ?, ?, ?)`, params, 'INSERT VAC_REEMPLAZANTES');
    return { success: true, message: 'Reemplazante registrado correctamente.' };
  }

  /** Medio día para MAÑANA/TARDE, día completo para cualquier otro turno. */
  static diasPorTurno(turno: unknown): number {
    const value = String(turno ?? 'COMPLETO').toUpperCase();
    return value === 'MAÑANA' || value === 'TARDE' ? 0.5 : 1;
  }

  private validateStore(body: Body) {
    const errors: Record<string, string[]> = {};
    const check = (ok: boolean, field: string, message: string) => { if (!ok) (errors[field] ??= []).push(message); };
    const str = (v: unknown, max = Infinity) => typeof v === 'string' && v.trim() !== '' && v.length <= max;
    const optStr = (v: unknown) => isBlank(v) || typeof v === 'string';

    check(str(body.emp_id, 20), 'emp_id', 'Obligatorio, texto de máximo 20 caracteres.');
    check(str(body.tipo), 'tipo', 'Obligatorio.');
    check(optStr(body.comentario), 'comentario', 'Debe ser texto.');
    check(str(body.manager_id, 20), 'manager_id', 'Obligatorio, texto de máximo 20 caracteres.');
    check(Array.isArray(body.detalle) && body.detalle.length > 0, 'detalle', 'Debe incluir al menos una fecha.');
    (Array.isArray(body.detalle) ? body.detalle : []).forEach((d: Row, i: number) => {
      check(toIsoDate(d?.fecha) !== null, `detalle.${i}.fecha`, 'Fecha inválida.');
      check(str(d?.turno), `detalle.${i}.turno`, 'Obligatorio.');
    });
    check(isBlank(body.reemplazantes) || Array.isArray(body.reemplazantes), 'reemplazantes', 'Debe ser un arreglo.');
    (Array.isArray(body.reemplazantes) ? body.reemplazantes : []).forEach((r: Row, i: number) => {
      check(str(r?.nombre), `reemplazantes.${i}.nombre`, 'Obligatorio.');
      for (const field of ['cargo', 'telefono', 'tipo']) {
        check(optStr(r?.[field]), `reemplazantes.${i}.${field}`, 'Debe ser texto.');
      }
    });
    if (Object.keys(errors).length) throw new UnprocessableEntityException({ status: 'error', errors });
  }

  async storeVacationData(body: Body) {
    this.validateStore(body);
    const detalle: Row[] = body.detalle;
    const reemplazantes: Row[] = Array.isArray(body.reemplazantes) ? body.reemplazantes : [];
    const totalDias = detalle.reduce((sum, d) => sum + VacacionesService.diasPorTurno(d.turno), 0);
    const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/La_Paz' });

    try {
      const solicitudId = await this.db.transaction(async (query) => {
        await query(
          `INSERT INTO "MINOILDES"."VAC_SOLICITUD"
           ("EMP_ID", "FECHA_SOLICITUD", "ESTADO", "TIPO", "TOTAL_DIAS", "COMENTARIO", "MANAGER_ID", "ANTIGUEDAD")
           VALUES (?, TO_DATE(?, 'YYYY-MM-DD'), ?, ?, ?, ?, ?, ?)`,
          [body.emp_id, hoy, 'PROCESO', body.tipo, totalDias, optional(body.comentario), body.manager_id,
            optional(body.antiguedad)]);

        // Igual que la versión anterior: el ID es el máximo dentro de esta misma transacción.
        const [{ ID: id }] = await query('SELECT MAX("ID_SOLICITUD") AS ID FROM "MINOILDES"."VAC_SOLICITUD"');

        for (const d of detalle) {
          await query(
            `INSERT INTO "MINOILDES"."VAC_DETALLE_FECHAS" ("ID_SOLICITUD", "FECHA", "TURNO", "OBSERVACION")
             VALUES (?, TO_DATE(?, 'YYYY-MM-DD'), ?, ?)`,
            [id, toIsoDate(d.fecha), d.turno, optional(d.observacion)]);
        }
        for (const r of reemplazantes) {
          await query(
            `INSERT INTO "MINOILDES"."VAC_REEMPLAZANTES" ("ID_SOLICITUD", "EMP_ID", "NOMBRE", "CARGO", "TELEFONO", "TIPO")
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id, optional(r.emp_id), r.nombre, optional(r.cargo), optional(r.telefono), r.tipo || 'TEMPORAL']);
        }
        return id;
      });
      return { status: 'success', solicitud_id: solicitudId, total_dias: totalDias };
    } catch (error: any) {
      console.error(`[VACACIONES] Falló registro de solicitud; código HANA: ${error.code ?? 'no disponible'}`);
      throw new HttpException({ status: 'error', message: 'No se pudo registrar la solicitud de vacación.' }, 500);
    }
  }

  async addVacation(input: Body) {
    const data: Row = { ...input };
    for (const field of SAP_DATE_FIELDS) {
      if (isBlank(data[field])) data[field] = null;
      else if (!(data[field] = toIsoDate(data[field]))) throw new BadRequestException(`El campo ${field} no es una fecha válida.`);
    }
    data.EMPID = integer(data.EMPID, 'EMPID');

    // Evitar duplicados: las fechas solicitadas vienen en COMMENT como DD-MM-AAAA.
    const fechas: string[] = String(data.COMMENT ?? '').match(/\d{2}-\d{2}-\d{4}/g) ?? [];
    if (fechas.length) {
      const registros = await this.query(
        `SELECT "U_COMMENT" FROM "BD_MINOIL_PROD"."@PLVCH"
         WHERE "U_EMPID" = ? AND "U_ESTADO" != 'R' AND "U_FROMDATE" <= ? AND "U_TODATE" >= ?
         AND (${fechas.map(() => `"U_COMMENT" LIKE '%' || ? || '%'`).join(' OR ')})`,
        [data.EMPID, data.TODATE, data.FROMDATE, ...fechas], 'duplicados @PLVCH');
      if (registros.length) {
        const duplicadas = fechas.filter((f) => registros.some((r) => String(r.U_COMMENT ?? '').includes(f)));
        throw new ConflictException({
          success: false,
          message: `Las siguientes fechas ya tienen una vacación registrada: ${duplicadas.join(', ')}`,
          duplicate: true,
          fechas_duplicadas: duplicadas,
        });
      }
    }

    const [last] = await this.query('SELECT MAX("Code") AS LAST_CODE FROM "BD_MINOIL_PROD"."@PLVCH"', [], 'último Code @PLVCH');
    const lastCode = last?.LAST_CODE;
    const code = lastCode ? String(parseInt(lastCode, 10) + 1).padStart(8, '0') : '00000001';

    const columns: [string, unknown][] = [
      ['Code', code], ['Name', code], ['U_DOCVAC', Number(code)], ['U_FECHA', data.FECHA], ['U_HORA', 0],
      ['U_EMPID', data.EMPID], ['U_COMMENT', optional(data.COMMENT)], ['U_AUTOR', '0'],
      ['U_FROMDATE', data.FROMDATE], ['U_TODATE', data.TODATE], ['U_NUMDIAS', optional(data.NUMDIAS)],
      ['U_TIPO', optional(data.TIPO)], ['U_AUTORIZA', optional(data.AUTORIZA)], ['U_ANIO', optional(data.ANIO)],
      ['U_BRANCH', optional(data.BRANCH)], ['U_DEPT', optional(data.DEPT)], ['U_NAMEEMP', optional(data.NAMEEMP)],
      ['U_NAMECREA', optional(data.NAMECREA)], ['U_NAMEAUTORIZ', optional(data.NAMEAUTORIZ)],
      ['U_ESTADO', optional(data.ESTADO)], ['U_STARTDATE', optional(data.STARTDATE)],
      ['U_NUMDIAS1', optional(data.NUMDIAS1)], ['U_NUMDIAS2', optional(data.NUMDIAS2)],
      ['U_NUMDIAS3', optional(data.NUMDIAS3)], ['U_NUMDIAS4', optional(data.NUMDIAS4)],
      ['U_FROMDATE1', data.FROMDATE1], ['U_TODATE1', data.TODATE1], ['U_FROMDATE2', data.FROMDATE2],
      ['U_TODATE2', data.TODATE2], ['U_FROMDATE3', data.FROMDATE3], ['U_TODATE3', data.TODATE3],
      ['U_FROMDATE4', data.FROMDATE4], ['U_TODATE4', data.TODATE4],
    ];

    try {
      await this.db.query(
        `INSERT INTO "BD_MINOIL_PROD"."@PLVCH" (${columns.map(([c]) => `"${c}"`).join(', ')})
         VALUES (${columns.map(() => '?').join(', ')})`, columns.map(([, v]) => v), true);
    } catch (error: any) {
      console.error(`[VACACIONES] Falló INSERT @PLVCH; código HANA: ${error.code ?? 'no disponible'}`);
      throw new HttpException({ success: false, message: 'Error al registrar la vacación' }, 500);
    }
    return { success: true, message: 'Vacación registrada correctamente', code };
  }
}
