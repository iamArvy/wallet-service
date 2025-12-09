import { Module } from '@nestjs/common';
import { PaystackHttpClient } from 'src/integrations/paystack';
import { WalletService } from './services';
import { WalletController } from './controllers';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [WalletController],
  providers: [WalletService, PaystackHttpClient],
})
export class WalletModule {}
