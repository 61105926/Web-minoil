import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { MobileAuthModule } from '../mobile-auth/mobile-auth.module';
import { RutasService } from './rutas.service';
import { RutasController } from './rutas.controller';

@Module({
  imports: [DatabaseModule, MobileAuthModule],
  controllers: [RutasController],
  providers: [RutasService],
})
export class RutasModule {}
