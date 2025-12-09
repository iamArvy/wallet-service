import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export interface IJwtConfig {
  secret: string;
}

export interface IGoogleConfig {
  clientId: string;
  secret: string;
  redirectUri: string;
}

export interface IAuthConfig {
  jwt: IAuthConfig;
}

export const authConfig = registerAs('auth', () => ({
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    secret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
}));

export const authValidation = Joi.object({
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_REDIRECT_URI: Joi.string().uri().required(),

  JWT_SECRET: Joi.string().required(),
});
