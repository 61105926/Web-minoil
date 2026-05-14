import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { MobileAuthModule } from '../mobile-auth/mobile-auth.module';
import { CategoriaRelevamientoService } from './categoria-relevamiento.service';
import { CategoriaRelevamientoController } from './categoria-relevamiento.controller';
import { CategoriaRelevamientoMobileController } from './categoria-relevamiento-mobile.controller';

@Module({
  imports: [DatabaseModule, MobileAuthModule],
  controllers: [CategoriaRelevamientoController, CategoriaRelevamientoMobileController],
  providers: [CategoriaRelevamientoService],
  exports: [CategoriaRelevamientoService],
})
export class CategoriaRelevamientoModule {}
