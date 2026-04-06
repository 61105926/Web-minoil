import { Module } from '@nestjs/common';
import { MobileAuthController } from './mobile-auth.controller';
import { MobileAuthService } from './mobile-auth.service';
import { SqlServerModule } from '../sqlserver/sqlserver.module';

@Module({
  imports:     [SqlServerModule],
  controllers: [MobileAuthController],
  providers:   [MobileAuthService],
})
export class MobileAuthModule {}
