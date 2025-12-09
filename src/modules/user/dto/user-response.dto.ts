import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/generated/prisma/client';

export class UserResponseDto {
  @ApiProperty({ type: String, description: 'Unique identifier of the user' })
  id: string;

  @ApiProperty({ type: String, description: 'Email address of the user' })
  email: string;

  @ApiProperty({ type: String, description: 'First name of the user' })
  first_name: string;

  @ApiProperty({ type: String, description: 'Last name of the user' })
  last_name: string;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Profile picture URL of the user',
  })
  profile_picture: string | null;

  @ApiProperty({
    type: Date,
    description: 'Timestamp when the user was created',
  })
  created_at: Date;

  @ApiProperty({
    type: Date,
    description: 'Timestamp when the user was last updated',
  })
  updated_at: Date;

  constructor(partial: User) {
    this.id = partial.id;
    this.email = partial.email;
    this.first_name = partial.first_name;
    this.last_name = partial.last_name;
    this.profile_picture = partial.profile_picture;
    this.created_at = partial.created_at;
    this.updated_at = partial.updated_at;
  }
}
