import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

const KEYCLOAK_ISSUER   = 'https://auth.minoil.com.bo/realms/Minoil';
const KEYCLOAK_JWKS_URI = `${KEYCLOAK_ISSUER}/protocol/openid-connect/certs`;

@Injectable()
export class MobileJwtStrategy extends PassportStrategy(Strategy, 'mobile-jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      issuer: KEYCLOAK_ISSUER,
      algorithms: ['RS256'],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
        jwksUri: KEYCLOAK_JWKS_URI,
      }),
    });
  }

  async validate(payload: any) {
    return {
      userId:     payload.sub,
      username:   payload.preferred_username ?? payload.username ?? '',
      login:      payload.preferred_username ?? payload.login    ?? '',
      idEmpleado: payload.empID              ?? payload.idEmpleado ?? null,
      empId:      payload.empID              ?? null,
    };
  }
}
