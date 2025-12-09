import { ApiProperty } from '@nestjs/swagger';

export class GoogleRedirectDto {
  @ApiProperty({
    description: 'Authentication url for google',
  })
  google_auth_url: string;
}
