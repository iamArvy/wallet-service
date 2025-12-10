import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { KeyResponseDto } from '../dto';

export const ListKeysDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'List API keys for Authenticated User' }),
    ApiOkResponse({
      description: 'keys fetched successfully',
      type: KeyResponseDto,
      isArray: true,
    }),
  );
};
