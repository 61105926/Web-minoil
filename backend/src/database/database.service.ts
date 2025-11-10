import { Injectable, OnModuleDestroy, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as hana from '@sap/hana-client';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private connection: any;

  constructor(
    @Inject(ConfigService) private configService: ConfigService
  ) {}

  async connect(): Promise<void> {
    if (this.connection) {
      return;
    }

    const host = this.configService.get<string>('HANA_HOST');
    const user = this.configService.get<string>('HANA_USER');
    const password = this.configService.get<string>('HANA_PASS');

    // Si no hay credenciales, no intentar conectar (modo demo)
    if (!host || !user || !password) {
      console.log('⚠️  Credenciales HANA no configuradas - Modo DEMO activo');
      return;
    }

    const connectionParams = {
      host,
      port: this.configService.get<number>('HANA_PORT') || 30015,
      user,
      password,
    };

    try {
      this.connection = hana.createConnection();

      return new Promise((resolve, reject) => {
        // Timeout de 5 segundos para evitar que se cuelgue
        const timeout = setTimeout(() => {
          this.connection = null;
          console.error('⏱️  Timeout conectando a SAP HANA (5s)');
          reject(new Error('Timeout conectando a SAP HANA'));
        }, 5000);

        this.connection.connect(connectionParams, (err) => {
          clearTimeout(timeout);
          if (err) {
            console.error('❌ Error conectando a SAP HANA:', err.message);
            this.connection = null;
            reject(err);
          } else {
            console.log('✅ Conectado a SAP HANA exitosamente');
            resolve();
          }
        });
      });
    } catch (error: any) {
      console.error('❌ Error creando conexión HANA:', error.message);
      this.connection = null;
      throw error;
    }
  }

  async query(sql: string, params: any[] = []): Promise<any[]> {
    try {
      // Intentar conectar si no hay conexión
      if (!this.connection) {
        try {
          await this.connect();
        } catch (error: any) {
          // Si falla la conexión, lanzar error para que los servicios lo manejen
          throw new Error(`No se pudo conectar a SAP HANA: ${error.message}`);
        }
      }

      // Si aún no hay conexión (modo demo), lanzar error
      if (!this.connection) {
        throw new Error('Conexión a SAP HANA no disponible - Modo DEMO');
      }

      return new Promise((resolve, reject) => {
        this.connection.exec(sql, params, (err, rows) => {
          if (err) {
            console.error('Error ejecutando query:', err.message);
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    } catch (error: any) {
      console.error('Error en query:', error.message);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      return new Promise((resolve, reject) => {
        this.connection.disconnect((err) => {
          if (err) {
            reject(err);
          } else {
            console.log('Desconectado de SAP HANA');
            this.connection = null;
            resolve();
          }
        });
      });
    }
  }

  onModuleDestroy() {
    this.disconnect();
  }
}
