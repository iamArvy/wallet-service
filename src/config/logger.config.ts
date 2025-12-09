import { registerAs } from '@nestjs/config';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import * as Joi from 'joi';

export interface LoggerConfig {
  winston: WinstonConfig;
}

export interface WinstonConfig {
  level: string;
  format: winston.Logform.Format;
  transports: winston.transport[];
}

export const loggerConfig = registerAs<LoggerConfig>('logger', () => ({
  winston: {
    level: process.env.LOG_LEVEL!,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json(),
    ),
    transports: [
      // Console logging
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          nestWinstonModuleUtilities.format.nestLike(), // Nest-style formatting
        ),
      }),
      // File logging for errors
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
      }),
      // File logging for all logs
      new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
  },
}));

export const loggerValidation = Joi.object({
  LOG_LEVEL: Joi.string().default('info'),
});
