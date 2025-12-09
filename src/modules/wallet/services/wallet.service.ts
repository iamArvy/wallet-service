import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { IJwtUser } from 'src/common/types';
import {
  IPaystackWebhookInterface,
  PaystackHttpClient,
} from 'src/integrations/paystack';
import { TransactionStatus, TransactionType } from 'src/generated/prisma/enums';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { DepositResponseDto, TransactionStatusDto } from '../dto';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class WalletService {
  private readonly logger: Logger;

  constructor(
    private readonly paystackClient: PaystackHttpClient,
    private readonly prisma: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) baseLogger: Logger,
  ) {
    this.logger = baseLogger.child({ context: WalletService.name });
  }

  async deposit(rUser: IJwtUser, amount: number, idempotency_key: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: rUser.id },
      select: { wallet: true },
    });

    if (!user) throw new NotFoundException('User not found');
    if (!user.wallet) throw new BadRequestException('Wallet does not exist');

    const existing = await this.prisma.transaction.findUnique({
      where: { idempotency_key },
    });

    if (existing && existing.authorization_url) {
      if (existing.authorization_url && existing.authorization_url !== null)
        return new DepositResponseDto({
          reference: existing.reference,
          authorization_url: existing.authorization_url,
        });
    }

    const wallet = user.wallet;

    const response = await this.paystackClient.initializePayment(
      rUser.email,
      amount,
    );

    await this.prisma.transaction.create({
      data: {
        amount,
        wallet: { connect: { id: wallet.id } },
        idempotency_key,
        type: TransactionType.deposit,
        reference: response.reference,
        authorization_url: response.authorization_url,
      },
    });

    return new DepositResponseDto(response);
  }

  async getBalance(userId: string) {
    console.log(userId);
    const wallet = await this.prisma.wallet.findUnique({
      where: { user_id: userId },
      select: { balance: true },
    });
    console.log(wallet);
    return wallet;
  }

  getTransactions() {
    return this.prisma.transaction.findMany();
  }

  async statusCheck(reference: string, refresh: boolean) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { reference },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    if (transaction.status === TransactionStatus.pending || refresh) {
      const response = await this.paystackClient.verifyPayment(reference);
      return new TransactionStatusDto(response);
    }
    return new TransactionStatusDto(transaction);
  }

  async processPaystackWebhook(
    signature: string,
    payload: IPaystackWebhookInterface,
  ) {
    const valid = this.paystackClient.validateWebhookEvent(signature, payload);
    if (!valid) throw new UnauthorizedException('Invalid Request');

    if (payload.event !== 'charge.success') {
      this.logger.warn(`Unhandled webhook event: ${payload.event}`);
      return;
    }

    const { reference, status } = payload.data;

    const transaction = await this.prisma.transaction.findUnique({
      where: { reference },
      include: { wallet: true },
    });

    if (!transaction) {
      this.logger.error(`Transaction not found for reference: ${reference}`);
      return;
    }

    if (transaction.status === TransactionStatus.success) {
      this.logger.warn(
        `Duplicate webhook received — transaction already processed: ${reference}`,
      );
      return;
    }

    if (status !== 'success') {
      this.logger.warn(`Status is not success for reference ${reference}`);
      return;
    }

    await this.prisma.$transaction(async (prisma) => {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: TransactionStatus.success,
          paid_at: new Date(payload.data.paid_at ?? new Date()),
          webhook_payload: JSON.parse(
            JSON.stringify(payload),
          ) as unknown as Prisma.InputJsonValue,
        },
      });

      await prisma.wallet.update({
        where: { id: transaction.wallet_id },
        data: {
          balance: transaction.wallet.balance + transaction.amount,
        },
      });
    });

    this.logger.info(`Transaction processed successfully: ${reference}`);
  }

  private mapPaystackStatus = (status: string): TransactionStatus => {
    switch (status) {
      case 'success':
        return TransactionStatus.success;
      case 'failed':
        return TransactionStatus.failed;
      case 'abandoned':
        return TransactionStatus.abandoned;
      default:
        return TransactionStatus.pending;
    }
  };
}
