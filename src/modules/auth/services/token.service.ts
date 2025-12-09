import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenData } from '../dto';

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  private logger = new Logger('TokenService');

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
    return await this.generate({ sub: id, type: 'access', email }, 2 * 60 * 60);
  }
  async refresh(id: string): Promise<TokenData> {
    return await this.generate({ sub: id, type: 'refresh' }, 7 * 24 * 60 * 60);
  }

  async verify<T extends object>(token: string): Promise<T> {
    return this.jwtService.verifyAsync<T>(token);
  }
}
