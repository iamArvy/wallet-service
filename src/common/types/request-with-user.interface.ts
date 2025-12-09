import { Request } from 'express';

export interface IGoogleUser {
  sub: string;
  email: string;
  given_name: string;
  family_name: string;
  picture: string;
  email_verified: boolean;
}

export interface IJwtUser {
  id: string;
  email: string;
}

export interface IRequestWithUser<
  T extends Express.User | undefined = Express.User,
> extends Request {
  user: T;
  apiKeyPermissions: string[];
}
