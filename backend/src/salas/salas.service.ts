import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class SalasService {
  constructor(
    @Inject(DatabaseService) private databaseService: DatabaseService,
  ) { }

  async getSalasPorTerritorio(territorio: number): Promise<any[]> {
    try {
      console.log(`🔵 Obteniendo salas para territorio: ${territorio}`);
      const query = `
        SELECT 
          c."CardCode",
          c."CardName",
          CAST(c."AliasName" AS VARCHAR(30)) AS "AliasName",
          c."GlblLocNum"
        FROM "BD_MINOIL_PROD"."OCRD" c
        WHERE c."frozenFor" <> 'Y'
          AND c."CardType" = 'C'
          AND IFNULL(c."GlblLocNum", '') <> ''
          AND c."Territory" = ?
        ORDER BY c."GlblLocNum", c."CardName"
      `;

      const salas = await this.databaseService.query(query, [territorio]);
      console.log(`✅ Salas obtenidas de BD: ${salas?.length || 0}`);

      if (salas && salas.length > 0) {
        return salas.map((row: any) => {
          const getVal = (key: string) => {
            const foundKey = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase());
            return foundKey ? row[foundKey] : null;
          };

          return {
            codigo: getVal('CardCode'),
            nombre: getVal('CardName'),
            alias: getVal('AliasName'),
            glblLocNum: getVal('GlblLocNum'),
          };
        });
      } else {
        return [];
      }
    } catch (error: any) {
      console.error('❌ Error obteniendo salas:', error);
      throw error;
    }
  }
}

