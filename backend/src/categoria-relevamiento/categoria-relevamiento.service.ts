import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface TradeItem {
  codigo: string;
  nombre: string;
  rubro: string | null;
  grupo: string | null;
  subgrupo: string | null;
  clase: string | null;
  subclase: string | null;
}

export interface PlayerSap {
  itemCode: string;
  players1: string | null;
  players2: string | null;
  players3: string | null;
}

export interface PlayersTask {
  itemCode: string;
  itemName?: string;
  fecha: string;
  fechaini: string;
  fechafin: string;
  cartera: number;
  usuario: string;
  activo: number;
  players1?: string | null;
  players2?: string | null;
  players3?: string | null;
  nombrePlayer1?: string | null;
  nombrePlayer2?: string | null;
  nombrePlayer3?: string | null;
}

@Injectable()
export class CategoriaRelevamientoService {
  constructor(
    @Inject(DatabaseService) private db: DatabaseService,
  ) {}

  // Productos propios de SAP
  async getProductosPropios(): Promise<{ itemCode: string; itemName: string }[]> {
    const rows = await this.db.query(`
      SELECT "ItemCode", "ItemName"
      FROM "BD_MINOIL_PROD"."OITM"
      WHERE "frozenFor" <> 'Y'
      ORDER BY "ItemName" ASC
    `);
    return rows.map((r: any) => ({
      itemCode: String(r.ItemCode ?? r.ITEMCODE ?? '').trim(),
      itemName: String(r.ItemName ?? r.ITEMNAME ?? '').trim(),
    })).filter((p: any) => p.itemCode && p.itemName);
  }

  // Catálogo de competidores
  async getTradeItems(): Promise<TradeItem[]> {
    const rows = await this.db.query(`
      SELECT "codigo","Nombre","rubro","grupo","subgrupo","clase","subclase"
      FROM "MINOILDES"."TradeItemsPlayers"
      ORDER BY "Nombre" ASC
    `);
    return rows.map((r: any) => ({
      codigo:   String(r.codigo   ?? r.CODIGO   ?? ''),
      nombre:   String(r.Nombre   ?? r.NOMBRE   ?? ''),
      rubro:    r.rubro    ?? r.RUBRO    ?? null,
      grupo:    r.grupo    ?? r.GRUPO    ?? null,
      subgrupo: r.subgrupo ?? r.SUBGRUPO ?? null,
      clase:    r.clase    ?? r.CLASE    ?? null,
      subclase: r.subclase ?? r.SUBCLASE ?? null,
    }));
  }

  // Players asignados a un ItemCode
  async getPlayerSap(itemCode: string): Promise<PlayerSap | null> {
    const rows = await this.db.query(
      `SELECT "ItemCode","Players1","Players2","Players3"
       FROM "MINOILDES"."TradePlayerSap"
       WHERE "ItemCode" = ?`,
      [String(itemCode)],
    );
    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    return {
      itemCode: String(r.ItemCode ?? r.ITEMCODE ?? ''),
      players1: r.Players1 ?? r.PLAYERS1 ?? null,
      players2: r.Players2 ?? r.PLAYERS2 ?? null,
      players3: r.Players3 ?? r.PLAYERS3 ?? null,
    };
  }

  async upsertPlayerSap(data: PlayerSap): Promise<void> {
    const existing = await this.getPlayerSap(data.itemCode);
    if (existing) {
      await this.db.execute(
        `UPDATE "MINOILDES"."TradePlayerSap"
         SET "Players1"=?, "Players2"=?, "Players3"=?
         WHERE "ItemCode"=?`,
        [
          data.players1 ? String(data.players1) : null,
          data.players2 ? String(data.players2) : null,
          data.players3 ? String(data.players3) : null,
          String(data.itemCode),
        ],
      );
    } else {
      await this.db.execute(
        `INSERT INTO "MINOILDES"."TradePlayerSap" ("ItemCode","Players1","Players2","Players3")
         VALUES (?,?,?,?)`,
        [
          String(data.itemCode),
          data.players1 ? String(data.players1) : null,
          data.players2 ? String(data.players2) : null,
          data.players3 ? String(data.players3) : null,
        ],
      );
    }
  }

