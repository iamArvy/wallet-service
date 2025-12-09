import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class KeyResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Unique identifier of the API key',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Descriptive name of the API key',
    example: 'wallet-service',
  })
  name: string;

  @Expose()
  @ApiProperty({
    description: 'The actual API key string',
    example: 'sk_live_xxx123abc456',
  })
  api_key: string;

  @Expose()
  @ApiProperty({
    description: 'Permissions assigned to the API key',
    example: ['deposit', 'transfer', 'read'],
  })
  permissions: string[];

  @Expose()
  @ApiProperty({
    description: 'Expiry datetime of the API key',
    example: '2025-12-09T12:00:00Z',
  })
  expires_at: Date;

  @Expose()
  @ApiProperty({
    description: 'Indicates if the API key is revoked',
    example: false,
    required: false,
  })
  revoked?: boolean;

  @Expose()
  @ApiProperty({
    description: 'Creation timestamp of the API key',
    example: '2025-12-09T12:00:00Z',
  })
  created_at: Date;

  @Expose()
  @ApiProperty({
    description: 'Last update timestamp of the API key',
    example: '2025-12-09T12:00:00Z',
  })
  updated_at: Date;

  constructor(partial: Partial<KeyResponseDto>) {
    Object.assign(this, partial);
  }
}
