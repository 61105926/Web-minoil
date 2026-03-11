import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

const KEYCLOAK_JWKS_URI = 'https://auth.minoil.com.bo/realms/minoil/protocol/openid-connect/certs';
const KEYCLOAK_ISSUER   = 'https://auth.minoil.com.bo/realms/minoil';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      audience: 'account',
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
      userId: payload.sub,
      username: payload.preferred_username ?? payload.username,
      email: payload.email,
      roles: payload.realm_access?.roles ?? [],
    };
  }
}
