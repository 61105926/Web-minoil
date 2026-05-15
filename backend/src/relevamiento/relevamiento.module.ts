import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { MobileAuthModule } from '../mobile-auth/mobile-auth.module';
import { RelevamientoController } from './relevamiento.controller';
import { RelevamientoService } from './relevamiento.service';

@Module({
  imports: [DatabaseModule, MobileAuthModule],
  controllers: [RelevamientoController],
  providers: [RelevamientoService],
})
export class RelevamientoModule {}
