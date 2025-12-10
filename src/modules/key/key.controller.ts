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
import { RolloverKeyDto } from './dto';
import { JWTAuthGuard } from '../auth/guards';
import {
  CreateKeyDocs,
  KeyControllerDocs,
  ListKeysDocs,
  RevokeKeyDocs,
  RolloverKeyDocs,
} from './docs';

@KeyControllerDocs()
@UseGuards(JWTAuthGuard)
@Controller('keys')
export class KeyController {
  constructor(private readonly service: KeyService) {}

  @CreateKeyDocs()
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(
    @Req() req: IRequestWithUser<IJwtUser>,
    @Body() createKeyDto: CreateKeyDto,
  ) {
    return this.service.create(req.user.id, createKeyDto);
  }

  @ListKeysDocs()
  @Get()
  findAll(@Req() { user }: IRequestWithUser<IJwtUser>) {
    return this.service.findAll(user.id);
  }

  @RolloverKeyDocs()
  @Post('rollover')
  rollover(
    @Req() { user }: IRequestWithUser<IJwtUser>,
    @Body() body: RolloverKeyDto,
  ) {
    return this.service.rollover(user.id, body);
  }

  @RevokeKeyDocs()
  @Delete(':id')
  revoke(
    @Req() { user }: IRequestWithUser<IJwtUser>,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.revoke(user.id, id);
  }
}
