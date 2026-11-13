import { BadRequestException, Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface ImpostorStockData {
  CardCode: string;
  ItemCode: string;
  BatchNum: string;
  StockSala: number;
  StockBodega: number;
  regional?: string | null;
  empleado?: string | null;
}

/** Cuánto se recuerda un conteoId ya guardado, para que un reintento no duplique filas. */
const CONTEO_TTL_MS = 24 * 60 * 60 * 1000;

const text = (value: unknown, field: string, index: number, max = 50): string => {
  const result = String(value ?? '').trim();
  if (!result || result.length > max) {
    throw new BadRequestException(`Registro ${index + 1}: ${field} es obligatorio (máximo ${max} caracteres).`);
  }
  return result;
};

const quantity = (value: unknown, field: string, index: number): number => {
  const result = Number(value ?? 0);
  if (!Number.isFinite(result) || result < 0) {
    throw new BadRequestException(`Registro ${index + 1}: ${field} debe ser un número mayor o igual a 0.`);
  }
  return result;
};

@Injectable()
export class ImpostorService {
  /** conteoId → momento en que se guardó. Se pierde al reiniciar; cubre los reintentos inmediatos. */
  private readonly conteosGuardados = new Map<string, number>();

  constructor(@Inject(DatabaseService) private readonly databaseService: DatabaseService) {}

  private yaGuardado(conteoId?: string): boolean {
    const now = Date.now();
    for (const [id, savedAt] of this.conteosGuardados) {
      if (now - savedAt > CONTEO_TTL_MS) this.conteosGuardados.delete(id);
    }
    return !!conteoId && this.conteosGuardados.has(conteoId);
  }

  /**
   * Inserta todo el conteo en una sola transacción: o se guardan todas las filas o ninguna.
   * Devuelve `duplicado: true` si ese conteoId ya se había guardado (reintento del cliente).
   */
  async insertarStock(datos: ImpostorStockData[], conteoId?: string): Promise<{ duplicado: boolean }> {
    if (!Array.isArray(datos) || datos.length === 0) {
      throw new BadRequestException('No se proporcionaron datos para insertar.');
    }
    if (this.yaGuardado(conteoId)) return { duplicado: true };

    const filas = datos.map((r, i) => [
      text(r.CardCode, 'CardCode', i),
      text(r.ItemCode, 'ItemCode', i),
      text(r.BatchNum, 'BatchNum', i),
      quantity(r.StockSala, 'StockSala', i),
      quantity(r.StockBodega, 'StockBodega', i),
      r.regional ? String(r.regional).slice(0, 100) : null,
      r.empleado ? String(r.empleado).slice(0, 150) : null,
    ]);

    try {
      await this.databaseService.transaction(async (query) => {
        for (const params of filas) {
          await query(
            `INSERT INTO "MINOILDES"."IMPOSTORSTOCKPRODUCTOLOTE"
             ("CARDCODE","ITEMCODE","BATCHNUM","STOCKSALA","STOCKBODEGA","REGIONAL","EMPLEADO")
             VALUES (?,?,?,?,?,?,?)`,
            params,
          );
        }
      });
    } catch (error: any) {
      console.error(`[IMPOSTOR] Falló el guardado de ${filas.length} registros; código HANA: ${error.code ?? 'no disponible'}`);
      throw new ServiceUnavailableException('No se pudo guardar el conteo. Inténtalo nuevamente.');
    }

    if (conteoId) this.conteosGuardados.set(conteoId, Date.now());
    console.log(`[IMPOSTOR] ${filas.length} registros guardados (sala ${filas[0][0]})`);
    return { duplicado: false };
  }
}
