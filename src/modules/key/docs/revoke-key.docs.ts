import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  KEY_ALREADY_REVOKED,
  KEY_NOT_FOUND,
  KEY_REVOKED,
} from 'src/common/system-messages';

export const RevokeKeyDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Revokes a key' }),
    ApiNoContentResponse({
      description: KEY_REVOKED,
    }),
    ApiNotFoundResponse({
      description: KEY_NOT_FOUND,
    }),
    ApiBadRequestResponse({ description: KEY_ALREADY_REVOKED }),
  );
};
