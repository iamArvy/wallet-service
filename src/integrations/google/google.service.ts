import { ConfigService } from '@nestjs/config';
import {
  GOOGLE_ACCESS_TYPE,
  GOOGLE_CONFIG_NAME,
  GOOGLE_OAUTH_URL,
  GOOGLE_PROMPT,
  GOOGLE_RESPONSE_TYPE,
  GOOGLE_SCOPE,
} from './google.constants';
import { IGoogleConfig } from './google.config';
import qs from 'qs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleService {
  private configName = GOOGLE_CONFIG_NAME;
  private googleOauthURL = GOOGLE_OAUTH_URL;
  private responseType = GOOGLE_RESPONSE_TYPE;
  private scope = GOOGLE_SCOPE;
  private accessType = GOOGLE_ACCESS_TYPE;
  private prompt = GOOGLE_PROMPT;

  private clientId: string;
  private redirectUri: string;

  constructor(config: ConfigService) {
    const { clientId, redirectUri } = config.getOrThrow<IGoogleConfig>(
      this.configName,
    );
    this.clientId = clientId;
    this.redirectUri = redirectUri;
  }

  getAuthUrl() {
    return (
      this.googleOauthURL +
      '?' +
      qs.stringify({
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
        response_type: this.responseType,
        scope: this.scope.join(' '),
        access_type: this.accessType,
        prompt: this.prompt,
      })
    );
  }
}
