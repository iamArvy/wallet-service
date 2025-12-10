import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiSecurity,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { DepositResponseDto } from '../dto';
import {
  EXPIRED_API_KEY,
  INVALID_API_KEY,
  MISSING_PERMISSIONS,
  NO_AUTHENTICATION_PROVIDED,
  PAYMENT_INITIATED,
  REVOKED_API_KEY,
  UNAUTHORIZED,
  WALLET_NOT_FOUND,
} from 'src/common/system-messages';
import { API_KEY_SECURITY_NAME } from 'src/common/constants';

export const DepositDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Deposit funds into user wallet' }),
    ApiUnauthorizedResponse({
      description: `${UNAUTHORIZED} | ${NO_AUTHENTICATION_PROVIDED} | ${INVALID_API_KEY} | ${EXPIRED_API_KEY} | ${REVOKED_API_KEY}`,
    }),
    ApiForbiddenResponse({
      description: MISSING_PERMISSIONS,
    }),
    ApiCreatedResponse({
      description: PAYMENT_INITIATED,
      type: DepositResponseDto,
    }),
    ApiBearerAuth(),
    ApiSecurity(API_KEY_SECURITY_NAME),
    ApiNotFoundResponse({ description: WALLET_NOT_FOUND }),
  );
};
