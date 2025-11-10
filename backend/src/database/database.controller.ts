import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { ConfigService } from '@nestjs/config';

@Controller('database')
export class DatabaseController {
  constructor(
    private databaseService: DatabaseService,
    private configService: ConfigService,
  ) {}

  @Get('test')
  async testConnection() {
    try {
      // Intentar una query simple que funciona en cualquier base de datos SAP HANA
      const result = await this.databaseService.query('SELECT CURRENT_USER, CURRENT_SCHEMA FROM DUMMY');
      
      const connectionInfo = {
        status: 'conectado',
        message: 'Conexión exitosa a SAP HANA',
        usuario: this.configService.get<string>('HANA_USER') || 'no configurado',
        host: this.configService.get<string>('HANA_HOST') || 'no configurado',
        port: this.configService.get<number>('HANA_PORT') || 30015,
        usuarioActual: result[0]?.CURRENT_USER || 'desconocido',
        schemaActual: result[0]?.CURRENT_SCHEMA || 'desconocido',
        timestamp: new Date().toISOString(),
      };

      return connectionInfo;
    } catch (error: any) {
      return {
        status: 'error',
        message: 'Error al conectar con SAP HANA',
        error: error.message,
        usuario: this.configService.get<string>('HANA_USER') || 'no configurado',
        host: this.configService.get<string>('HANA_HOST') || 'no configurado',
        port: this.configService.get<number>('HANA_PORT') || 30015,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('info')
  getConnectionInfo() {
    return {
      host: this.configService.get<string>('HANA_HOST') || 'no configurado',
      port: this.configService.get<number>('HANA_PORT') || 30015,
      user: this.configService.get<string>('HANA_USER') || 'no configurado',
      passwordSet: !!this.configService.get<string>('HANA_PASS'),
      jwtSecretSet: !!this.configService.get<string>('JWT_SECRET'),
    };
  }

  @Get('test-vac-solicitud')
  async testVacSolicitud() {
    try {
      // Query específica para probar la tabla VAC_SOLICITUD
      const query = `SELECT * FROM "MINOILDES"."VAC_SOLICITUD" LIMIT 50`;
      const result = await this.databaseService.query(query);
      
      return {
        status: 'exito',
        message: 'Consulta ejecutada correctamente',
        query: query,
        totalRegistros: result.length,
        registros: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: 'Error al ejecutar la consulta',
        query: `SELECT * FROM "MINOILDES"."VAC_SOLICITUD"`,
        error: error.message,
        errorCode: error.code,
        sqlState: error.sqlState,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

