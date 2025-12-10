import { appConfig, appValidation } from './app.config';
import { authConfig, authValidation } from './auth.config';
import { dbConfig, dbValidation } from './database.config';
import { paymentConfig, paymentValidation } from './payment.config';
import { loggerConfig, loggerValidation } from './logger.config';
import { googleConfig, googleValidation } from 'src/integrations/google';

export const config = [
  appConfig,
  authConfig,
  dbConfig,
  loggerConfig,
  paymentConfig,
  googleConfig,
];

export const validationSchema = appValidation
  .concat(authValidation)
  .concat(dbValidation)
  .concat(loggerValidation)
  .concat(paymentValidation)
  .concat(googleValidation);
