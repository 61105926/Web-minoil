import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ClientesService {
  constructor(
    @Inject(DatabaseService) private databaseService: DatabaseService
  ) {}

  async findByCity(cityId: number = 1) {
    const query = `
      SELECT
        "CardCode",
        "CardName",
        CAST("AliasName" AS VARCHAR(30)) AS "AliasName"
      FROM "BD_MINOIL_PROD"."OCRD"
      WHERE
        "frozenFor" <> 'Y'
        AND "CardType" = 'C'
        AND "Territory" = '${cityId}'
    `;

    const clients = await this.databaseService.query(query);

    if (!clients || clients.length === 0) {
      throw new NotFoundException('No se encontraron clientes.');
    }

    return { clients };
  }
}
