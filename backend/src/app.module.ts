import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { EmpleadosModule } from './empleados/empleados.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => ({
        PORT: process.env.PORT || 3000,
        JWT_SECRET: process.env.JWT_SECRET || 'mi-secreto-jwt-super-seguro-cambiar-en-produccion',
        HANA_HOST: process.env.HANA_HOST,
        HANA_PORT: process.env.HANA_PORT ? parseInt(process.env.HANA_PORT) : 30015,
        HANA_USER: process.env.HANA_USER,
        HANA_PASS: process.env.HANA_PASS,
      })],
    }),
    DatabaseModule,
    AuthModule,
    EmpleadosModule,
  ],
  // Removido SpaController - ahora se maneja con middleware en main.ts
})
export class AppModule {}
