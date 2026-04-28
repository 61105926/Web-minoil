import { Injectable, Inject, HttpException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface ImpostorStockData {
  CardCode: string;
  ItemCode: string;
  BatchNum: string;
  StockSala: number;
  StockBodega: number;
  regional?: string;
  empleado?: string;
}

@Injectable()
export class ImpostorService {
  constructor(
    @Inject(DatabaseService) private databaseService: DatabaseService,
  ) {}

  async insertarStock(datos: ImpostorStockData[]): Promise<void> {
    if (!datos || datos.length === 0) throw new Error('No hay datos para insertar');

    console.log(`🔵 Insertando ${datos.length} registros en IMPOSTORSTOCKPRODUCTOLOTE`);

    for (let i = 0; i < datos.length; i++) {
      const r = datos[i];
      if (!r.CardCode || !r.ItemCode || !r.BatchNum) {
        throw new Error(`Registro ${i + 1} incompleto: CardCode=${r.CardCode}, ItemCode=${r.ItemCode}, BatchNum=${r.BatchNum}`);
      }

      const params = [
        String(r.CardCode),
        String(r.ItemCode),
        String(r.BatchNum),
        Number(r.StockSala  ?? 0),
        Number(r.StockBodega ?? 0),
        r.regional  ? String(r.regional)  : null,
        r.empleado  ? String(r.empleado)  : null,
      ];
      console.log(`🔵 Params [${i + 1}]:`, JSON.stringify(params));

      try {
        await this.databaseService.execute(
          `INSERT INTO "MINOILDES"."IMPOSTORSTOCKPRODUCTOLOTE"
           ("CARDCODE","ITEMCODE","BATCHNUM","STOCKSALA","STOCKBODEGA","REGIONAL","EMPLEADO")
           VALUES (?,?,?,?,?,?,?)`,
          params,
        );
        console.log(`✅ [${i + 1}/${datos.length}] ${r.CardCode} - ${r.ItemCode} - ${r.BatchNum}`);
      } catch (error: any) {
        console.error(`❌ Error en registro ${i + 1}:`, error.message);
        throw new HttpException(
          { statusCode: 400, message: `Error al insertar registro ${i + 1}`, hanaError: error.message, registro: r },
          400,
        );
      }
    }

    console.log(`✅ ${datos.length} registros insertados correctamente`);
  }
}
