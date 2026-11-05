import {
  BadRequestException, HttpException, Inject, Injectable, NotFoundException, ServiceUnavailableException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { toIsoDate } from '../vacaciones/vacaciones.service';

type Body = Record<string, any>;

const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/La_Paz' });

/** Valores que PHP considera `== 0` / `== false` en las validaciones originales. */
const isFalsy = (value: unknown) =>
  value === undefined || value === null || value === false || value === 0 || value === '0' || value === '';

function empId(value: unknown): number {
  if (!/^\d{1,10}$/.test(String(value ?? '').trim())) {
    throw new BadRequestException('El campo empID debe ser un número entero.');
  }
  return Number(value);
}

/** Clima laboral, inventario y stock: endpoints heredados de Laravel (ServiceController). */
@Injectable()
export class LegacyApiService {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  private async run(sql: string, params: unknown[], label: string): Promise<any> {
    try {
      return await this.db.query(sql, params, true);
    } catch (error: any) {
      // No registrar parámetros: pueden contener datos personales.
      console.error(`[API] Falló ${label}; código HANA: ${error.code ?? 'no disponible'}`);
      throw new ServiceUnavailableException('No se pudo completar la consulta. Contacta al administrador.');
    }
  }

  private async rows(sql: string, params: unknown[], label: string): Promise<any[]> {
    const result = await this.run(sql, params, label);
    return Array.isArray(result) ? result : [];
  }

  /** HANA devuelve el número de filas afectadas en UPDATE; la conexión lo convierte en [] cuando es 0. */
  private async affected(sql: string, params: unknown[], label: string): Promise<number> {
    const result = await this.run(sql, params, label);
    return typeof result === 'number' ? result : 0;
  }

  async inventory(fechai: unknown, fechaf: unknown) {
    const desde = toIsoDate(fechai);
    const hasta = toIsoDate(fechaf);
    if (!desde || !hasta) throw new BadRequestException('fechai y fechaf deben tener formato DD-MM-AAAA.');
    return this.rows('CALL "MINOILDES"."R015VencimientosYAccionesDev"(?, ?)', [desde, hasta],
      'R015VencimientosYAccionesDev');
  }

  async getUserStatus(body: Body) {
    const data = await this.rows(
      `SELECT t0."login", t0."completo", t0."regional", t0."posicion",
              t1."firstName" || ' ' || t1."lastName" AS "fullName"
       FROM "MINOILDES"."RRHH_Clima_Acceso" t0
       INNER JOIN "BD_MINOIL_PROD"."OHEM" t1 ON t0."empID" = t1."empID"
       WHERE t0."empID" = ?`, [empId(body.empID)], 'RRHH_Clima_Acceso');
    if (!data.length) throw new NotFoundException({ success: false, message: 'Usuario no encontrado' });
    return { success: true, data };
  }

  private async markAccess(column: 'login' | 'completo', body: Body, allowed: boolean) {
    if (!allowed) throw new BadRequestException({ success: false, message: 'Valor de login no válido.' });
    const count = await this.affected(
      `UPDATE "MINOILDES"."RRHH_Clima_Acceso" SET "${column}" = TRUE WHERE "empID" = ?`,
      [empId(body.empID)], `UPDATE RRHH_Clima_Acceso.${column}`);
    return count > 0
      ? { success: true, message: 'Login actualizado exitosamente.' }
      : { success: false, message: 'No se encontró ningún registro para actualizar.' };
  }

  updateLogin(body: Body) {
    return this.markAccess('login', body, isFalsy(body.login));
  }

  updateFinished(body: Body) {
    return this.markAccess('completo', body, isFalsy(body.finished));
  }

  async storeResponses(body: Body) {
    const responses = Array.isArray(body.responses) ? body.responses : [];
    if (!responses.length) return { success: true };
    const fecha = today();
    try {
      // Todas o ninguna: Laravel podía dejar respuestas a medias si una fallaba.
      await this.db.transaction(async (query) => {
        for (const r of responses) {
          await query('CALL "MINOILDES"."RRHH_INSERT_RESPONSES"(?, ?, ?, ?, ?, ?, ?, ?)', [
            r?.question_id ?? null, r?.response_id ?? null, r?.response_text ?? null, r?.additional_info ?? null,
            r?.is_selected ?? null, r?.regional ?? null, r?.posicion ?? null, fecha,
          ]);
        }
      });
    } catch (error: any) {
      console.error(`[API] Falló RRHH_INSERT_RESPONSES; código HANA: ${error.code ?? 'no disponible'}`);
      throw new HttpException({ success: false, error: 'Error al almacenar las respuestas' }, 500);
    }
    return { success: true };
  }

  async climaResponse() {
    // Laravel ejecutaba este procedimiento antes del SELECT y descartaba su resultado; se conserva por si
    // tiene efectos sobre RRHH_CLIMA_RESPONSES.
    await this.run('CALL "MINOILDES"."RRHH_CLIMA_RESPONSES_DEV"()', [], 'RRHH_CLIMA_RESPONSES_DEV');
    return this.rows(
      `SELECT t0."question_id", t0."response_id",
              CAST(t0."response_text" AS VARCHAR(30)) AS "response_text",
              CAST(t0."additional_info" AS VARCHAR(100)) AS "additional_info",
              CAST(t0."is_selected" AS VARCHAR(30)) AS "is_selected",
              CAST(t0."regional" AS VARCHAR(30)) AS "regional",
              CAST(t0."posicion" AS VARCHAR(30)) AS "posicion",
              YEAR(t0."gestion") AS "gestion",
              CAST(t1."name" AS VARCHAR(30)) AS "area"
       FROM "MINOILDES"."RRHH_CLIMA_RESPONSES" t0
       INNER JOIN "BD_MINOIL_PROD"."OHPS" t1 ON t0."posicion" = TO_VARCHAR(t1."posID")`,
      [], 'RRHH_CLIMA_RESPONSES');
  }

  drinkStock() {
    return this.rows('CALL "MINOILDES"."Produccion_Stock_dev2"(5)', [], 'Produccion_Stock_dev2');
  }
}
