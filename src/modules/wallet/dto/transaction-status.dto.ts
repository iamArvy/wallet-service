import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TransactionStatusDto {
  @Expose()
  @ApiProperty({ description: 'Payment status', example: 'success' })
  status: string;

  constructor(partial: Partial<TransactionStatusDto>) {
    Object.assign(this, partial);
  }
}
