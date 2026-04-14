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

  async upsertUbicacion(nombre: string, latitud: number, longitud: number) {
    try {
      const existing = await this.databaseService.query(
        `SELECT "ID" FROM "MINOILDES"."DISTRIBUIDORES" WHERE UPPER("NOMBRE") = UPPER(?)`,
        [nombre],
      );

      if (existing.length > 0) {
        await this.databaseService.execute(
          `UPDATE "MINOILDES"."DISTRIBUIDORES"
           SET "LATITUD" = ?, "LONGITUD" = ?, "UPDATED_AT" = CURRENT_TIMESTAMP
           WHERE UPPER("NOMBRE") = UPPER(?)`,
          [latitud, longitud, nombre],
        );
      } else {
        await this.databaseService.execute(
          `INSERT INTO "MINOILDES"."DISTRIBUIDORES" ("NOMBRE", "LATITUD", "LONGITUD")
           VALUES (?, ?, ?)`,
          [nombre, latitud, longitud],
        );
      }

      // Guardar historial
      await this.databaseService.execute(
        `INSERT INTO "MINOILDES"."DISTRIBUIDOR_UBICACION_LOG" ("NOMBRE", "LATITUD", "LONGITUD")
         VALUES (?, ?, ?)`,
        [nombre, latitud, longitud],
      );

      return { message: 'Ubicación registrada.' };
    } catch (error: any) {
      throw new HttpException(
        { statusCode: 400, message: 'Error al registrar ubicación', hanaError: error.message },
        400,
      );
    }
  }

  async getTrayectoria(nombre: string, fecha: string) {
    return this.databaseService.query(
      `SELECT "NOMBRE", "LATITUD", "LONGITUD", "CREATED_AT"
       FROM "MINOILDES"."DISTRIBUIDOR_UBICACION_LOG"
       WHERE UPPER("NOMBRE") = UPPER(?)
         AND TO_DATE("CREATED_AT") = TO_DATE(?, 'YYYY-MM-DD')
       ORDER BY "CREATED_AT" ASC`,
      [nombre, fecha],
    );
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
