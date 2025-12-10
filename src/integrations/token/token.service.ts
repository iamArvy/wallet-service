import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenData } from '../../modules/auth/dto';
import {
  ACCESS_TOKEN_EXPIRY,
  ACCESS_TOKEN_TYPE,
  REFRESH_TOKEN_EXPIRY,
  REFRESH_TOKEN_TYPE,
} from 'src/common/constants';

@Injectable()
export class TokenService {
  private readonly accessExpiry = ACCESS_TOKEN_EXPIRY;
  private readonly refreshExpiry = REFRESH_TOKEN_EXPIRY;
  private readonly accessType = ACCESS_TOKEN_TYPE;
  private readonly refreshType = REFRESH_TOKEN_TYPE;

  constructor(private jwtService: JwtService) {}

  private async generate<T extends object>(
    payload: T,
    expiresIn: number,
  ): Promise<TokenData> {
    const token = await this.jwtService.signAsync(payload, {
      expiresIn,
    });
    return { token, expiresIn };
  }

  async access(id: string, email: string): Promise<TokenData> {
    return await this.generate(
      { sub: id, type: this.accessType, email },
      this.accessExpiry,
    );
  }
  async refresh(id: string): Promise<TokenData> {
    return await this.generate(
      { sub: id, type: this.refreshType },
      this.refreshExpiry,
    );
  }

  async verify<T extends object>(token: string): Promise<T> {
    return this.jwtService.verifyAsync<T>(token);
  }
}
