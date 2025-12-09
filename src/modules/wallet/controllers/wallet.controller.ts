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
} from '../dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JWTAuthGuard } from 'src/modules/auth/guards';
import { WalletService } from '../services';

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
  @UseGuards(JWTAuthGuard)
  @Post('deposit')
  deposit(
    @Req() req: IRequestWithUser<IJwtUser>,
    @Body() { amount }: DepositRequestDto,
    @Headers('Idempotency-key') key: string,
  ) {
    /*
    POST /wallet/deposit
    Auth:
    JWT
    API Key with deposit permission.
    {
      "amount": 5000
    }
    {
      "reference": "...",
      "authorization_url": "https://paystack.co/checkout/..."
    }
    */
    return this.service.deposit(req.user, amount, key);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all transactions' })
  @ApiOkResponse({
    description: 'Returns all transactions with filters',
    type: TransactionResponseDto,
    isArray: true,
  })
  @Get('transactions')
  getPayments() {
    return this.service.getTransactions();
  }

  // @Post('paystack/webhook')
  // paystackWebhookHandler(
  /**
   * @param id
   * @param refresh
   * @returns
   */
  // Purpose:
  // Receive transaction updates from Paystack.
  // Credit wallet only after webhook confirms success.
  // Security:
  // Validate Paystack signature.
  // Actions:
  // Verify signature.
  // Find transaction by reference.
  // Update:
  // transaction status
  // wallet balance
  // { "status": true }
  //   @Headers('x-paystack-signature') signature: string,
  //   @Body() body: any,
  // ) {
  //   return this.service.webhookHandler(signature, body);
  // }

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

  @Get('balance')
  balance() {
    return this.service.getBalance('user-id');
  }

  // @Post('transfer')
  // transfer(@Body() body: any) {}
}
