import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';
import { GOOGLE_CONFIG_NAME } from 'src/integrations/google';

export interface IGoogleConfig {
  clientId: string;
  secret: string;
  redirectUri: string;
}

export const googleConfig = registerAs(GOOGLE_CONFIG_NAME, () => ({
  clientId: process.env.GOOGLE_CLIENT_ID,
  secret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
}));

export const googleValidation = Joi.object({
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_REDIRECT_URI: Joi.string().uri().required(),
});
