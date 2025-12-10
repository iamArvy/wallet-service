import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';
import { JWT_CONFIG_NAME } from 'src/common/constants';

export interface IJwtConfig {
  secret: string;
}

export const jwtConfig = registerAs(JWT_CONFIG_NAME, () => ({
  secret: process.env.JWT_SECRET,
}));

export const jwtValidation = Joi.object({
  JWT_SECRET: Joi.string().required(),
});
