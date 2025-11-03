import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import {
  EnvConfigService,
  MAIL_HOST,
  MAIL_IGNORE_TLS,
  MAIL_PASSWORD,
  MAIL_PORT,
  MAIL_SECURE,
  MAIL_SENDER_NAME,
  MAIL_USER,
} from '../env/env-config.service';

const config = new EnvConfigService();

export function getDefaultMailConnectionConfig() {
  return {
    transport: {
      host: config.get(MAIL_HOST),
      port: config.get(MAIL_PORT),
      ignoreTLS: config.get(MAIL_IGNORE_TLS),
      secure: config.get(MAIL_SECURE),
      auth: {
        user: config.get(MAIL_USER),
        pass: config.get(MAIL_PASSWORD),
      },
    },
    defaults: {
      from: `${config.get(MAIL_SENDER_NAME)} <${config.get(MAIL_USER)}>`,
    },
    debug: true,
    template: {
      dir: process.cwd() + '/src/common/templates',
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true,
      },
    },
  };
}
