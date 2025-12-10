import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  KEY_NOT_EXPIRED,
  KEY_NOT_FOUND,
  KEY_ROLLOVER,
} from 'src/common/system-messages';

export const RolloverKeyDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new key from an expired key' }),
    ApiCreatedResponse({
      description: KEY_ROLLOVER,
    }),
    ApiNotFoundResponse({
      description: KEY_NOT_FOUND,
    }),
    ApiBadRequestResponse({ description: KEY_NOT_EXPIRED }),
  );
};
