import {
  Injectable,
  ServiceUnavailableException,
  HttpException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { IPaystackConfig } from 'src/config';
import {
  IVerifyPaymentResponse,
  IInitializePaymentResponse,
} from './interfaces';
import { createHmac, timingSafeEqual } from 'crypto';
import { IPaystackWebhookInterface } from './interfaces/webhook.interface';

@Injectable()
export class PaystackHttpClient {
  protected axiosClient: AxiosInstance;
  private readonly logger: Logger;
  private baseUrl = 'https://api.paystack.co';
  private secret: string;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) baseLogger: Logger,
    config: ConfigService,
  ) {
    this.logger = baseLogger.child({ context: PaystackHttpClient.name });
    const { secret } = config.getOrThrow<IPaystackConfig>('payment.paystack');
    this.secret = secret;

    this.axiosClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 8000,
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
    });

    // Automatically transform errors
    this.axiosClient.interceptors.response.use(
      (response) => response,
      (error) => this.handleError(error),
    );
  }

  /**
   * Generic request handler for Paystack APIs
   */
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    if (!this.axiosClient.defaults.headers.Authorization) {
      throw new ServiceUnavailableException('Paystack not configured');
    }

    const res = await this.axiosClient.request<T>(config);
    return res.data;
  }

  /**
   * Convert Axios errors → proper NestJS errors
   */
  private handleError(error: AxiosError): never {
    const status = error.response?.status ?? 500;

    const upstream = error.response?.data;

    const payload =
      upstream && typeof upstream === 'object'
        ? upstream
        : { message: error.message };

    this.logger.error(`[Paystack] ${status} → ${JSON.stringify(payload)}`);

    throw new HttpException(payload, status);
  }

  async initializePayment(email: string, amount: number) {
    const response = await this.request<IInitializePaymentResponse>({
      method: 'POST',
      url: '/transaction/initialize',
      data: { email, amount },
    });

    return response.data;
  }

  async verifyPayment(reference: string) {
    const response = await this.request<IVerifyPaymentResponse>({
      method: 'GET',
      url: 'transaction/verify/' + reference,
    });

    return response.data;
  }

  validateWebhookEvent(signature: string, payload: IPaystackWebhookInterface) {
    const hash = createHmac('sha512', this.secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    return (
      hash &&
      signature &&
      timingSafeEqual(Buffer.from(hash), Buffer.from(signature))
    );
  }
}
