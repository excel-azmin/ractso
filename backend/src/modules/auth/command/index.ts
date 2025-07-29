import { LoginCommand } from './login/login.command';
import { LoginHandler } from './login/login.handler';
import { LogoutCommand } from './logout/logout.command';
import { LogoutHandler } from './logout/logout.handler';
import { RefreshTokenCommand } from './refresh-token/refresh-token.command';
import { RefreshTokenHandler } from './refresh-token/refresh-token.handler';
import { RegistrationCommand } from './registration/registration.command';
import { RegistrationHandler } from './registration/registration.handler';
import { VerifyRegistrationHandler } from './verification/verify-registration-handler';

export const authCommands = [
  RegistrationCommand,
  LoginCommand,
  LogoutCommand,
  RefreshTokenCommand,
];

export const authHandlers = [
  LoginHandler,
  RegistrationHandler,
  VerifyRegistrationHandler,
  LogoutHandler,
  RefreshTokenHandler,
];
