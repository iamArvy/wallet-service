import { appConfig, appValidation } from './app.config';
import { jwtConfig, jwtValidation } from './jwt.config';
import { dbConfig, dbValidation } from './database.config';
import { paystackConfig, paystackValidation } from './paystack.config';
import { loggerConfig, loggerValidation } from './logger.config';
import { googleConfig, googleValidation } from './google.config';

export const config = [
  appConfig,
  jwtConfig,
  dbConfig,
  loggerConfig,
  paystackConfig,
  googleConfig,
];

export const validationSchema = appValidation
  .concat(jwtValidation)
  .concat(dbValidation)
  .concat(loggerValidation)
  .concat(paystackValidation)
  .concat(googleValidation);
