import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  EXPIRED_API_KEY,
  INVALID_API_KEY,
  MISSING_PERMISSIONS,
  NO_AUTHENTICATION_PROVIDED,
  REVOKED_API_KEY,
  UNAUTHORIZED,
  WALLET_NOT_FOUND,
} from 'src/common/system-messages';
import { API_KEY_SECURITY_NAME } from 'src/common/constants';
import { WalletBalanceDto } from '../dto';

export const GetBalanceDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Get authenticated user wallet balance' }),
    ApiUnauthorizedResponse({
      description: `${UNAUTHORIZED} | ${NO_AUTHENTICATION_PROVIDED} | ${INVALID_API_KEY} | ${EXPIRED_API_KEY} | ${REVOKED_API_KEY}`,
    }),
    ApiForbiddenResponse({
      description: MISSING_PERMISSIONS,
    }),
    ApiBearerAuth(),
    ApiSecurity(API_KEY_SECURITY_NAME),
    ApiOkResponse({
      description: 'user balance',
      type: WalletBalanceDto,
    }),
    ApiNotFoundResponse({
      description: WALLET_NOT_FOUND,
    }),
  );
};
