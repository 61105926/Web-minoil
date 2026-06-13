import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface TradeItem {
  id?: number;
  idProducto: string | null;
  codigo: string;
  nombre: string;
  rubro: string | null;
  grupo: string | null;
  subgrupo: string | null;
  clase: string | null;
  subclase: string | null;
  mercado: string | null;
  estado: boolean | null;
  pesoNeto: number | null;
}

export interface PlayerSap {
  itemCode: string;
  canal: string;  // 'moderno' | 'tradicional' | 'ambos'
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
  nivel?: string | null;    // 'nacional' | 'ciudad' | 'ruta' | 'cliente'
  alcance?: string | null;  // JSON array: '["La Paz","Santa Cruz"]'
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

  async getCiudades(): Promise<{ code: string; name: string }[]> {
    const rows = await this.db.query(`
      SELECT "Code", "Name"
      FROM "BD_MINOIL_PROD"."OUBR"
      WHERE IFNULL("Name", '') <> ''
      ORDER BY "Name" ASC
    `);
    return rows
      .map((r: any) => ({
        code: String(r.Code ?? r.CODE ?? '').trim(),
        name: String(r.Name ?? r.NAME ?? '').trim(),
      }))
      .filter((r: any) => r.code && r.name);
  }

  async getRutas(): Promise<{ code: string; name: string }[]> {
    const rows = await this.db.query(`
      SELECT "U_RUTA", "SlpName", "U_sucursal"
      FROM "BD_MINOIL_PROD"."OSLP"
      WHERE IFNULL("U_RUTA", 0) <> 0
        AND IFNULL("SlpName", '') <> ''
      ORDER BY "U_sucursal" ASC, "SlpName" ASC
    `);
    return rows.map((r: any) => ({
      code: String(r.U_RUTA ?? r.U_ruta ?? '').trim(),
      name: String(r.SlpName ?? r.SLPNAME ?? '').trim(),
    })).filter((r: any) => r.code && r.name);
  }

