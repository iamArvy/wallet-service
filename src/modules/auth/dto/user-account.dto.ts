import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { User } from 'src/generated/prisma/client';

@Exclude()
export class UserWallet {
  @Expose()
  @ApiProperty({
    example: '1234567890',
    description: 'Unique wallet number assigned to the user',
  })
  wallet_number: string;

  @Expose()
  @ApiProperty({
    example: '5000000000',
    description: 'User wallet balance (in the smallest currency unit)',
  })
  @Transform(({ value }: { value: bigint }) => value?.toString())
  balance: string;

  constructor(partial: Partial<UserWallet>) {
    Object.assign(this, partial);
  }
}

@Exclude()
export class UserAccount {
  @Expose()
  @ApiProperty({ example: 'user_abc123' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'Oluwaseyi' })
  first_name: string;

  @Expose()
  @ApiProperty({ example: 'Marvellous', nullable: true })
  last_name: string | null;

  @Expose()
  @ApiProperty({ example: 'oke@example.com' })
  email: string;

  @Expose()
  @ApiProperty({
    example: 'https://example.com/avatar.png',
    description: 'Profile picture URL',
  })
  profile_picture: string | null;

  @Expose()
  @ApiProperty({
    type: () => UserWallet,
    description: 'Associated wallet information',
  })
  wallet: UserWallet | null;

  constructor(user: Partial<User>, wallet: Partial<UserWallet> | null) {
    Object.assign(this, user);

    this.wallet = wallet ? new UserWallet(wallet) : null;
  }
}
