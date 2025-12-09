import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class WalletBalanceDto {
  @ApiProperty({
    description: 'Wallet balance for authenticated user',
    example: '5000000000',
  })
  @Transform(({ value }: { value: bigint }) => value.toString())
  balance: string;

  constructor(partial: { balance: bigint }) {
    Object.assign(this, partial);
  }
}
