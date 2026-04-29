import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface Ruta {
  sucursal: string;
  departamento: string | null;
  nombre: string;
  ruta: string | null;
  memo: string | null;
}

export interface ClienteRuta {
  cardCode: string;
  cardName: string;
}

@Injectable()
export class RutasService {
  constructor(
    @Inject(DatabaseService) private db: DatabaseService,
  ) {}

  async getRutas(sucursal?: string): Promise<Ruta[]> {
    const filtro = sucursal ? `AND "U_sucursal" = ${Number(sucursal)}` : '';
    const rows = await this.db.query(`
      SELECT "U_sucursal", "U_DPTO", "SlpName", "Memo", "U_RUTA"
      FROM "BD_MINOIL_PROD"."OSLP"
      WHERE IFNULL("U_RUTA", 0) <> 0
      ${filtro}
      ORDER BY "U_sucursal", "SlpName"
    `);
    return rows.map((r: any) => ({
      sucursal:     String(r.U_sucursal ?? r.U_SUCURSAL ?? ''),
      departamento: r.U_DPTO ?? null,
      nombre:       String(r.SlpName ?? r.SLPNAME ?? ''),
      ruta:         r.U_RUTA != null ? String(r.U_RUTA) : null,
      memo:         r.Memo ?? r.MEMO ?? null,
    }));
  }

  async getClientesPorRuta(ruta: string): Promise<ClienteRuta[]> {
    const rows = await this.db.query(`
      SELECT t0."CardCode", t0."CardName"
      FROM "BD_MINOIL_PROD"."OCRD" t0
      INNER JOIN "BD_MINOIL_PROD"."OSLP" t1 ON t0."SlpCode" = t1."SlpCode"
      WHERE t0."frozenFor" <> 'Y'
        AND t1."U_RUTA" = ?
      ORDER BY t0."CardName"
    `, [String(ruta)]);
    return rows.map((r: any) => ({
      cardCode: String(r.CardCode ?? r.CARDCODE ?? ''),
      cardName: String(r.CardName ?? r.CARDNAME ?? ''),
    }));
  }
}
