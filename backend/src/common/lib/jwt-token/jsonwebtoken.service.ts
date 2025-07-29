import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Algorithm } from 'jsonwebtoken';

import {
  EnvConfigService,
  JWT_ALGORITHM,
  LOGIN_EXPIRES_IN,
  LOGIN_SECRET,
  REFRESH_EXPIRES_IN,
  REFRESH_SECRET,
  WEBHOOK_SECRET,
} from '@/common/config/env/env-config.service';
import {
  LoginTokenPayload,
  RefreshTokenPayload,
  RegistrationTokenPayloadSchema,
} from './types';

@Injectable()
export class JsonWebTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: EnvConfigService,
  ) {}

  async generateRegisterToken(payload: RegistrationTokenPayloadSchema) {
    const secret = this.configService.get(LOGIN_SECRET);
    const expiresIn = this.configService.get(LOGIN_EXPIRES_IN);
    const algorithm = this.configService.get(JWT_ALGORITHM) as Algorithm;
    return this.jwtService.sign(payload, { secret, expiresIn, algorithm });
  }

  async loginToken(payload: LoginTokenPayload) {
    const secret = this.configService.get(LOGIN_SECRET);
    const expiresIn = this.configService.get(LOGIN_EXPIRES_IN);
    const algorithm = this.configService.get(JWT_ALGORITHM) as Algorithm;
    return this.jwtService.sign(payload, { secret, expiresIn, algorithm });
  }

  async verifyLoginToken<T extends object>(token: string): Promise<T> {
    try {
      const secret = this.configService.get(LOGIN_SECRET);
      const payload = await this.jwtService.verifyAsync<T>(token, { secret });
      return payload;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async generateRefreshToken(email: string) {
    const secret = this.configService.get(REFRESH_SECRET);
    const expiresIn = this.configService.get(REFRESH_EXPIRES_IN);
    const algorithm = this.configService.get(JWT_ALGORITHM) as Algorithm;
    const payload: RefreshTokenPayload = { email };
    return this.jwtService.sign(payload, { secret, expiresIn, algorithm });
  }

  async verifyRefreshToken(token: string) {
    try {
      const secret = this.configService.get(REFRESH_SECRET);
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        token,
        { secret },
      );
      return payload;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async extractRefreshTokenEmail(token: string): Promise<string | null> {
    try {
      const payload = await this.verifyRefreshToken(token);
      return payload?.email || null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async generateWebhookToken(payload: Record<string, string>) {
    const secret = this.configService.get(WEBHOOK_SECRET);
    const algorithm = this.configService.get(JWT_ALGORITHM) as Algorithm;
    return this.jwtService.sign(payload, { secret, algorithm });
  }

  async verifyWebhookToken(token: string) {
    try {
      const secret = this.configService.get(WEBHOOK_SECRET);
      const payload = await this.jwtService.verifyAsync<Record<string, string>>(
        token,
        { secret },
      );
      return payload;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
