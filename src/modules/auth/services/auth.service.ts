import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IGoogleUser, IJwtUser } from 'src/common/types';
import { UserResponseDto } from 'src/modules/user/dto/user-response.dto';
import { TokenService } from 'src/integrations/token';
import { PrismaService } from 'src/db/prisma.service';
import { randomInt } from 'crypto';
import { UserAccount } from '../dto';
import * as sysMsg from 'src/common/system-messages';
import { GoogleService } from 'src/integrations/google';

@Injectable()
export class AuthService {
  constructor(
    private readonly token: TokenService,
    private readonly prisma: PrismaService,
    private readonly google: GoogleService,
  ) {}

  redirectToGoogle() {
    const url = this.google.getAuthUrl();

    return { google_auth_url: url };
  }

  async handleGoogleCallback(gUser: IGoogleUser) {
    if (!gUser) {
      throw new BadRequestException(sysMsg.GOOGLE_AUTHENTICATION_FAILED);
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

  async userAccount(iUser: IJwtUser) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: iUser.id,
      },
      include: {
        wallet: true,
      },
    });

    if (!user) throw new NotFoundException(sysMsg.USER_NOT_FOUND);

    const wallet = user.wallet
      ? {
          ...user.wallet,
          balance: user.wallet.balance.toString(),
        }
      : null;

    return new UserAccount(user, wallet);
  }

  private generateWalletNumber = (): string => {
    const timePart = Date.now().toString().slice(-8);
    const randomPart = randomInt(100000, 999999).toString();

    return `${timePart}${randomPart}`;
  };
}
