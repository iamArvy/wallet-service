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
  IPaystackWebhookData,
  IPaystackWebhookInterface,
  PAYSTACK_EVENTS,
  PaystackHttpClient,
} from 'src/integrations/paystack';
import { TransactionStatus, TransactionType } from 'src/generated/prisma/enums';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import {
  DepositResponseDto,
  TransactionResponseDto,
  TransactionStatusDto,
  TransferRequestDto,
  WalletBalanceDto,
} from '../dto';
import { Prisma } from 'src/generated/prisma/client';
import { ListTransactionsDto } from '../dto/list-transactions.dto';
import * as sysMsg from 'src/common/system-messages';

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
    const wallet = await this.prisma.wallet.findUnique({
      where: { user_id: rUser.id },
    });

    if (!wallet) throw new NotFoundException(sysMsg.WALLET_NOT_FOUND);

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
    const wallet = await this.prisma.wallet.findUnique({
      where: { user_id: userId },
      select: { balance: true },
    });
    if (!wallet) throw new NotFoundException(sysMsg.WALLET_NOT_FOUND);
    return new WalletBalanceDto(wallet);
  }

  async getTransactions(user_id: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        wallet: {
          user_id,
        },
        receiver_wallet: {
          user_id,
        },
      },
    });
    const transactionDtos = transactions.map(
      (tx) => new TransactionResponseDto(tx),
    );

    return new ListTransactionsDto({ items: transactionDtos });
  }

  async statusCheck(reference: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { reference },
    });

    if (!transaction) {
      throw new NotFoundException(sysMsg.TRANSACTION_NOT_FOUND);
    }
    if (transaction.status === TransactionStatus.pending) {
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
    if (!valid) throw new UnauthorizedException(sysMsg.INVALID_REQUEST);
    const { event, data } = payload;

    switch (event) {
      case PAYSTACK_EVENTS.CHARGE_SUCCESS:
        return this.handleChargeSuccessEvent(data);
      default:
        this.logger.warn(sysMsg.UNHANDLED_WEBHOOK_EVENT(event));
        return;
    }
  }

  private async handleChargeSuccessEvent(data: IPaystackWebhookData) {
    const { reference, status } = data;

    const transaction = await this.prisma.transaction.findUnique({
      where: { reference },
      include: { wallet: true },
    });

    if (!transaction) {
      this.logger.error(sysMsg.TRANSACTION_NOT_FOUND_FOR_REFERENCE(reference));
      return;
    }

    if (transaction.status === TransactionStatus.success) {
      this.logger.warn(sysMsg.DUPLICATE_WEBHOOK_RECEIVED(reference));
      return;
    }

    if (status !== 'success') {
      this.logger.warn(sysMsg.CHARGE_SUCCESS_STATUS_NOT_SUCCESS(reference));
      return;
    }

    await this.prisma.$transaction(async (prisma) => {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: TransactionStatus.success,
          paid_at: new Date(data.paid_at ?? new Date()),
          webhook_payload: JSON.parse(
            JSON.stringify(data),
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

    this.logger.info(sysMsg.WEBHOOK_PROCESSED_SUCCESSFULLY(reference));
  }

  async transfer(user: IJwtUser, payload: TransferRequestDto) {
    const { wallet_number, amount } = payload;
    const transferAmount = BigInt(amount);
    const userWallet = await this.prisma.wallet.findUnique({
      where: {
        user_id: user.id,
      },
    });

    if (!userWallet) throw new NotFoundException(sysMsg.WALLET_NOT_FOUND);

    const recipientWallet = await this.prisma.wallet.findUnique({
      where: { wallet_number },
    });

    if (!recipientWallet)
      throw new BadRequestException(sysMsg.RECIPIENT_WALLET_NOT_FOUND);

    if (transferAmount > userWallet.balance)
      throw new BadRequestException(sysMsg.INSUFFICIENT_BALANCE);

    await this.prisma.$transaction(async (prisma) => {
      await prisma.transaction.create({
        data: {
          amount: transferAmount,
          wallet: {
            connect: { id: userWallet.id },
          },
          receiver_wallet: {
            connect: { id: recipientWallet.id },
          },
          type: TransactionType.transfer,
        },
      });

      await prisma.wallet.update({
        where: {
          id: userWallet.id,
        },
        data: {
          balance: userWallet.balance - transferAmount,
        },
      });

      await prisma.wallet.update({
        where: {
          id: recipientWallet.id,
        },
        data: {
          balance: recipientWallet.balance + transferAmount,
        },
      });
    });

    return { status: 'success', message: sysMsg.TRANSFER_COMPLETED };
  }
}
