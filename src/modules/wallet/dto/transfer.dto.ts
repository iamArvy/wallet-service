import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';

export class TransferRequestDto {
  @ApiProperty({
    description: 'Wallet number of the recipient',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  @Length(10, 10, { message: 'Wallet number must be exactly 10 digits' })
  wallet_number: string;

  @ApiProperty({
    description:
      'Amount to transfer in the smallest currency unit (e.g., kobo for NGN)',
    example: 5000,
  })
  @IsNumber()
  @IsPositive({ message: 'Amount must be a positive number' })
  @IsNotEmpty()
  amount: number;
}
