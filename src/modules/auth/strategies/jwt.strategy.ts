import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ConfigService } from '@nestjs/config';
import { IJwtConfig } from 'src/config';

interface IJwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const { secret } = config.getOrThrow<IJwtConfig>('auth.jwt');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: IJwtPayload) {
    const userData: {
      id: string;
      email: string;
    } = {
      id: payload.sub,
      email: payload.email,
    };

    return userData;
  }
}
