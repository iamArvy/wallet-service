import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export interface IAppConfig {
  env: 'development' | 'staging' | 'production' | 'test';
  port: number;
  isDev: boolean;
  name: string;
  slug: string;
  host: string;
  url: string;
  prefix?: string;
  version: string;
  description?: string;
}

export const appConfig = registerAs('app', () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT!, 10) || 3000,
  isDev: ['development', 'dev', 'local', undefined].includes(
    process.env.NODE_ENV,
  ),
  name: process.env.APP_NAME!,
  slug: process.env.APP_SLUG,
  host: process.env.APP_HOST || 'localhost',
  url: process.env.APP_URL || 'http://localhost:3000',
  prefix: process.env.APP_PREFIX,
  version: process.env.APP_VERSION || 'v1',
  description: process.env.APP_DESCRIPTION,
}));

export const appValidation = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'staging', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  APP_NAME: Joi.string().default('Nest Application'),
  APP_SLUG: Joi.string().default('nest-application'),
  APP_HOST: Joi.string().default('localhost'),
  APP_URL: Joi.string().uri().default('http://localhost:3000'),
  APP_PREFIX: Joi.string().allow('').optional(),
  APP_VERSION: Joi.string().default('v1'),
  APP_DESCRIPTION: Joi.string().allow('').optional(),
});
