import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateKeyDto } from './dto/create-key.dto';
import { KeyResponseDto, RolloverKeyDto } from './dto';
import { Logger } from 'winston';
import { PrismaService } from 'src/db/prisma.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { randomBytes } from 'crypto';

@Injectable()
export class KeyService {
  private readonly logger: Logger;
  private readonly maxKeys = 5;
  private readonly keyPrefix = 'sk_live_';

  constructor(
    private readonly prisma: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) baseLogger: Logger,
  ) {
    this.logger = baseLogger.child({ context: KeyService.name });
  }

  async create(user_id: string, data: CreateKeyDto) {
    const { name, permissions, expiry } = data;
    const count = await this.prisma.key.count({
      where: {
        user_id,
        revoked: false,
      },
    });

    if (count >= this.maxKeys)
      throw new BadRequestException(
        'Key limit reached revoked a key and try again',
      );

    const existing = await this.prisma.key.findMany({
      where: {
        user_id,
        name,
      },
    });
    if (existing.length > 0)
      throw new ConflictException('Key with name already exists');
    const expires_at = this.mapExpiryDate(expiry);
    const api_key = await this.generateApiKey();
    const key = await this.prisma.key.create({
      data: {
        user: {
          connect: { id: user_id },
        },
        name,
        permissions,
        expires_at,
        api_key,
      },
    });
    return new KeyResponseDto(key);
  }

  findAll(user_id: string) {
    return this.prisma.key.findMany({
      where: {
        user_id,
      },
    });
  }

  async rollover(user_id: string, data: RolloverKeyDto) {
    const { expired_key_id, expiry } = data;
    const expiredKey = await this.prisma.key.findFirst({
      where: {
        id: expired_key_id,
        user_id,
      },
    });
    if (!expiredKey) throw new NotFoundException('Key not found');
    const expires_at = this.mapExpiryDate(expiry);
    const api_key = await this.generateApiKey();
    const key = await this.prisma.$transaction(async (prisma) => {
      const key = await prisma.key.create({
        data: {
          user: {
            connect: { id: user_id },
          },
          name: expiredKey.name,
          permissions: expiredKey.permissions,
          expires_at,
          api_key,
          version: expiredKey.version + 1,
        },
      });
      await prisma.key.update({
        where: {
          id: expired_key_id,
        },
        data: {
          revoked: true,
        },
      });
      return key;
    });
    return new KeyResponseDto(key);
  }

  async revoke(user_id: string, id: string) {
    const existing = await this.prisma.key.findUnique({
      where: {
        user_id,
        id,
      },
    });
    if (!existing) throw new NotFoundException('Key not found');
    await this.prisma.key.update({
      where: {
        id,
      },
      data: {
        revoked: true,
      },
    });
    return 'Key revoked successfully';
  }

  /**
   * Generates a unique API key with the class keyPrefix.
   * Ensures no duplicates exist in the database.
   */
  async generateApiKey(): Promise<string> {
    while (true) {
      const randomString = randomBytes(24).toString('hex');
      const apiKey = `${this.keyPrefix}${randomString}`;

      const existing = await this.prisma.key.findUnique({
        where: { api_key: apiKey },
      });

      if (!existing) {
        return apiKey;
      }
    }
  }

  private mapExpiryDate = (expiry: string): Date => {
    const now = new Date();

    switch (expiry.toUpperCase()) {
      case '1H':
        now.setHours(now.getHours() + 1);
        return now;
      case '1D':
        now.setDate(now.getDate() + 1);
        return now;
      case '1M':
        now.setMonth(now.getMonth() + 1);
        return now;
      case '1Y':
        now.setFullYear(now.getFullYear() + 1);
        return now;
      default:
        throw new BadRequestException(
          'Invalid expiry value. Must be one of 1H, 1D, 1M, 1Y.',
        );
    }
  };
}