  async getClientes(q?: string): Promise<{ code: string; name: string; city?: string }[]> {
    const hasQuery = q && q.trim().length > 0;
    const whereSearch = hasQuery
      ? `AND (UPPER("CardCode") LIKE UPPER(?) OR UPPER("CardName") LIKE UPPER(?))`
      : '';
    const params: any[] = hasQuery ? [`%${q!.trim()}%`, `%${q!.trim()}%`] : [];
    const rows = await this.db.query(`
      SELECT TOP 100 "CardCode", "CardName", "City"
      FROM "BD_MINOIL_PROD"."OCRD"
      WHERE "CardCode" IS NOT NULL
        ${whereSearch}
      ORDER BY "CardName" ASC
    `, params);
    return rows
      .map((r: any) => ({
        code: String(r.CardCode ?? r.CARDCODE ?? '').trim(),
        name: String(r.CardName ?? r.CARDNAME ?? '').trim(),
        city: r.City != null ? String(r.City ?? r.CITY ?? '').trim() : undefined,
      }))
      .filter((r: any) => r.code && r.name);
  }

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
      SELECT "Id","IdProducto","codigo","Nombre","rubro","grupo","subgrupo","clase","subclase","mercado","Estado","PesoNeto"
      FROM "MINOILDES"."TradePlayer"
      ORDER BY "Nombre" ASC
    `);
    return rows.map((r: any) => ({
      id:         Number(r.Id         ?? r.ID         ?? 0),
      idProducto: r.IdProducto ?? r.IDPRODUCTO ?? null,
      codigo:     String(r.codigo     ?? r.CODIGO     ?? ''),
      nombre:     String(r.Nombre     ?? r.NOMBRE     ?? ''),
      rubro:      r.rubro     ?? r.RUBRO     ?? null,
      grupo:      r.grupo     ?? r.GRUPO     ?? null,
      subgrupo:   r.subgrupo  ?? r.SUBGRUPO  ?? null,
      clase:      r.clase     ?? r.CLASE     ?? null,
      subclase:   r.subclase  ?? r.SUBCLASE  ?? null,
      mercado:    r.mercado   ?? r.MERCADO   ?? null,
      estado:     r.Estado != null ? Boolean(r.Estado) : (r.ESTADO != null ? Boolean(r.ESTADO) : null),
      pesoNeto:   r.PesoNeto  != null ? Number(r.PesoNeto ?? r.PESONETO) : null,
    }));
  }

  // Todas las asignaciones — nombres de players se resuelven en el frontend
  async getAllPlayerSap(): Promise<(PlayerSap & { itemName?: string })[]> {
    const rows = await this.db.query(`
      SELECT p."ItemCode", o."ItemName",
             p."Canal", p."Players1", p."Players2", p."Players3"
      FROM "MINOILDES"."TradePlayerSap" p
      LEFT JOIN "BD_MINOIL_PROD"."OITM" o ON o."ItemCode" = p."ItemCode"
      ORDER BY o."ItemName" ASC, p."Canal" ASC
    `);
    return rows.map((r: any) => ({
      itemCode: String(r.ItemCode ?? r.ITEMCODE ?? ''),
      itemName: String(r.ItemName ?? r.ITEMNAME ?? ''),
      canal:    String(r.Canal    ?? r.CANAL    ?? 'ambos'),
      players1: r.Players1 != null ? String(r.Players1) : (r.PLAYERS1 != null ? String(r.PLAYERS1) : null),
      players2: r.Players2 != null ? String(r.Players2) : (r.PLAYERS2 != null ? String(r.PLAYERS2) : null),
      players3: r.Players3 != null ? String(r.Players3) : (r.PLAYERS3 != null ? String(r.PLAYERS3) : null),
    }));
  }

  async bulkUpsertPlayerSap(items: PlayerSap[]): Promise<{ inserted: number; updated: number }> {
    let inserted = 0;
    let updated = 0;
    for (const item of items) {
      if (!item.itemCode?.trim()) continue;
      const canal = this.validateCanal(item.canal) ?? 'ambos';
      const existing = await this.db.query(
        `SELECT 1 FROM "MINOILDES"."TradePlayerSap" WHERE "ItemCode" = ? AND "Canal" = ?`,
        [String(item.itemCode).trim(), canal],
      );
      await this.upsertPlayerSap({ ...item, canal });
      if (existing && existing.length > 0) updated++;
      else inserted++;
    }
    return { inserted, updated };
  }

  async deletePlayerSap(itemCode: string, canal?: string): Promise<void> {
    const canalSafe = this.validateCanal(canal);
    if (canalSafe) {
      await this.db.execute(
        `DELETE FROM "MINOILDES"."TradePlayerSap" WHERE "ItemCode" = ? AND "Canal" = ?`,
        [String(itemCode), canalSafe],
      );
    } else {
      await this.db.execute(
        `DELETE FROM "MINOILDES"."TradePlayerSap" WHERE "ItemCode" = ?`,
        [String(itemCode)],
      );
    }
  }

  // Players asignados a un ItemCode, opcionalmente filtrado por canal
  async getPlayerSap(itemCode: string, canal?: string): Promise<PlayerSap | null> {
    const canalSafe = this.validateCanal(canal);
    let rows: any[];
    if (canalSafe) {
      rows = await this.db.query(
        `SELECT "ItemCode","Canal","Players1","Players2","Players3"
         FROM "MINOILDES"."TradePlayerSap"
         WHERE "ItemCode" = ? AND "Canal" IN (?, 'ambos')
         ORDER BY CASE WHEN "Canal" = ? THEN 1 ELSE 2 END`,
        [String(itemCode), canalSafe, canalSafe],
      );
    } else {
      rows = await this.db.query(
        `SELECT "ItemCode","Canal","Players1","Players2","Players3"
         FROM "MINOILDES"."TradePlayerSap"
         WHERE "ItemCode" = ?
         ORDER BY "Canal" ASC`,
        [String(itemCode)],
      );
    }
    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    return {
      itemCode: String(r.ItemCode ?? r.ITEMCODE ?? ''),
      canal:    String(r.Canal    ?? r.CANAL    ?? 'ambos'),
      players1: r.Players1 != null ? String(r.Players1) : (r.PLAYERS1 != null ? String(r.PLAYERS1) : null),
      players2: r.Players2 != null ? String(r.Players2) : (r.PLAYERS2 != null ? String(r.PLAYERS2) : null),
      players3: r.Players3 != null ? String(r.Players3) : (r.PLAYERS3 != null ? String(r.PLAYERS3) : null),
    };
  }

  async upsertPlayerSap(data: PlayerSap): Promise<void> {
    const canal = this.validateCanal(data.canal) ?? 'ambos';
    const rows = await this.db.query(
      `SELECT 1 FROM "MINOILDES"."TradePlayerSap" WHERE "ItemCode" = ? AND "Canal" = ?`,
      [String(data.itemCode), canal],
    );
    if (rows && rows.length > 0) {
      await this.db.execute(
        `UPDATE "MINOILDES"."TradePlayerSap"
         SET "Players1"=?, "Players2"=?, "Players3"=?
         WHERE "ItemCode"=? AND "Canal"=?`,
        [
          data.players1 ? String(data.players1) : null,
          data.players2 ? String(data.players2) : null,
          data.players3 ? String(data.players3) : null,
          String(data.itemCode),
          canal,
        ],
      );
    } else {
      await this.db.execute(
        `INSERT INTO "MINOILDES"."TradePlayerSap" ("ItemCode","Canal","Players1","Players2","Players3")
         VALUES (?,?,?,?,?)`,
        [
          String(data.itemCode),
          canal,
          data.players1 ? String(data.players1) : null,
          data.players2 ? String(data.players2) : null,
          data.players3 ? String(data.players3) : null,
        ],
      );
    }
  }

  private mapTareaRow(r: any): PlayersTask {
    return {
      itemCode: String(r.ItemCode  ?? r.ITEMCODE  ?? ''),
      itemName: String(r.ItemName  ?? r.ITEMNAME  ?? ''),
      fecha:    this.fmtDate(r.fecha    ?? r.FECHA),
      fechaini: this.fmtDate(r.fechaini ?? r.FECHAINI),
      fechafin: this.fmtDate(r.fechafin ?? r.FECHAFIN),
      cartera:  Number(r.cartera   ?? r.CARTERA   ?? 0),
      nivel:    r.nivel   != null ? String(r.nivel   ?? r.NIVEL   ?? 'nacional') : null,
      alcance:  r.alcance != null ? String(r.alcance ?? r.ALCANCE ?? '')         : null,
      usuario:  String(r.usuario   ?? r.USUARIO   ?? ''),
      activo:   Number(r.activo    ?? r.ACTIVO    ?? 1),
      players1: r.Players1 != null ? String(r.Players1) : (r.PLAYERS1 != null ? String(r.PLAYERS1) : null),
      players2: r.Players2 != null ? String(r.Players2) : (r.PLAYERS2 != null ? String(r.PLAYERS2) : null),
      players3: r.Players3 != null ? String(r.Players3) : (r.PLAYERS3 != null ? String(r.PLAYERS3) : null),
    };
  }

  private readonly TAREAS_COLS_FULL = `t."ItemCode", o."ItemName",
             t."fecha", t."fechaini", t."fechafin",
             t."cartera", t."nivel", t."alcance", t."usuario", t."activo"`;
  private readonly TAREAS_COLS_COMPAT = `t."ItemCode", o."ItemName",
             t."fecha", t."fechaini", t."fechafin",
             t."cartera", t."usuario", t."activo"`;
  private readonly TAREAS_JOIN = `
      FROM "MINOILDES"."TradePlayersTask" t
      LEFT JOIN "BD_MINOIL_PROD"."OITM" o ON o."ItemCode" = t."ItemCode"
      LEFT JOIN (
        SELECT "ItemCode","Players1","Players2","Players3",
          ROW_NUMBER() OVER (PARTITION BY "ItemCode" ORDER BY "Canal" ASC) AS rn
        FROM "MINOILDES"."TradePlayerSap"
      ) p ON p."ItemCode" = t."ItemCode" AND p.rn = 1`;

  // Tareas / programaciones — players se resuelven en el frontend
  async getTareas(): Promise<PlayersTask[]> {
    let rows: any[];
    try {
      rows = await this.db.query(
        `SELECT ${this.TAREAS_COLS_FULL}, p."Players1", p."Players2", p."Players3"
         ${this.TAREAS_JOIN}
         ORDER BY t."fecha" DESC`,
        [], true,
      );
    } catch {
      rows = await this.db.query(
        `SELECT ${this.TAREAS_COLS_COMPAT}, p."Players1", p."Players2", p."Players3"
         ${this.TAREAS_JOIN}
         ORDER BY t."fecha" DESC`,
      );
    }
    return rows.map((r: any) => this.mapTareaRow(r));
  }

  async getTareasActivas(
    cartera?: number,
    canal?: string,
    ciudad?: string,
    ruta?: string,
    cliente?: string,
  ): Promise<PlayersTask[]> {
    const filtroCartera = cartera != null ? `AND t."cartera" = ${Number(cartera)}` : '';
    const canalSafe = this.validateCanal(canal) ?? 'ambos';
    const joinActivas = `
      FROM "MINOILDES"."TradePlayersTask" t
      LEFT JOIN "BD_MINOIL_PROD"."OITM" o ON o."ItemCode" = t."ItemCode"
      LEFT JOIN (
        SELECT "ItemCode","Players1","Players2","Players3",
          ROW_NUMBER() OVER (
            PARTITION BY "ItemCode"
            ORDER BY CASE "Canal" WHEN '${canalSafe}' THEN 1 ELSE 2 END
          ) AS rn
        FROM "MINOILDES"."TradePlayerSap"
        WHERE "Canal" IN ('${canalSafe}', 'ambos')
      ) p ON p."ItemCode" = t."ItemCode" AND p.rn = 1
      WHERE t."activo" = 1
        AND t."fechaini" <= CURRENT_DATE
        AND t."fechafin" >= CURRENT_DATE
        ${filtroCartera}`;
    let rawRows: any[];
    try {
      rawRows = await this.db.query(
        `SELECT ${this.TAREAS_COLS_FULL}, p."Players1", p."Players2", p."Players3"
         ${joinActivas}
         ORDER BY o."ItemName" ASC`,
        [], true,
      );
    } catch {
      rawRows = await this.db.query(
        `SELECT ${this.TAREAS_COLS_COMPAT}, p."Players1", p."Players2", p."Players3"
         ${joinActivas}
         ORDER BY o."ItemName" ASC`,
      );
    }
    const tareas = rawRows.map((r: any) => this.mapTareaRow(r));

    // Filter by alcance in app code (avoids complex JSON SQL)
    const hasContext = ciudad || ruta || cliente;
    if (!hasContext) return tareas;

    return tareas.filter(t => {
      const nivel = t.nivel ?? 'nacional';
      if (!nivel || nivel === 'nacional') return true;
      if (!t.alcance) return true;
      try {
        const items: string[] = JSON.parse(t.alcance);
        if (nivel === 'ciudad'  && ciudad)  return items.includes(ciudad);
        if (nivel === 'ruta'    && ruta)    return items.includes(ruta);
        if (nivel === 'cliente' && cliente) return items.includes(cliente);
      } catch { return true; }
      return false;
    });
  }

  async createTarea(data: PlayersTask): Promise<void> {
    try {
      await this.db.execute(
        `INSERT INTO "MINOILDES"."TradePlayersTask"
         ("ItemCode","fecha","fechaini","fechafin","cartera","nivel","alcance","usuario","activo")
         VALUES (?,TO_DATE(?,'YYYY-MM-DD'),TO_DATE(?,'YYYY-MM-DD'),TO_DATE(?,'YYYY-MM-DD'),?,?,?,?,?)`,
        [
          String(data.itemCode),
          String(data.fecha),
          String(data.fechaini),
          String(data.fechafin),
          Number(data.cartera ?? 0),
          data.nivel   ? String(data.nivel)   : 'nacional',
          data.alcance ? String(data.alcance) : null,
          String(data.usuario).substring(0, 10),
          Number(data.activo ?? 1),
        ],
      );
    } catch (e: any) {
      if (String(e?.message ?? '').includes('invalid column name')) {
        // Fallback: columns nivel/alcance not yet created — insert without them
        await this.db.execute(
          `INSERT INTO "MINOILDES"."TradePlayersTask"
           ("ItemCode","fecha","fechaini","fechafin","cartera","usuario","activo")
           VALUES (?,TO_DATE(?,'YYYY-MM-DD'),TO_DATE(?,'YYYY-MM-DD'),TO_DATE(?,'YYYY-MM-DD'),?,?,?)`,
          [
            String(data.itemCode),
            String(data.fecha),
            String(data.fechaini),
            String(data.fechafin),
            Number(data.cartera ?? 0),
            String(data.usuario).substring(0, 10),
            Number(data.activo ?? 1),
          ],
        );
      } else { throw e; }
    }
  }

  async updateTarea(
    itemCode: string,
    fecha: string,
    data: { activo?: number; fechaini?: string; fechafin?: string; cartera?: number; nivel?: string | null; alcance?: string | null },
  ): Promise<void> {
    const sets: string[]  = [];
    const values: any[]   = [];

    if (data.activo   !== undefined) { sets.push('"activo"=?');                            values.push(Number(data.activo)); }
    if (data.fechaini !== undefined) { sets.push('"fechaini"=TO_DATE(?,\'YYYY-MM-DD\')'); values.push(String(data.fechaini)); }
    if (data.fechafin !== undefined) { sets.push('"fechafin"=TO_DATE(?,\'YYYY-MM-DD\')'); values.push(String(data.fechafin)); }
    if (data.cartera  !== undefined) { sets.push('"cartera"=?');                           values.push(Number(data.cartera)); }
    const nivelSets: string[] = [];
    const nivelVals: any[]   = [];
    if (data.nivel    !== undefined) { nivelSets.push('"nivel"=?');   nivelVals.push(data.nivel ? String(data.nivel) : 'nacional'); }
    if (data.alcance  !== undefined) { nivelSets.push('"alcance"=?'); nivelVals.push(data.alcance ? String(data.alcance) : null); }

    if (sets.length === 0 && nivelSets.length === 0) return;

    // Try full update (with nivel/alcance); fall back if columns don't exist
    if (nivelSets.length > 0) {
      const allSets   = [...sets, ...nivelSets];
      const allValues = [...values, ...nivelVals, String(itemCode), String(fecha)];
      try {
        await this.db.execute(
          `UPDATE "MINOILDES"."TradePlayersTask" SET ${allSets.join(', ')} WHERE "ItemCode"=? AND "fecha"=TO_DATE(?,'YYYY-MM-DD')`,
          allValues,
        );
        return;
      } catch (e: any) {
        if (!String(e?.message ?? '').includes('invalid column name')) throw e;
        // Columns not yet created — continue with base sets only
      }
    }

    if (sets.length === 0) return;
    values.push(String(itemCode), String(fecha));
    await this.db.execute(
      `UPDATE "MINOILDES"."TradePlayersTask" SET ${sets.join(', ')} WHERE "ItemCode"=? AND "fecha"=TO_DATE(?,'YYYY-MM-DD')`,
      values,
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
      `INSERT INTO "MINOILDES"."TradePlayer"
       ("IdProducto","codigo","Nombre","rubro","grupo","subgrupo","clase","subclase","mercado","Estado","PesoNeto")
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [
        data.idProducto ? String(data.idProducto) : null,
        String(data.codigo),
        String(data.nombre),
        data.rubro    ? String(data.rubro)    : null,
        data.grupo    ? String(data.grupo)    : null,
        data.subgrupo ? String(data.subgrupo) : null,
        data.clase    ? String(data.clase)    : null,
        data.subclase ? String(data.subclase) : null,
        data.mercado  ? String(data.mercado)  : null,
        data.estado != null ? (data.estado ? 1 : 0) : null,
        data.pesoNeto != null ? Number(data.pesoNeto) : null,
      ],
    );
  }

  async updateTradeItem(id: number, data: Partial<TradeItem>): Promise<void> {
    await this.db.execute(
      `UPDATE "MINOILDES"."TradePlayer"
       SET "IdProducto"=?, "codigo"=?, "Nombre"=?, "rubro"=?, "grupo"=?, "subgrupo"=?, "clase"=?, "subclase"=?, "mercado"=?, "Estado"=?, "PesoNeto"=?
       WHERE "Id"=?`,
      [
        data.idProducto ? String(data.idProducto) : null,
        String(data.codigo ?? ''),
        String(data.nombre ?? ''),
        data.rubro    ? String(data.rubro)    : null,
        data.grupo    ? String(data.grupo)    : null,
        data.subgrupo ? String(data.subgrupo) : null,
        data.clase    ? String(data.clase)    : null,
        data.subclase ? String(data.subclase) : null,
        data.mercado  ? String(data.mercado)  : null,
        data.estado != null ? (data.estado ? 1 : 0) : null,
        data.pesoNeto != null ? Number(data.pesoNeto) : null,
        Number(id),
      ],
    );
  }

  async bulkUpsertTradeItems(items: TradeItem[]): Promise<{ inserted: number; updated: number }> {
    let inserted = 0;
    let updated = 0;
    for (const item of items) {
      if (!String(item.codigo ?? '').trim()) continue;
      const existing = await this.db.query(
        `SELECT "Id" FROM "MINOILDES"."TradePlayer" WHERE "codigo" = ?`,
        [String(item.codigo).trim()],
      );
      if (existing && existing.length > 0) {
        const id = Number(existing[0].Id ?? existing[0].ID ?? 0);
        await this.updateTradeItem(id, item);
        updated++;
      } else {
        await this.createTradeItem(item);
        inserted++;
      }
    }
    return { inserted, updated };
  }

  async deleteTradeItem(id: number): Promise<void> {
    await this.db.execute(
      `DELETE FROM "MINOILDES"."TradePlayer" WHERE "Id"=?`,
      [Number(id)],
    );
  }

  private validateCanal(canal?: string): string | null {
    if (!canal) return null;
    const allowed = ['moderno', 'tradicional', 'ambos'];
    return allowed.includes(canal) ? canal : null;
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
