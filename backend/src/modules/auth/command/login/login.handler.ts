import { BcryptService } from '@/common/lib/bcrypt/bcypt.service';
import { JsonWebTokenService } from '@/common/lib/jwt-token/jsonwebtoken.service';
import { PrismaService } from '@/common/shared/prisma/prisma.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand } from './login.command';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly jsonWebTokenService: JsonWebTokenService,
    private readonly prismaService: PrismaService,
    private readonly bcryptService: BcryptService,
  ) {}
  async execute(command: LoginCommand): Promise<any> {
    const { email, password } = command.loginAuthDto;

    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await this.bcryptService.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    const [access_token, refresh_token] = await Promise.all([
      this.jsonWebTokenService.loginToken({ id: user.id }),
      this.jsonWebTokenService.generateRefreshToken(user.email),
    ]);

    const hashedRefreshToken = await this.bcryptService.hash(refresh_token);

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { hashedRefreshToken },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roles: user.roles,
      },
      access_token,
      refresh_token,
    };
  }
}
