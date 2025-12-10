import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { KeyResponseDto } from '../dto';
import {
  KEY_CREATED,
  KEY_NAME_EXISTS,
  KEYS_LIMIT_REACHED,
} from 'src/common/system-messages';

export const CreateKeyDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Initialize a payment' }),
    ApiCreatedResponse({
      description: KEY_CREATED,
      type: KeyResponseDto,
    }),
    ApiBadRequestResponse({ description: KEYS_LIMIT_REACHED }),
    ApiConflictResponse({ description: KEY_NAME_EXISTS }),
  );
};
