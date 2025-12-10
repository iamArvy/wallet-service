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
import {
  DepositRequestDto,
  DepositResponseDto,
  TransactionResponseDto,
  TransactionStatusDto,
  TransferRequestDto,
} from '../dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { WalletService } from '../services';
import { CombinedAuthGuard } from 'src/modules/auth/guards/combined.guard';
import {
  ApiKeyPermissions,
  ApiKeyPermissionsGuard,
} from 'src/modules/auth/guards/api-key-permission.guard';
import type { IPaystackWebhookInterface } from 'src/integrations/paystack/interfaces/webhook.interface';

@Controller('wallet')
export class WalletController {
  constructor(private readonly service: WalletService) {}

  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Initialize a payment' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized user' })
  @ApiCreatedResponse({
    description: 'Payment Created',
    type: DepositResponseDto,
  })
  @ApiBearerAuth()
  @ApiKeyPermissions('deposit')
  @UseGuards(CombinedAuthGuard, ApiKeyPermissionsGuard)
  @ApiHeader({ name: 'x-api-key' })
  @Post('deposit')
  deposit(
    @Req() req: IRequestWithUser<IJwtUser>,
    @Body() { amount }: DepositRequestDto,
    @Headers('Idempotency-key') key: string,
  ) {
    return this.service.deposit(req.user, amount, key);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all transactions' })
  @ApiOkResponse({
    description: 'Returns all transactions with filters',
    type: TransactionResponseDto,
    isArray: true,
  })
  @ApiBearerAuth()
  @ApiKeyPermissions('read')
  @UseGuards(CombinedAuthGuard, ApiKeyPermissionsGuard)
  @ApiHeader({ name: 'x-api-key' })
  @Get('transactions')
  getPayments() {
    return this.service.getTransactions();
  }

  @Post('paystack/webhook')
  paystackWebhookHandler(
    @Headers('x-paystack-signature') signature: string,
    @Body() payload: IPaystackWebhookInterface,
  ) {
    return this.service.processPaystackWebhook(signature, payload);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check the status of a payment' })
  @ApiOkResponse({
    description: 'Returns the status of the payment',
    type: TransactionStatusDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
  })
  @Get('deposit/:reference/status')
  statusCheck(
    @Param('reference') reference: string,
    @Body('refresh') refresh: boolean,
  ) {
    return this.service.statusCheck(reference, refresh);
  }

  @ApiBearerAuth()
  @ApiKeyPermissions('read')
  @UseGuards(CombinedAuthGuard, ApiKeyPermissionsGuard)
  @ApiHeader({ name: 'x-api-key' })
  @Get('balance')
  balance(@Req() { user }: IRequestWithUser<IJwtUser>) {
    return this.service.getBalance(user.id);
  }

  @ApiBearerAuth()
  @ApiKeyPermissions('transfer')
  @UseGuards(CombinedAuthGuard, ApiKeyPermissionsGuard)
  @ApiHeader({ name: 'x-api-key' })
  @Post('transfer')
  transfer(
    @Req() { user }: IRequestWithUser<IJwtUser>,
    @Body() body: TransferRequestDto,
  ) {
    return this.service.transfer(user, body);
  }
}
