import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SqlServerService } from './sqlserver.service';

@Global()
@Module({
  imports:   [ConfigModule],
  providers: [SqlServerService],
  exports:   [SqlServerService],
})
export class SqlServerModule {}
