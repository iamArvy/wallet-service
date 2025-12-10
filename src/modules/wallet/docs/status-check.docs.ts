import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { TransactionStatusDto } from '../dto';

export const StatusCheckDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Check the status of a payment' }),
    ApiOkResponse({
      description: 'Returns the status of the payment',
      type: TransactionStatusDto,
    }),
  );
};
