import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class RolloverKeyDto {
  @ApiProperty({
    description: 'The ID of the expired API key to rollover',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsUUID()
  @IsNotEmpty()
  expired_key_id: string;

  @ApiProperty({
    description: 'Expiry duration for the key',
    example: '1D',
    enum: ['1H', '1D', '1M', '1Y'],
  })
  @IsString()
  @IsIn(['1H', '1D', '1M', '1Y'], {
    message: 'Expiry must be one of 1H, 1D, 1M, 1Y',
  })
  expiry: string;
}
