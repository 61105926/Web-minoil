import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { SalasModule } from './salas/salas.module';
import { ProductosModule } from './productos/productos.module';
import { ImpostorModule } from './impostor/impostor.module';
import { SpaModule } from './spa.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => ({
        PORT: process.env.PORT || 8005,
        JWT_SECRET: process.env.JWT_SECRET || 'mi-secreto-jwt-super-seguro-cambiar-en-produccion',
        // Credenciales HANA - Valores por defecto de producción
        // Se pueden sobrescribir con variables de entorno si es necesario
        HANA_HOST: process.env.HANA_HOST || '192.168.1.220',
        HANA_PORT: process.env.HANA_PORT ? parseInt(process.env.HANA_PORT) : 30015,
        HANA_USER: process.env.HANA_USER || 'CONSULTA',
        HANA_PASS: process.env.HANA_PASS || '*M1n01l54',
      })],
    }),
    DatabaseModule,
    AuthModule,
    EmpleadosModule,
    SalasModule,
    ProductosModule,
    ImpostorModule,
    SpaModule, // Importar al final para que se registre después de los demás controladores
  ],
})
export class AppModule {}
