import { Injectable, Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as Joi from 'joi';

export interface EnvConfig {
  [prop: string]: string;
}

export const NODE_ENV = 'NODE_ENV';
export const DATABASE_URL = 'DATABASE_URL';
export const JWT_ALGORITHM = 'JWT_ALGORITHM';
export const JWT_SECRET = 'JWT_SECRET';
export const JWT_EXPIRES_IN = 'JWT_EXPIRES_IN';
export const LOGIN_EXPIRES_IN = 'LOGIN_EXPIRES_IN';
export const REFRESH_SECRET = 'REFRESH_SECRET';
export const REFRESH_EXPIRES_IN = 'REFRESH_EXPIRES_IN';
export const LOGIN_SECRET = 'LOGIN_SECRET';
export const WEBHOOK_SECRET = 'WEBHOOK_SECRET';
export const REDIS_HOST = 'REDIS_HOST';
export const REDIS_PORT = 'REDIS_PORT';
export const CLERK_PUBLISHABLE_KEY = 'CLERK_PUBLISHABLE_KEY';
export const CLERK_SECRET_KEY = 'CLERK_SECRET_KEY';
export const MAIL_HOST = 'MAIL_HOST';
export const MAIL_PORT = 'MAIL_PORT';
export const MAIL_SECURE = 'MAIL_SECURE';
export const MAIL_IGNORE_TLS = 'MAIL_IGNORE_TLS';
export const MAIL_USER = 'MAIL_USER';
export const MAIL_PASSWORD = 'MAIL_PASS';
export const MAIL_SENDER_NAME = 'MAIL_SENDER_NAME';

@Injectable()
export class EnvConfigService {
  private readonly envConfig: EnvConfig;

  constructor() {
    const config = dotenv.config().parsed;
    this.envConfig = this.validateInput(config);
  }

  /**
   * Ensures all needed variables are set, and returns the validated JavaScript object
   * including the applied default values.
   */
  private validateInput(envConfig: EnvConfig): EnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      NODE_ENV: Joi.string()
        .valid('development', 'production', 'test', 'provision', 'staging')
        .default('development'),
      DATABASE_URL: Joi.string().required(),
      JWT_ALGORITHM: Joi.string()
        .valid('HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512')
        .default('HS256'),
      JWT_SECRET: Joi.string().required(),
      JWT_EXPIRES_IN: Joi.string().default('1h'),
      LOGIN_SECRET: Joi.string().required(),
      LOGIN_EXPIRES_IN: Joi.string().default('15m'),
      REFRESH_SECRET: Joi.string().required(),
      REFRESH_EXPIRES_IN: Joi.string().default('7d'),
      WEBHOOK_SECRET: Joi.string().required(),
      REDIS_HOST: Joi.string().required(),
      REDIS_PORT: Joi.number().required(),
      CLERK_PUBLISHABLE_KEY: Joi.string().required(),
      CLERK_SECRET_KEY: Joi.string().required(),
      MAIL_HOST: Joi.string().required(),
      MAIL_PORT: Joi.number().required(),
      MAIL_SECURE: Joi.boolean().default(true),
      MAIL_IGNORE_TLS: Joi.boolean().default(false),
      MAIL_USER: Joi.string().required(),
      MAIL_PASSWORD: Joi.string().required(),
      MAIL_SENDER_NAME: Joi.string().required(),
    });

    const { error, value: validatedEnvConfig } =
      envVarsSchema.validate(envConfig);
    if (error) {
      Logger.error(error, error.stack, this.constructor.name);
      process.exit(1);
    }
    return validatedEnvConfig;
  }

  get(key: string): string {
    switch (key) {
      case DATABASE_URL:
        return process.env.NODE_ENV === 'test'
          ? `test_${this.envConfig[key]}`
          : this.envConfig[key];
      default:
        return this.envConfig[key];
    }
  }
}
