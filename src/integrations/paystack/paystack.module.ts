import { Module } from '@nestjs/common';
import { PaystackHttpClient } from './paystack.client';

@Module({
  providers: [PaystackHttpClient],
  exports: [PaystackHttpClient],
})
export class PaystackModule {}
