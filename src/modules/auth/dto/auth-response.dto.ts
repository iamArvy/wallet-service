import { UserResponseDto } from 'src/modules/user/dto/user-response.dto';
import { TokenData } from '.';
import { ApiProperty } from '@nestjs/swagger';

export class AuthResponse {
  @ApiProperty({ type: () => UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ type: () => TokenData })
  access: TokenData;
}
