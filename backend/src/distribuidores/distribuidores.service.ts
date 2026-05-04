import { Injectable, Inject, HttpException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { SqlServerService } from '../sqlserver/sqlserver.service';
import { CreateDistribuidorDto } from './dto/create-distribuidor.dto';

export interface ClienteEntrega {
  id: number;
  clienteCodigoSAP: string;
  clienteNombre: string;
  latitud: number | null;
  longitud: number | null;
  pedidoSAP: string | null;
  facturaSAP: string | null;
  estado: number;
}

@Injectable()
export class DistribuidoresService {
  constructor(
    @Inject(DatabaseService)   private databaseService: DatabaseService,
    @Inject(SqlServerService)  private sqlServer: SqlServerService,
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

  async getClientesDia(nombre: string, fecha: string): Promise<ClienteEntrega[]> {
    const rows = await this.sqlServer.query(`
      SELECT
        t0.Id,
        t3.CodigoERP  AS ClienteCodigoSAP,
        t3.Nombre     AS ClienteNombre,
        t3.Latitud,
        t3.Longitud,
        t4.CodigoERP  AS PedidoSAP,
        t5.CodigoERP  AS FacturaSAP,
        t0.Estado
      FROM [bd_dms_minoil_prod_icorebiz].[GEN].[Programacion] t0
      INNER JOIN [bd_dms_minoil_prod_icorebiz].[SIS].[Usuario]  t6 ON t0.IdEmpleado = t6.IdEmpleado
      INNER JOIN [bd_dms_minoil_prod_icorebiz].[ERP].[Cliente]  t3 ON t3.Id = t0.IdCliente
      LEFT  JOIN [bd_dms_minoil_prod_icorebiz].[PEG].[Orden]    t4 ON t4.Id = t0.IdOperacion
      LEFT  JOIN [bd_dms_minoil_prod_icorebiz].[ENT].[Entrega]  t5 ON t5.IdOrden = t4.Id
      WHERE t0.IdTipoOperacion = 2
        AND t0.ViaProgramacion = 'A'
        AND CAST(t0.Fecha AS DATE) = @fecha
        AND t6.[Login] = @nombre
      ORDER BY t0.Estado DESC
    `, { fecha, nombre });

    return rows.map((r: any) => ({
      id:               r.Id,
      clienteCodigoSAP: String(r.ClienteCodigoSAP ?? ''),
      clienteNombre:    String(r.ClienteNombre ?? ''),
      latitud:          r.Latitud  != null ? Number(r.Latitud)  : null,
      longitud:         r.Longitud != null ? Number(r.Longitud) : null,
      pedidoSAP:        r.PedidoSAP  ? String(r.PedidoSAP)  : null,
      facturaSAP:       r.FacturaSAP ? String(r.FacturaSAP) : null,
      estado:           Number(r.Estado ?? 0),
    }));
  }
}
