import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';

@Injectable()
export class MobileJwtStrategy extends PassportStrategy(Strategy, 'mobile-jwt') {
  constructor(@Inject(ConfigService) configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'mi-secreto-jwt-super-seguro-cambiar-en-produccion',
      algorithms: ['HS256'],
    });
  }

  async validate(payload: any) {
    return {
      userId:     payload.sub,
      login:      payload.login,
      idEmpleado: payload.idEmpleado,
    };
  }
}
