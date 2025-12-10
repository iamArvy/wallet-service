import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthResponse } from '../dto';

export const HandleGoogleCallbackDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Handles Google Callback' }),
    ApiOkResponse({
      description: "Handles Google's callback and return user with jwt token",
      type: AuthResponse,
    }),
    ApiBadRequestResponse({ description: 'Bad Request - Invalid Token' }),
  );
};
