import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ReemplazoCervezaService } from './reemplazo-cerveza.service';
import { ReemplazoCervezaController } from './reemplazo-cerveza.controller';

@Module({
  imports: [DatabaseModule],
  providers: [ReemplazoCervezaService],
  controllers: [ReemplazoCervezaController],
})
export class ReemplazoCervezaModule {}

