import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export interface IJwtConfig {
  secret: string;
}

export interface IAuthConfig {
  jwt: IAuthConfig;
}

export const authConfig = registerAs('auth', () => ({
  jwt: {
    secret: process.env.JWT_SECRET,
  },
}));

export const authValidation = Joi.object({
  JWT_SECRET: Joi.string().required(),
});
