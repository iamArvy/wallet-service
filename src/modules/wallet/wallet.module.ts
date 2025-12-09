import { Module } from '@nestjs/common';
import { WalletService } from './services';
import { WalletController } from './controllers';
import { AuthModule } from '../auth/auth.module';
import { PaystackModule } from 'src/integrations/paystack/paystack.module';

@Module({
  imports: [AuthModule, PaystackModule],
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}
