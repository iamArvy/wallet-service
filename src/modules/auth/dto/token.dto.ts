import { ApiProperty } from '@nestjs/swagger';

export class TokenData {
  @ApiProperty({
    description: 'JWT Token',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lI',
  })
  token: string;

  @ApiProperty({ description: 'Token Expiry Time' })
  expiresIn: number;
}