  // Tareas / programaciones
  async getTareas(): Promise<PlayersTask[]> {
    const rows = await this.db.query(`
      SELECT t."ItemCode", o."ItemName",
             t."fecha", t."fechaini", t."fechafin",
             t."cartera", t."usuario", t."activo",
             p."Players1", p."Players2", p."Players3",
             ti1."Nombre" AS "NombrePlayer1",
             ti2."Nombre" AS "NombrePlayer2",
             ti3."Nombre" AS "NombrePlayer3"
      FROM "MINOILDES"."TradePlayersTask" t
      LEFT JOIN "BD_MINOIL_PROD"."OITM" o ON o."ItemCode" = t."ItemCode"
      LEFT JOIN "MINOILDES"."TradePlayerSap" p ON p."ItemCode" = t."ItemCode"
      LEFT JOIN "MINOILDES"."TradeItemsPlayers" ti1 ON ti1."codigo" = p."Players1"
      LEFT JOIN "MINOILDES"."TradeItemsPlayers" ti2 ON ti2."codigo" = p."Players2"
      LEFT JOIN "MINOILDES"."TradeItemsPlayers" ti3 ON ti3."codigo" = p."Players3"
      ORDER BY t."fecha" DESC
    `);
    return rows.map((r: any) => ({
      itemCode:      String(r.ItemCode  ?? r.ITEMCODE  ?? ''),
      itemName:      String(r.ItemName  ?? r.ITEMNAME  ?? ''),
      fecha:         this.fmtDate(r.fecha    ?? r.FECHA),
      fechaini:      this.fmtDate(r.fechaini ?? r.FECHAINI),
      fechafin:      this.fmtDate(r.fechafin ?? r.FECHAFIN),
      cartera:       Number(r.cartera   ?? r.CARTERA   ?? 0),
      usuario:       String(r.usuario   ?? r.USUARIO   ?? ''),
      activo:        Number(r.activo    ?? r.ACTIVO    ?? 1),
      players1:      r.Players1 ?? r.PLAYERS1 ?? null,
      players2:      r.Players2 ?? r.PLAYERS2 ?? null,
      players3:      r.Players3 ?? r.PLAYERS3 ?? null,
      nombrePlayer1: r.NombrePlayer1 ?? r.NOMBREPLAYER1 ?? null,
      nombrePlayer2: r.NombrePlayer2 ?? r.NOMBREPLAYER2 ?? null,
      nombrePlayer3: r.NombrePlayer3 ?? r.NOMBREPLAYER3 ?? null,
    }));
  }

  async getTareasActivas(cartera?: number): Promise<PlayersTask[]> {
    const filtroCartera = cartera != null ? `AND t."cartera" = ${Number(cartera)}` : '';
    const rows = await this.db.query(`
      SELECT t."ItemCode", o."ItemName",
             t."fecha", t."fechaini", t."fechafin",
             t."cartera", t."usuario", t."activo",
             p."Players1", p."Players2", p."Players3",
             ti1."Nombre" AS "NombrePlayer1",
             ti2."Nombre" AS "NombrePlayer2",
             ti3."Nombre" AS "NombrePlayer3"
      FROM "MINOILDES"."TradePlayersTask" t
      LEFT JOIN "BD_MINOIL_PROD"."OITM" o ON o."ItemCode" = t."ItemCode"
      LEFT JOIN "MINOILDES"."TradePlayerSap" p ON p."ItemCode" = t."ItemCode"
      LEFT JOIN "MINOILDES"."TradeItemsPlayers" ti1 ON ti1."codigo" = p."Players1"
      LEFT JOIN "MINOILDES"."TradeItemsPlayers" ti2 ON ti2."codigo" = p."Players2"
      LEFT JOIN "MINOILDES"."TradeItemsPlayers" ti3 ON ti3."codigo" = p."Players3"
      WHERE t."activo" = 1
        AND CURRENT_DATE BETWEEN t."fechaini" AND t."fechafin"
        ${filtroCartera}
      ORDER BY o."ItemName" ASC
    `);
    return rows.map((r: any) => ({
      itemCode:      String(r.ItemCode  ?? r.ITEMCODE  ?? ''),
      itemName:      String(r.ItemName  ?? r.ITEMNAME  ?? ''),
      fecha:         this.fmtDate(r.fecha    ?? r.FECHA),
      fechaini:      this.fmtDate(r.fechaini ?? r.FECHAINI),
      fechafin:      this.fmtDate(r.fechafin ?? r.FECHAFIN),
      cartera:       Number(r.cartera   ?? r.CARTERA   ?? 0),
      usuario:       String(r.usuario   ?? r.USUARIO   ?? ''),
      activo:        Number(r.activo    ?? r.ACTIVO    ?? 1),
      players1:      r.Players1 ?? r.PLAYERS1 ?? null,
      players2:      r.Players2 ?? r.PLAYERS2 ?? null,
      players3:      r.Players3 ?? r.PLAYERS3 ?? null,
      nombrePlayer1: r.NombrePlayer1 ?? r.NOMBREPLAYER1 ?? null,
      nombrePlayer2: r.NombrePlayer2 ?? r.NOMBREPLAYER2 ?? null,
      nombrePlayer3: r.NombrePlayer3 ?? r.NOMBREPLAYER3 ?? null,
    }));
  }

