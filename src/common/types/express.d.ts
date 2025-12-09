import { IGoogleUser, IJwtUser } from '../modules/auth/types';

declare global {
  namespace Express {
    interface User extends IJwtUser, IGoogleUser {}
    interface Request {
      permissions?: string[];
    }
  }
}
