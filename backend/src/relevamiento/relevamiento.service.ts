import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  GuardarRelevamientoDto,
  ItemRelevamientoDto,
} from './dto/guardar-relevamiento.dto';

@Injectable()
export class RelevamientoService {
  constructor(private readonly db: DatabaseService) {}

  // ── Guardar una visita completa → una fila por ItemCode en TradePlayersPrice ──
  async guardar(dto: GuardarRelevamientoDto, idEmpleado: string): Promise<void> {
    // Agrupar items por itemCode (puede venir más de un producto por visita)
    const byItemCode = new Map<string, ItemRelevamientoDto[]>();
    for (const item of dto.items) {
      if (!byItemCode.has(item.itemCode)) byItemCode.set(item.itemCode, []);
      byItemCode.get(item.itemCode)!.push(item);
    }

    for (const [itemCode, items] of byItemCode) {
      await this._insertRow(dto, itemCode, items, idEmpleado);
    }
  }

  private async _insertRow(
    dto:        GuardarRelevamientoDto,
    itemCode:   string,
    items:      ItemRelevamientoDto[],
    idEmpleado: string,
  ): Promise<void> {
    // Buscar la tarea activa para obtener IdTask y la asignación de players
    const taskRows = await this.db.query(
      `SELECT t."Id", p."Players1", p."Players2", p."Players3"
       FROM "MINOILDES"."TradePlayersTask" t
       LEFT JOIN "MINOILDES"."TradePlayerSap" p ON p."ItemCode" = t."ItemCode"
       WHERE t."ItemCode" = ?
         AND t."activo" = 1
         AND t."fechaini" <= CURRENT_DATE
         AND t."fechafin" >= CURRENT_DATE
       LIMIT 1`,
      [itemCode],
    );

    const task = taskRows[0] as any;
    const idTask  = task?.Id   ?? task?.ID   ?? null;
    const player1 = task?.Players1 ?? task?.PLAYERS1 ?? null;
    const player2 = task?.Players2 ?? task?.PLAYERS2 ?? null;
    const player3 = task?.Players3 ?? task?.PLAYERS3 ?? null;

    // Mapear playerCodigo → P1 / P2 / P3
    const find = (codigo: string | null): ItemRelevamientoDto | undefined =>
      codigo ? items.find(i => i.playerCodigo === codigo) : undefined;

    const p1 = find(player1);
    const p2 = find(player2);
    const p3 = find(player3);

    const presencia = (item?: ItemRelevamientoDto): number =>
      item === undefined ? 1 : item.presencia === false ? 0 : 1;

    // Precio propio y presencia propia vienen en cualquiera de los items del grupo
    const precioPropio    = items.find(i => i.precioPropio  != null)?.precioPropio  ?? null;
    const presenciaPropia = items.find(i => i.presenciaPropia != null)?.presenciaPropia;
    const presenciaPropiaBit = presenciaPropia === false ? 0 : 1;

    await this.db.execute(
      `INSERT INTO "MINOILDES"."TradePlayersPrice"
         ("IdTask",  "ItemCode", "CardCode", "CardName",
          "PrecioPropio", "PresenciaPropia",
          "Player1", "PrecioP1", "FacingP1", "PresenciaP1",
          "Player2", "PrecioP2", "FacingP2", "PresenciaP2",
          "Player3", "PrecioP3", "FacingP3", "PresenciaP3",
          "Observacion", "Latitud", "Longitud",
          "IdEmpleado", "Fecha")
       VALUES
         (?,?,?,?,
          ?,?,
          ?,?,?,?,
          ?,?,?,?,
          ?,?,?,?,
          ?,?,?,?,CURRENT_DATE)`,
      [
        idTask,
        itemCode,
        dto.cardCode,
        dto.cardName ?? null,
        // Propio
        precioPropio,
        presenciaPropiaBit,
        // P1
        player1,      p1?.precio ?? null, p1?.facing ?? null, presencia(p1),
        // P2
        player2,      p2?.precio ?? null, p2?.facing ?? null, presencia(p2),
        // P3
        player3,      p3?.precio ?? null, p3?.facing ?? null, presencia(p3),
        // Resto
        items[0]?.observacion ?? null,
        dto.latitud  ?? null,
        dto.longitud ?? null,
        idEmpleado,
      ],
    );
  }

  // ── Historial últimas 30 visitas para un cliente ────────────────────────────
  async getHistorial(cardCode: string): Promise<any[]> {
    return this.db.query(
      `SELECT "Id", "IdTask", "ItemCode", "CardCode", "CardName",
              "Player1", "PrecioP1", "FacingP1", "PresenciaP1",
              "Player2", "PrecioP2", "FacingP2", "PresenciaP2",
              "Player3", "PrecioP3", "FacingP3", "PresenciaP3",
              "Observacion", "Latitud", "Longitud",
              "IdEmpleado", "Fecha", "FechaRegistro"
       FROM "MINOILDES"."TradePlayersPrice"
       WHERE "CardCode" = ?
       ORDER BY "FechaRegistro" DESC
       LIMIT 30`,
      [cardCode],
    );
  }

  // ── KPIs del día para el empleado ───────────────────────────────────────────
  async getMiDia(idEmpleado: string): Promise<any> {
    const rows = await this.db.query(
      `SELECT
         COUNT(DISTINCT "CardCode")                                   AS "clientesVisitados",
         COUNT(*)                                                     AS "registros",
         SUM(
           COALESCE("PrecioP1", 0) + COALESCE("PrecioP2", 0) + COALESCE("PrecioP3", 0)
         ) / NULLIF(
           SUM(
             CASE WHEN "PrecioP1" IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN "PrecioP2" IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN "PrecioP3" IS NOT NULL THEN 1 ELSE 0 END
           ), 0
         )                                                            AS "precioPromedio"
       FROM "MINOILDES"."TradePlayersPrice"
       WHERE "IdEmpleado" = ?
         AND "Fecha" = CURRENT_DATE`,
      [idEmpleado],
    );

    return rows[0] ?? { clientesVisitados: 0, registros: 0, precioPromedio: null };
  }
}
