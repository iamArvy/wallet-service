import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '../services';
import type { IGoogleUser, IJwtUser, IRequestWithUser } from 'src/common/types';
import { GoogleAuthGuard, JWTAuthGuard } from '../guards';
import {
  HandleGoogleCallbackDocs,
  RedirectToGoogleDocs,
  UserAccountDocs,
} from '../docs';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @RedirectToGoogleDocs()
  @Get('google')
  redirectToGoogle() {
    return this.service.redirectToGoogle();
  }

  @HandleGoogleCallbackDocs()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  handleGoogleCallback(@Req() { user }: IRequestWithUser<IGoogleUser>) {
    return this.service.handleGoogleCallback(user);
  }

  @UserAccountDocs()
  @Get('me')
  @UseGuards(JWTAuthGuard)
  me(@Req() { user }: IRequestWithUser<IJwtUser>) {
    return this.service.userAccount(user);
  }
}
