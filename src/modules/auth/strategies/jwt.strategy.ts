import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ConfigService } from '@nestjs/config';
import { IJwtConfig } from 'src/config';
import { JWT_CONFIG_NAME } from 'src/common/constants';

interface IJwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const { secret } = config.getOrThrow<IJwtConfig>(JWT_CONFIG_NAME);
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
