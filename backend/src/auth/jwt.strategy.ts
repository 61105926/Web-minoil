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
    const fullName = [payload.given_name, payload.family_name].filter(Boolean).join(' ')
      || payload.preferred_username

    return {
      userId:       payload.sub,
      username:     payload.preferred_username ?? payload.username,
      fullName,
      email:        payload.email,
      roles:        payload.realm_access?.roles ?? [],
      regional:     payload.regional      ?? null,
      codeRegional: payload.code_regional ?? null,
      empId:        payload.empID         ?? null,
      cargo:        payload.cargo         ?? null,
    };
  }
}
