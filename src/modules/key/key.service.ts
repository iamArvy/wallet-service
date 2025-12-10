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
import { API_KEY_PREFIX, MAX_USER_KEYS } from 'src/common/constants';
import * as sysMsg from 'src/common/system-messages';

@Injectable()
export class KeyService {
  private readonly logger: Logger;
  private readonly maxKeys = MAX_USER_KEYS;
  private readonly keyPrefix = API_KEY_PREFIX;

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
      throw new BadRequestException(sysMsg.KEYS_LIMIT_REACHED);

    const existing = await this.prisma.key.findMany({
      where: {
        user_id,
        name,
      },
    });
    if (existing.length > 0)
      throw new ConflictException(sysMsg.KEY_NAME_EXISTS);
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
    if (!expiredKey || expiredKey.revoked)
      throw new NotFoundException(sysMsg.KEY_NOT_FOUND);
    if (expiredKey.expires_at > new Date())
      throw new BadRequestException(sysMsg.KEY_NOT_EXPIRED);
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
    if (!existing) throw new NotFoundException(sysMsg.KEY_NOT_FOUND);
    if (existing.revoked)
      throw new BadRequestException(sysMsg.KEY_ALREADY_REVOKED);
    await this.prisma.key.update({
      where: {
        id,
      },
      data: {
        revoked: true,
      },
    });
    return sysMsg.KEY_REVOKED;
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
        throw new BadRequestException(sysMsg.INVALID_EXPIRY);
    }
  };
}
