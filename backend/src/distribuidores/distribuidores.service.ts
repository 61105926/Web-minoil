import { Injectable, Inject, HttpException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateDistribuidorDto } from './dto/create-distribuidor.dto';

@Injectable()
export class DistribuidoresService {
  constructor(
    @Inject(DatabaseService) private databaseService: DatabaseService,
  ) {}

  async create(dto: CreateDistribuidorDto) {
    const query = `
      INSERT INTO "MINOILDES"."DISTRIBUIDORES"
        ("NOMBRE", "LATITUD", "LONGITUD")
      VALUES (?, ?, ?)
    `;

    try {
      await this.databaseService.execute(query, [
        dto.nombre,
        dto.latitud ?? null,
        dto.longitud ?? null,
      ]);
      return { message: 'Distribuidor creado correctamente.' };
    } catch (error: any) {
      throw new HttpException(
        {
          statusCode: 400,
          message: 'Error al insertar en HANA',
          hanaError: error.message ?? String(error),
          payload: dto,
        },
        400,
      );
    }
  }

  async findAll() {
    const query = `
      SELECT "ID", "NOMBRE", "LATITUD", "LONGITUD", "CREATED_AT", "UPDATED_AT"
      FROM "MINOILDES"."DISTRIBUIDORES"
      ORDER BY "NOMBRE"
    `;
    return this.databaseService.query(query);
  }
}
