import type { IJwtUser, IRequestWithUser } from 'src/common/types';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { KeyService } from './key.service';
import { CreateKeyDto } from './dto/create-key.dto';
import { KeyResponseDto, RolloverKeyDto } from './dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JWTAuthGuard } from '../auth/guards';

@ApiUnauthorizedResponse({ description: 'Unauthorized user' })
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
@Controller('keys')
export class KeyController {
  constructor(private readonly service: KeyService) {}

  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Initialize a payment' })
  @ApiCreatedResponse({
    description: 'API Key Created',
    type: KeyResponseDto,
  })
  @Post()
  create(
    @Req() req: IRequestWithUser<IJwtUser>,
    @Body() createKeyDto: CreateKeyDto,
  ) {
    return this.service.create(req.user.id, createKeyDto);
  }

  @Get()
  findAll(@Req() { user }: IRequestWithUser<IJwtUser>) {
    return this.service.findAll(user.id);
  }

  @Post('rollover')
  rollover(
    @Req() { user }: IRequestWithUser<IJwtUser>,
    @Body() body: RolloverKeyDto,
  ) {
    return this.service.rollover(user.id, body);
  }

  @Delete(':id')
  revoke(
    @Req() { user }: IRequestWithUser<IJwtUser>,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.revoke(user.id, id);
  }
}