  async createTarea(data: PlayersTask): Promise<void> {
    await this.db.execute(
      `INSERT INTO "MINOILDES"."TradePlayersTask"
       ("ItemCode","fecha","fechaini","fechafin","cartera","usuario","activo")
       VALUES (?,TO_DATE(?,'YYYY-MM-DD'),TO_DATE(?,'YYYY-MM-DD'),TO_DATE(?,'YYYY-MM-DD'),?,?,?)`,
      [
        String(data.itemCode),
        String(data.fecha),
        String(data.fechaini),
        String(data.fechafin),
        Number(data.cartera),
        String(data.usuario).substring(0, 10),
        Number(data.activo ?? 1),
      ],
    );
  }

  async deleteTarea(itemCode: string, fecha: string): Promise<void> {
    await this.db.execute(
      `DELETE FROM "MINOILDES"."TradePlayersTask"
       WHERE "ItemCode"=? AND "fecha"=TO_DATE(?,'YYYY-MM-DD')`,
      [String(itemCode), String(fecha)],
    );
  }

  // Catálogo de competidores
  async createTradeItem(data: TradeItem): Promise<void> {
    await this.db.execute(
      `INSERT INTO "MINOILDES"."TradeItemsPlayers"
       ("codigo","Nombre","rubro","grupo","subgrupo","clase","subclase")
       VALUES (?,?,?,?,?,?,?)`,
      [
        String(data.codigo),
        String(data.nombre),
        data.rubro    ? String(data.rubro)    : null,
        data.grupo    ? String(data.grupo)    : null,
        data.subgrupo ? String(data.subgrupo) : null,
        data.clase    ? String(data.clase)    : null,
        data.subclase ? String(data.subclase) : null,
      ],
    );
  }

  async updateTradeItem(codigo: string, data: Partial<TradeItem>): Promise<void> {
    await this.db.execute(
      `UPDATE "MINOILDES"."TradeItemsPlayers"
       SET "Nombre"=?, "rubro"=?, "grupo"=?, "subgrupo"=?, "clase"=?, "subclase"=?
       WHERE "codigo"=?`,
      [
        String(data.nombre ?? ''),
        data.rubro    ? String(data.rubro)    : null,
        data.grupo    ? String(data.grupo)    : null,
        data.subgrupo ? String(data.subgrupo) : null,
        data.clase    ? String(data.clase)    : null,
        data.subclase ? String(data.subclase) : null,
        String(codigo),
      ],
    );
  }

  async deleteTradeItem(codigo: string): Promise<void> {
    await this.db.execute(
      `DELETE FROM "MINOILDES"."TradeItemsPlayers" WHERE "codigo"=?`,
      [String(codigo)],
    );
  }

  private fmtDate(val: any): string {
    if (!val) return '';
    try {
      return new Date(String(val).replace(' ', 'T')).toISOString().split('T')[0];
    } catch {
      return String(val);
    }
  }
}
