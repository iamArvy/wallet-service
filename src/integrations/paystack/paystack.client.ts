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
import { createHmac, timingSafeEqual } from 'crypto';
import {
  IInitializePaymentResponse,
  IPaystackWebhookInterface,
  IVerifyPaymentResponse,
} from './interfaces';

import * as sysMsg from 'src/common/system-messages';
import { IPaystackConfig } from 'src/config';
import {
  PAYSTACK_BASE_URL,
  PAYSTACK_CONFIG_NAME,
  PAYSTACK_DIGEST_ENCODING,
  PAYSTACK_WEBHOOK_ALGORITHM,
} from './paystack.constants';

@Injectable()
export class PaystackHttpClient {
  protected axiosClient: AxiosInstance;
  private readonly logger: Logger;
  private baseUrl = PAYSTACK_BASE_URL;
  private secret: string;
  private readonly weebhookAlgorithm = PAYSTACK_WEBHOOK_ALGORITHM;
  private readonly digestEncoding = PAYSTACK_DIGEST_ENCODING;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) baseLogger: Logger,
    config: ConfigService,
  ) {
    this.logger = baseLogger.child({ context: PaystackHttpClient.name });
    const { secret } = config.getOrThrow<IPaystackConfig>(PAYSTACK_CONFIG_NAME);
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
      throw new ServiceUnavailableException(sysMsg.PAYSTACK_NOT_CONFIGURED);
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
    const hash = createHmac(this.weebhookAlgorithm, this.secret)
      .update(JSON.stringify(payload))
      .digest(this.digestEncoding);
    return (
      hash &&
      signature &&
      timingSafeEqual(Buffer.from(hash), Buffer.from(signature))
    );
  }
}
