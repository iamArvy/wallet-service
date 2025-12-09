import {
  Injectable,
  PipeTransform,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Request } from 'express';
import { IPaystackConfig } from 'src/config';

export interface RawBodyRequest extends Request {
  rawBody?: Buffer; // or string if you store it as string
}

@Injectable()
export class PaystackWebhookPipe implements PipeTransform {
  private readonly secret: string;
  constructor(config: ConfigService) {
    const { secret } = config.getOrThrow<IPaystackConfig>('payment.paystack');
    this.secret = secret;
  }

  transform(req: RawBodyRequest) {
    const signature = req.headers['x-paystack-signature'];
    if (!signature) {
      throw new UnauthorizedException('Missing Paystack signature');
    }

    // Paystack needs raw body for hashing
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new UnauthorizedException('Missing raw body for signature check');
    }

    const expectedSignature = crypto
      .createHmac('sha512', this.secret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new UnauthorizedException('Invalid Paystack signature');
    }

    // return parsed body (Nest already parsed it)
    return req.body;
  }
}
