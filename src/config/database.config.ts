import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const dbConfig = registerAs('db', () => ({
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}));

export const dbValidation = Joi.object({
  DATABASE_URL: Joi.string().uri().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
});

export type DBConfig = ReturnType<typeof dbConfig>;
