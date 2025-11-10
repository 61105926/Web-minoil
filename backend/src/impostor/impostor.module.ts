import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ImpostorService } from './impostor.service';
import { ImpostorController } from './impostor.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [ImpostorController],
  providers: [ImpostorService],
  exports: [ImpostorService],
})
export class ImpostorModule {}

