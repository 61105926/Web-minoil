import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MobileAuthController } from './mobile-auth.controller';
import { MobileAuthService } from './mobile-auth.service';
import { MobileJwtStrategy } from './mobile-jwt.strategy';
import { SqlServerModule } from '../sqlserver/sqlserver.module';

@Module({
  imports: [
    SqlServerModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports:    [ConfigModule],
      inject:     [ConfigService],
      useFactory: (cs: ConfigService) => ({
        secret:      cs.get<string>('JWT_SECRET') ?? 'mi-secreto-jwt-super-seguro-cambiar-en-produccion',
        signOptions: { expiresIn: '8h' },
      }),
    }),
  ],
  controllers: [MobileAuthController],
  providers:   [MobileAuthService, MobileJwtStrategy],
  exports:     [MobileJwtStrategy],
})
export class MobileAuthModule {}
