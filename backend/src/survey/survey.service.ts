import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

const VACACIONES_URL = 'https://hrx.minoil.com.bo/vacaciones?data=';

@Injectable()
export class SurveyService {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  private encodeValue(value: unknown): string {
    return Buffer.from(String(value ?? ''), 'utf8').toString('base64');
  }

  async getSurvey() {
    let rows: any[];
    try {
      rows = await this.db.query('CALL "MINOILDES"."R030EncuestadetrabajoDev"', [], true);
      if (!Array.isArray(rows)) throw new Error('Formato de resultado inesperado');
    } catch (error: any) {
      console.error(`[SURVEY] Falló R030EncuestadetrabajoDev; código HANA: ${error.code ?? 'no disponible'}`);
      throw new ServiceUnavailableException('No se pudo consultar la encuesta. Contacta al administrador.');
    }

    return rows.map((row) => {
      const encoded = this.encodeValue(row.mobile);
      return {
        data: {
          regional: row.workCity,
          code_regional: row.regionalId,
          fullName: row.fullName,
          ci: row.ci,
          empID: row.empID,
          phone: row.mobile,
          cargo: row.jobTitle,
          AD: row.ExtEmpNo,
          url: VACACIONES_URL + encoded,
          base64: encoded,
        },
      };
    });
  }
}
