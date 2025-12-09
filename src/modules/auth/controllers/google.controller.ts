import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GoogleAuthService } from '../services';
import type { IGoogleUser, IRequestWithUser } from 'src/common/types';
import { GoogleAuthGuard } from '../guards';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthResponse, GoogleRedirectDto } from '../dto';

@ApiTags('Auth')
@Controller('auth/google')
export class GoogleAuthController {
  constructor(private readonly service: GoogleAuthService) {}

  @ApiOperation({ summary: 'Redirect to Google' })
  @ApiOkResponse({
    description: 'Returns url to Redirect to Google',
    type: GoogleRedirectDto,
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  redirectToGoogle() {
    return this.service.redirectToGoogle();
  }

  @ApiOperation({ summary: 'Handles Google Callback' })
  @ApiOkResponse({
    description: "Handles Google's callback and return user with jwt token",
    type: AuthResponse,
  })
  @ApiBadRequestResponse({ description: 'Bad Request - Invalid Token' })
  @Get('callback')
  @UseGuards(GoogleAuthGuard)
  handleGoogleCallback(@Req() req: IRequestWithUser<IGoogleUser>) {
    return this.service.handleGoogleCallback(req.user);
  }
}
