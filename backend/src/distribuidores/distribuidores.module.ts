import { Module } from '@nestjs/common';
import { DistribuidoresController } from './distribuidores.controller';
import { DistribuidoresService } from './distribuidores.service';

@Module({
  controllers: [DistribuidoresController],
  providers: [DistribuidoresService],
})
export class DistribuidoresModule {}
