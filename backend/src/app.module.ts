import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { SalasModule } from './salas/salas.module';
import { ProductosModule } from './productos/productos.module';
import { ImpostorModule } from './impostor/impostor.module';
import { ReemplazoCervezaModule } from './reemplazo-cerveza/reemplazo-cerveza.module';
import { ClientesModule } from './clientes/clientes.module';
import { DistribuidoresModule } from './distribuidores/distribuidores.module';
import { SqlServerModule } from './sqlserver/sqlserver.module';
import { MobileAuthModule } from './mobile-auth/mobile-auth.module';
import { CategoriaRelevamientoModule } from './categoria-relevamiento/categoria-relevamiento.module';
import { RutasModule } from './rutas/rutas.module';
import { SpaModule } from './spa.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => ({
        PORT: process.env.PORT || 8005,
        JWT_SECRET: process.env.JWT_SECRET,
        HANA_HOST: process.env.HANA_HOST,
        HANA_PORT: process.env.HANA_PORT ? parseInt(process.env.HANA_PORT) : 30015,
        HANA_USER: process.env.HANA_USER,
        HANA_PASS: process.env.HANA_PASS,
      })],
    }),
    DatabaseModule,
    AuthModule,
    EmpleadosModule,
    SalasModule,
    ProductosModule,
    ImpostorModule,
    ReemplazoCervezaModule,
    ClientesModule,
    DistribuidoresModule,
    SqlServerModule,
    MobileAuthModule,
    CategoriaRelevamientoModule,
    RutasModule,
    SpaModule, // Importar al final para que se registre después de los demás controladores
  ],
})
export class AppModule {}
