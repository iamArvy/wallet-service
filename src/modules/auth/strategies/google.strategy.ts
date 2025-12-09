import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { IGoogleConfig } from 'src/config';

interface IGoogleProfile {
  id: string;
  emails: { value: string }[];
  name: { givenName: string; familyName: string };
  photos: { value: string }[];
  _json: {
    sub: string;
    given_name: string;
    family_name: string;
    picture: string;
    email: string;
    email_verified: boolean;
  };
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    const { clientId, secret, redirectUri } =
      config.getOrThrow<IGoogleConfig>('auth.google');
    super({
      clientID: clientId,
      clientSecret: secret,
      callbackURL: redirectUri,
      scope: ['openid', 'email', 'profile'],
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
