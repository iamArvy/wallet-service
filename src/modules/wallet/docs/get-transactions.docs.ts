import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
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
} from 'src/common/system-messages';
import { API_KEY_SECURITY_NAME } from 'src/common/constants';
import { ListTransactionsDto } from '../dto';

export const GetTransactionsDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Get all user transactions' }),
    ApiUnauthorizedResponse({
      description: `${UNAUTHORIZED} | ${NO_AUTHENTICATION_PROVIDED} | ${INVALID_API_KEY} | ${EXPIRED_API_KEY} | ${REVOKED_API_KEY}`,
    }),
    ApiForbiddenResponse({
      description: MISSING_PERMISSIONS,
    }),
    ApiBearerAuth(),
    ApiSecurity(API_KEY_SECURITY_NAME),
    ApiOkResponse({
      description: 'list of transactions',
      type: ListTransactionsDto,
    }),
  );
};
