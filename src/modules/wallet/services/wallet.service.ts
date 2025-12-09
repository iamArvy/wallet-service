import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { IJwtUser } from 'src/common/types';
import { PaystackHttpClient } from 'src/integrations/paystack';
import { TransactionStatus, TransactionType } from 'src/generated/prisma/enums';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { DepositResponseDto, TransactionStatusDto } from '../dto';

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

  // async create(userId: string) {
  //   const user = await this.prisma.user.findUnique({
  //     where: { id: userId },
  //   });
  //   if (!user) {
  //     this.logger.error('User not found');
  //     return;
  //   }
  //   while (true) {
  //     const wallet_number = this.generateWalletNumber();

  //     try {
  //       return await this.prisma.wallet.create({
  //         data: {
  //           user_id: userId,
  //           wallet_number,
  //         },
  //       });
  //     } catch (err) {
  //       if (err instanceof Prisma.PrismaClientKnownRequestError) {
  //         if (err.code === 'P2002') {
  //           // retry generating wallet number
  //           continue;
  //         }
  //       }

  //       // Unhandled errors -> rethrow
  //       throw err;
  //     }
  //   }
  // }

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
      wallet.id,
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

  webhookHandler(signature: string, body: any) {
    console.log(signature, body);
    /*
        Purpose: Receive transaction updates from Paystack.
        Security: Validate Paystack signature header (e.g. x-paystack-signature) using configured webhook secret.
        Steps:
          Verify signature.
          Parse event payload; find transaction reference.
          Update transaction status in DB (success, failed, pending, etc.).
        Response: 200
          {"status": true}
        Errors: 400 invalid signature, 500 server error
      */
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
