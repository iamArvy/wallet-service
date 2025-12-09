import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import qs from 'qs';
import { IGoogleUser } from 'src/common/types';
import { UserResponseDto } from 'src/modules/user/dto/user-response.dto';
import { TokenService } from './token.service';
import { PrismaService } from 'src/db/prisma.service';
import { IGoogleConfig } from 'src/config';
import { randomInt } from 'crypto';

@Injectable()
export class AuthService {
  private googleOauthURL = 'https://accounts.google.com/o/oauth2/v2/auth';

  private clientId: string;
  private redirectUri: string;

  constructor(
    config: ConfigService,
    private readonly token: TokenService,
    private readonly prisma: PrismaService,
  ) {
    const { clientId, redirectUri } =
      config.getOrThrow<IGoogleConfig>('auth.google');
    this.clientId = clientId;
    this.redirectUri = redirectUri;
  }
  redirectToGoogle() {
    const url =
      this.googleOauthURL +
      '?' +
      qs.stringify({
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
        response_type: 'code',
        scope: ['openid', 'email', 'profile'].join(' '),
        access_type: 'offline',
        prompt: 'consent',
      });

    return { google_auth_url: url };
  }

  async handleGoogleCallback(gUser: IGoogleUser) {
    if (!gUser) {
      throw new BadRequestException('Google authentication failed');
    }

    const user = await this.prisma.user.upsert({
      where: { google_id: gUser.sub },
      create: {
        google_id: gUser.sub,
        email: gUser.email,
        first_name: gUser.given_name,
        last_name: gUser.family_name,
        profile_picture: gUser.picture,
        wallet: {
          create: {
            wallet_number: this.generateWalletNumber(),
          },
        },
      },
      update: {
        email: gUser.email,
        first_name: gUser.given_name,
        last_name: gUser.family_name,
        profile_picture: gUser.picture,
      },
    });

    const access = await this.token.access(user.id, user.email);
    return {
      user: new UserResponseDto(user),
      access,
    };
  }

  private generateWalletNumber = (): string => {
    const timePart = Date.now().toString().slice(-8);
    const randomPart = randomInt(100000, 999999).toString();

    return `${timePart}${randomPart}`;
  };
}
