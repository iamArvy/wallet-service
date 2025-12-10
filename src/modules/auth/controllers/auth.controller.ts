import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../services';
import type { IGoogleUser, IJwtUser, IRequestWithUser } from 'src/common/types';
import { GoogleAuthGuard, JWTAuthGuard } from '../guards';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthResponse, GoogleRedirectDto } from '../dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @ApiOperation({ summary: 'Redirect to Google' })
  @ApiOkResponse({
    description: 'Returns url to Redirect to Google',
    type: GoogleRedirectDto,
  })
  @HttpCode(HttpStatus.OK)
  @Get('google')
  redirectToGoogle() {
    return this.service.redirectToGoogle();
  }

  @ApiOperation({ summary: 'Handles Google Callback' })
  @ApiOkResponse({
    description: "Handles Google's callback and return user with jwt token",
    type: AuthResponse,
  })
  @ApiBadRequestResponse({ description: 'Bad Request - Invalid Token' })
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  handleGoogleCallback(@Req() { user }: IRequestWithUser<IGoogleUser>) {
    return this.service.handleGoogleCallback(user);
  }

  @Get('me')
  @UseGuards(JWTAuthGuard)
  @ApiBearerAuth()
  me(@Req() { user }: IRequestWithUser<IJwtUser>) {
    return this.service.userAccount(user);
  }
}
