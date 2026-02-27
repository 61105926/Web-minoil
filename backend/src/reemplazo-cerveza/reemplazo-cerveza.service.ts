import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface CrearReemplazoCervezaDto {
  cardCode: string;
  itemCode: string;
  stock: number;
  expirationDate?: string | null;
  observations?: string | null;
}

@Injectable()
export class ReemplazoCervezaService {
  constructor(
    @Inject(DatabaseService) private databaseService: DatabaseService,
  ) { }

  async crearReemplazo(data: CrearReemplazoCervezaDto): Promise<{ success: boolean; message: string }> {
    const sql = `
      INSERT INTO "MINOILDES"."DEV_WEB_REEMPLAZO_CERVEZA"
        ("cardCode", "ItemCode", "stock", "expiration_date", "observations")
      VALUES (?, ?, ?, ?, ?)
    `;

    const params = [
      data.cardCode,
      data.itemCode,
      data.stock,
      data.expirationDate || null,
      data.observations || null,
    ];

    await this.databaseService.execute(sql, params);

    return {
      success: true,
      message: 'Registro de reemplazo de cerveza insertado correctamente',
    };
  }

  async getTestColumns(): Promise<any> {
    return await this.databaseService.query(`SELECT TOP 1 * FROM "MINOILDES"."DEV_WEB_REEMPLAZO_CERVEZA"`);
  }

  async getRegistrosPorSala(cardCode: string): Promise<any[]> {
    const sql = `
      SELECT 
        R."ID", 
        R."cardCode", 
        R."ItemCode", 
        I."ItemName", 
        R."stock", 
        R."expiration_date", 
        R."observations", 
        R."created_at"
      FROM "MINOILDES"."DEV_WEB_REEMPLAZO_CERVEZA" R
      LEFT JOIN "BD_MINOIL_PROD"."OITM" I ON R."ItemCode" = I."ItemCode"
      WHERE R."cardCode" = ?
      ORDER BY R."created_at" DESC
    `;
    const resultados = await this.databaseService.query(sql, [cardCode]);
    return resultados.map((row: any) => {
      // Búsqueda case-insensitive de llaves en la fila
      const getVal = (key: string) => {
        const foundKey = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase());
        return foundKey ? row[foundKey] : null;
      };

      return {
        id: getVal('id'),
        cardCode: getVal('cardCode'),
        ItemCode: getVal('ItemCode'),
        ItemName: getVal('ItemName'),
        stock: getVal('stock'),
        expiration_date: getVal('expiration_date'),
        observations: getVal('observations'),
        created_at: getVal('created_at'),
      };
    });
  }

  async eliminarRegistro(id: number): Promise<{ success: boolean; message: string }> {
    const sql = `DELETE FROM "MINOILDES"."DEV_WEB_REEMPLAZO_CERVEZA" WHERE "ID" = ?`;
    await this.databaseService.execute(sql, [id]);
    return {
      success: true,
      message: 'Registro eliminado correctamente',
    };
  }
}

