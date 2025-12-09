import { ApiProperty } from '@nestjs/swagger';

export class TransactionResponseDto {
  @ApiProperty({
    example: 'pay_1234567890',
    description: 'Unique identifier for the payment record',
  })
  id: string;

  @ApiProperty({
    example: 'user_abc123',
    description: 'ID of the user who made the payment',
  })
  user_id: string;

  @ApiProperty({
    example: 5000,
    description: 'Amount paid by the user',
  })
  amount: number;

  @ApiProperty({
    example: 'success',
    description: 'Current status of the payment',
  })
  status: string;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Timestamp when payment was completed, null if not paid',
    example: '2024-12-01T14:23:00.000Z',
  })
  paid_at: Date | null;

  @ApiProperty({
    type: String,
    description: 'Timestamp when this record was created',
    example: '2024-12-01T14:00:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    type: String,
    description: 'Timestamp when this record was last updated',
    example: '2024-12-01T14:10:00.000Z',
  })
  updated_at: Date;
}
