export interface OAuthTokenError {
  name: string;
  message: string;
  code?: string;
  status?: number;
  oauthError?: {
    data?: string;
  };
}

export interface OAuthInfo {
  message?: string;
}

export interface IGoogleProfile {
  id: string;
  emails: { value: string }[];
  name: { givenName: string; familyName: string };
  photos: { value: string }[];
  _json: {
    sub: string;
    given_name: string;
    family_name: string;
    picture: string;
    email: string;
    email_verified: boolean;
  };
}
