import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { CategoriaRelevamientoService } from './categoria-relevamiento.service';
import { CategoriaRelevamientoController } from './categoria-relevamiento.controller';
import { CategoriaRelevamientoMobileController } from './categoria-relevamiento-mobile.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [CategoriaRelevamientoController, CategoriaRelevamientoMobileController],
  providers: [CategoriaRelevamientoService],
  exports: [CategoriaRelevamientoService],
})
export class CategoriaRelevamientoModule {}
