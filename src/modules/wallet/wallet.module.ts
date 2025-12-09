import { Module } from '@nestjs/common';
import { PaystackHttpClient } from 'src/integrations/paystack';
import { WalletService } from './services';
import { WalletController } from './controllers';

@Module({
  controllers: [WalletController],
  providers: [WalletService, PaystackHttpClient],
})
export class WalletModule {}
