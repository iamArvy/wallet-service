import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
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
  INSUFFICIENT_BALANCE,
  INVALID_API_KEY,
  MISSING_PERMISSIONS,
  NO_AUTHENTICATION_PROVIDED,
  RECIPIENT_WALLET_NOT_FOUND,
  REVOKED_API_KEY,
  TRANSFER_COMPLETED,
  UNAUTHORIZED,
  WALLET_NOT_FOUND,
} from 'src/common/system-messages';
import { API_KEY_SECURITY_NAME } from 'src/common/constants';

export const TransferDocs = () => {
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
      description: TRANSFER_COMPLETED,
      schema: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'success' },
          message: {
            type: 'string',
            example: 'Transfer completed successfully',
          },
        },
      },
    }),
    ApiNotFoundResponse({
      description: WALLET_NOT_FOUND,
    }),
    ApiBadRequestResponse({
      description: `${RECIPIENT_WALLET_NOT_FOUND} | ${INSUFFICIENT_BALANCE}`,
    }),
  );
};
