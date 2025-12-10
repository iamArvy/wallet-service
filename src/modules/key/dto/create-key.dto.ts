import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  ArrayNotEmpty,
  IsIn,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { API_PERMISSIONS } from 'src/common/enums';

export class CreateKeyDto {
  @ApiProperty({
    description: 'A descriptive name for the API key',
    example: 'wallet-service',
  })
  @IsString()
  @IsNotEmpty({ message: 'Key name is required' })
  name: string;

  @ApiProperty({
    description: 'Permissions assigned to the API key',
    example: [API_PERMISSIONS.DEPOSIT, API_PERMISSIONS.TRANSFER],
    isArray: true,
    enum: API_PERMISSIONS,
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one permission must be specified' })
  @IsIn(Object.values(API_PERMISSIONS), {
    each: true,
    message: 'Invalid permission provided',
  })
  permissions: API_PERMISSIONS[];

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
