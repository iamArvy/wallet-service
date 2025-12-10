import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import {
  IGoogleConfig,
  GOOGLE_CONFIG_NAME,
  GOOGLE_SCOPE,
} from 'src/integrations/google';
import * as constants from 'src/common/constants';
import { IGoogleProfile } from 'src/common/types';

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  Strategy,
  constants.GOOGLE_AUTH_STRATEGY,
) {
  constructor(config: ConfigService) {
    const { clientId, secret, redirectUri } =
      config.getOrThrow<IGoogleConfig>(GOOGLE_CONFIG_NAME);
    super({
      clientID: clientId,
      clientSecret: secret,
      callbackURL: redirectUri,
      scope: GOOGLE_SCOPE,
      passReqToCallback: false,
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: IGoogleProfile,
  ): any {
    return profile._json;
  }
}
