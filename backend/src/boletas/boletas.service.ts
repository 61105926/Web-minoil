import { BadRequestException, Inject, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { BoletaRecord } from './boleta-pdf';

export interface BoletaMonth { month: number; year: number }

@Injectable()
export class BoletasService {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  private phone(numero: string): string {
    if (typeof numero !== 'string' || !/^\+?[0-9][0-9 ()-]{5,24}$/.test(numero.trim())) {
      throw new BadRequestException('Debes indicar un número de teléfono válido en numero.');
    }
    return numero.trim();
  }

  private async call(sql: string, params: (string | number)[], procedure: string): Promise<BoletaRecord[]> {
    try {
      const rows = await this.db.query(sql, params, true);
      if (!Array.isArray(rows)) throw new Error('Formato de resultado inesperado');
      return rows;
    } catch (error: any) {
      // No registrar parámetros ni resultados: contienen teléfono y datos de nómina.
      console.error(`[BOLETAS] Falló ${procedure}; código HANA: ${error.code ?? 'no disponible'}`);
      throw new ServiceUnavailableException('No se pudieron consultar las boletas. Contacta al administrador.');
    }
  }

  async getMonths(numero: string): Promise<BoletaMonth[]> {
    const rows = await this.call('CALL "MINOILDES"."RH__API_Date_Consult"(?)',
      [this.phone(numero)], 'RH__API_Date_Consult');
    const months = new Map<string, BoletaMonth>();
    for (const row of rows) {
      const raw = row.FECHA_PAGO ?? row.fecha_pago;
      const text = raw instanceof Date ? raw.toISOString() : String(raw ?? '');
      const match = text.match(/^(\d{4})-(\d{2})-\d{2}/);
      if (!match) continue;
      const year = Number(match[1]);
      const month = Number(match[2]);
      if (year < 1 || month < 1 || month > 12) continue;
      months.set(`${year}-${month}`, { year, month });
    }
    if (rows.length && !months.size) {
      console.error('[BOLETAS] RH__API_Date_Consult devolvió fechas no válidas');
      throw new ServiceUnavailableException('No se pudieron interpretar los períodos de las boletas.');
    }
    if (!months.size) throw new NotFoundException('No se encontraron boletas para ese teléfono.');
    return [...months.values()].sort((a, b) => b.year - a.year || b.month - a.month);
  }

  async getBoleta(numero: string, fecha: string): Promise<BoletaRecord> {
    if (typeof fecha !== 'string' || !/^[1-9]\d{3}(0[1-9]|1[0-2])$/.test(fecha)) {
      throw new BadRequestException('La fecha debe tener formato AAAAMM, por ejemplo 202610.');
    }
    const rows = await this.call('CALL "MINOILDES"."RH__API_ConsultaBoleta"(?, ?)',
      [this.phone(numero), Number(fecha)], 'RH__API_ConsultaBoleta');
    if (!rows.length) throw new NotFoundException('No se encontraron datos para ese período.');
    return rows[0];
  }
}
