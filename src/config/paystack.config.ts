import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';
import { PAYSTACK_CONFIG_NAME } from 'src/integrations/paystack';

export interface IPaystackConfig {
  secret: string;
}

export const paystackConfig = registerAs(PAYSTACK_CONFIG_NAME, () => ({
  secret: process.env.PAYSTACK_SECRET_KEY,
}));

export const paystackValidation = Joi.object({
  PAYSTACK_SECRET_KEY: Joi.string().required(),
});
