import { AuthGuard } from '@nestjs/passport';
import { JWT_AUTH_STRATEGY } from 'src/common/constants';

export class JWTAuthGuard extends AuthGuard(JWT_AUTH_STRATEGY) {
  constructor() {
    super();
  }
}
