import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import {
  Transaction,
  TransactionType,
  TransactionStatus,
} from 'src/generated/prisma/client';

@Exclude()
export class TransactionResponseDto {
  @Expose()
  @ApiProperty({
    example: 'pay_1234567890',
    description: 'Unique identifier for the transaction',
  })
  id: string;

  @Expose()
  @ApiProperty({
    example: 'user_abc123',
    description: 'ID of the user who owns this transaction',
  })
  user_id: string;

  @Expose()
  @ApiProperty({
    example: '5000000000',
    description:
      'Transaction amount in smallest currency unit (e.g., kobo for NGN)',
  })
  @Transform(({ value }: { value: bigint }) => value.toString())
  amount: string;

  @Expose()
  @ApiProperty({
    example: 'success',
    description: 'Status of the transaction',
  })
  status: TransactionStatus;

  @Expose()
  @ApiProperty({
    example: 'deposit',
    description: 'Type of transaction (deposit or transfer)',
  })
  type: TransactionType;

  @Expose()
  @ApiProperty({
    example: 'wallet_abc123',
    description: 'Wallet ID from which the transaction originated',
  })
  wallet_id: string;

  @Expose()
  @ApiProperty({
    example: 'wallet_xyz456',
    description:
      'Wallet ID of the recipient (for transfers), null for deposits',
    nullable: true,
  })
  receiver_wallet_id: string;

  @Expose()
  @ApiProperty({
    example: 'REF1234567890',
    description: 'Reference code provided for this transaction',
  })
  reference: string;

  @Expose()
  @ApiProperty({
    example: '2025-12-09T12:00:00.000Z',
    description: 'Timestamp when payment was completed, null if not yet paid',
    type: String,
    nullable: true,
  })
  paid_at: Date | null;

  @Expose()
  @ApiProperty({
    example: '2025-12-09T11:50:00.000Z',
    description: 'Timestamp when this transaction record was created',
    type: String,
  })
  created_at: Date;

  @Expose()
  @ApiProperty({
    example: '2025-12-09T12:00:00.000Z',
    description: 'Timestamp when this transaction record was last updated',
    type: String,
  })
  updated_at: Date;

  constructor(partial: Partial<Transaction>) {
    Object.assign(this, partial);
  }
}
