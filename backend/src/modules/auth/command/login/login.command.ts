import { LoginAuthDto } from '../../dto/login-auth.dto';

export class LoginCommand {
  constructor(public readonly loginAuthDto: LoginAuthDto) {}
}
