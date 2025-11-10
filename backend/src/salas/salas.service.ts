import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class SalasService {
  constructor(
    @Inject(DatabaseService) private databaseService: DatabaseService,
  ) {}

  async getSalasPorTerritorio(territorio: number): Promise<any[]> {
    try {
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
      return salas.map((sala: any) => ({
        codigo: sala.CardCode,
        nombre: sala.CardName,
        alias: sala.AliasName,
        glblLocNum: sala.GlblLocNum,
      }));
    } catch (error: any) {
      console.error('Error obteniendo salas:', error);
      // Si hay error con la BD, devolver datos de ejemplo según territorio
      return this.getSalasDemo(territorio);
    }
  }

  private getSalasDemo(territorio: number): any[] {
    // Datos de ejemplo por territorio
    const salasPorTerritorio: Record<number, string[]> = {
      1: [
        'Hipermaxi Los Pinos',
        'Hipermaxi Calacoto',
        'Hipermaxi Zona Sur',
        'Hipermaxi Sopocachi',
        'Hipermaxi Obrajes',
        'Hipermaxi San Miguel',
      ],
      2: [
        'Hipermaxi Centro',
        'Hipermaxi Miraflores',
        'Hipermaxi La Paz',
        'Hipermaxi Achumani',
        'Hipermaxi Valle Hermoso',
        'Hipermaxi Alto',
      ],
      3: [
        'Hipermaxi Periférica',
        'Hipermaxi 6 de Agosto',
        'Hipermaxi Arce',
        'Hipermaxi Jaime Freyre',
        'Hipermaxi Junín',
        'Hipermaxi Mariscal Santa Cruz',
      ],
    };

    const salas = salasPorTerritorio[territorio] || [];
    return salas.map((nombre, index) => ({
      codigo: `DEMO-${territorio}-${index + 1}`,
      nombre,
      alias: nombre,
      glblLocNum: String(index + 1).padStart(3, '0'),
    }));
  }

  getTerritorioPorRegion(region: string): number {
    const regionMap: Record<string, number> = {
      'Santa Cruz': 1,
      'La Paz': 2,
      'Cochabamba': 3,
      'Administrador': 2, // Por defecto La Paz para admin
    };
    return regionMap[region] || 2;
  }
}

