import { appConfig, appValidation } from './app.config';
import { authConfig, authValidation } from './auth.config';
import { dbConfig, dbValidation } from './database.config';
import { paystackConfig, paystackValidation } from './paystack.config';
import { loggerConfig, loggerValidation } from './logger.config';
import { googleConfig, googleValidation } from './google.config';

export const config = [
  appConfig,
  authConfig,
  dbConfig,
  loggerConfig,
  paystackConfig,
  googleConfig,
];

export const validationSchema = appValidation
  .concat(authValidation)
  .concat(dbValidation)
  .concat(loggerValidation)
  .concat(paystackValidation)
  .concat(googleValidation);
