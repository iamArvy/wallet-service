import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export interface IPaystackConfig {
  secret: string;
}

export const paymentConfig = registerAs('payment', () => ({
  paystack: {
    secret: process.env.PAYSTACK_SECRET_KEY,
  },
}));

export const paymentValidation = Joi.object({
  PAYSTACK_SECRET_KEY: Joi.string().required(),
});
