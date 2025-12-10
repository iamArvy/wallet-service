import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserAccount } from '../dto';
import * as sysMsg from 'src/common/system-messages';

export const UserAccountDocs = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get Authenticated User Account' }),
    ApiOkResponse({
      description: "Handles Google's callback and return user with jwt token",
      type: UserAccount,
    }),
    ApiUnauthorizedResponse({ description: sysMsg.UNAUTHORIZED }),
  );
};
