import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TransactionResponseDto } from './transaction-response.dto';

export class ListTransactionsDto {
  @ApiProperty({
    type: [TransactionResponseDto],
    description: 'List of transactions',
  })
  @Type(() => TransactionResponseDto)
  items: TransactionResponseDto[];

  constructor(partial: Partial<ListTransactionsDto>) {
    Object.assign(this, partial);
  }
}
