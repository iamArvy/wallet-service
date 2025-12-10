import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const PaystackWebhookDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'perform webhook operations from paystack' }),
  );
};
