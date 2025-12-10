import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { GoogleRedirectDto } from '../dto';

export const RedirectToGoogleDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Redirect to Google' }),
    ApiOkResponse({
      description: 'Returns url to Redirect to Google',
      type: GoogleRedirectDto,
    }),
  );
};
