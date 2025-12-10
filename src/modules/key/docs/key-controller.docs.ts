import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import * as sysMsg from 'src/common/system-messages';

export const KeyControllerDocs = () => {
  return applyDecorators(
    ApiUnauthorizedResponse({ description: sysMsg.UNAUTHORIZED }),
    ApiBearerAuth(),
    ApiTags('Key'),
  );
};
