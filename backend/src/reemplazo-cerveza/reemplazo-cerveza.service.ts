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
  ) {}

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
}

