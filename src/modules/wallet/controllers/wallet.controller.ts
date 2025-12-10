import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  // Headers,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { IJwtUser, IRequestWithUser } from 'src/common/types';
import { DepositRequestDto, TransferRequestDto } from '../dto';
import { WalletService } from '../services';
import { CombinedAuthGuard } from 'src/modules/auth/guards/combined.guard';
import {
  ApiKeyPermissions,
  ApiKeyPermissionsGuard,
} from 'src/modules/auth/guards/api-key-permission.guard';
import {
  PAYSTACK_WEBHOOK_SIGNATURE,
  type IPaystackWebhookInterface,
} from 'src/integrations/paystack';
import {
  DepositDocs,
  GetBalanceDocs,
  GetTransactionsDocs,
  PaystackWebhookDocs,
  StatusCheckDocs,
  TransferDocs,
} from '../docs';
import { API_PERMISSIONS } from 'src/common/enums';

@Controller('wallet')
export class WalletController {
  constructor(private readonly service: WalletService) {}

  @DepositDocs()
  @HttpCode(HttpStatus.CREATED)
  @ApiKeyPermissions(API_PERMISSIONS.DEPOSIT)
  @UseGuards(CombinedAuthGuard, ApiKeyPermissionsGuard)
  @Post('deposit')
  deposit(
    @Req() req: IRequestWithUser<IJwtUser>,
    @Body() { amount }: DepositRequestDto,
    @Headers('Idempotency-key') key: string,
  ) {
    return this.service.deposit(req.user, amount, key);
  }

  @GetTransactionsDocs()
  @HttpCode(HttpStatus.OK)
  @ApiKeyPermissions(API_PERMISSIONS.READ)
  @UseGuards(CombinedAuthGuard, ApiKeyPermissionsGuard)
  @Get('transactions')
  getTransactions(@Req() { user }: IRequestWithUser<IJwtUser>) {
    return this.service.getTransactions(user.id);
  }

  @PaystackWebhookDocs()
  @Post('paystack/webhook')
  paystackWebhookHandler(
    @Headers(PAYSTACK_WEBHOOK_SIGNATURE) signature: string,
    @Body() payload: IPaystackWebhookInterface,
  ) {
    return this.service.processPaystackWebhook(signature, payload);
  }

  @StatusCheckDocs()
  @HttpCode(HttpStatus.OK)
  @Get('deposit/:reference/status')
  statusCheck(@Param('reference') reference: string) {
    return this.service.statusCheck(reference);
  }

  @GetBalanceDocs()
  @ApiKeyPermissions(API_PERMISSIONS.READ)
  @UseGuards(CombinedAuthGuard, ApiKeyPermissionsGuard)
  @Get('balance')
  balance(@Req() { user }: IRequestWithUser<IJwtUser>) {
    return this.service.getBalance(user.id);
  }

  @TransferDocs()
  @ApiKeyPermissions(API_PERMISSIONS.TRANSFER)
  @UseGuards(CombinedAuthGuard, ApiKeyPermissionsGuard)
  @Post('transfer')
  transfer(
    @Req() { user }: IRequestWithUser<IJwtUser>,
    @Body() body: TransferRequestDto,
  ) {
    return this.service.transfer(user, body);
  }
}
