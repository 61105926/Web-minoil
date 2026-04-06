import { Injectable, OnModuleDestroy, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sql from 'mssql';

@Injectable()
export class SqlServerService implements OnModuleDestroy {
  private pool: sql.ConnectionPool | null = null;

  constructor(@Inject(ConfigService) private configService: ConfigService) {}

  private async getPool(): Promise<sql.ConnectionPool> {
    if (this.pool?.connected) return this.pool;

    const config: sql.config = {
      server:   this.configService.get<string>('SQLSERVER_HOST') ?? '192.168.1.51',
      port:     parseInt(this.configService.get<string>('SQLSERVER_PORT') ?? '1433'),
      user:     this.configService.get<string>('SQLSERVER_USER') ?? 'consulta',
      password: this.configService.get<string>('SQLSERVER_PASS') ?? '.-MinoilCons',
      database: this.configService.get<string>('SQLSERVER_DB') ?? 'bd_dms_minoil_prod_desarrollo',
      options: {
        encrypt:              false,
        trustServerCertificate: true,
      },
      connectionTimeout: 8000,
      requestTimeout:   15000,
    };

    this.pool = await new sql.ConnectionPool(config).connect();
    console.log('✅ Conectado a SQL Server exitosamente');
    return this.pool;
  }

  async query<T = any>(sqlQuery: string, params: Record<string, any> = {}): Promise<T[]> {
    const pool    = await this.getPool();
    const request = pool.request();

    for (const [key, value] of Object.entries(params)) {
      request.input(key, value);
    }

    const result = await request.query(sqlQuery);
    return result.recordset as T[];
  }

  async onModuleDestroy() {
    await this.pool?.close();
  }
}
