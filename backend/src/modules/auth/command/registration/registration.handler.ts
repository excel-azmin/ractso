import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BcryptService } from '@/common/lib/bcrypt/bcypt.service';
import { CustomError } from '@/common/shared/errors/custom-error';
import { PrismaService } from '@/common/shared/prisma/prisma.service';
import { RegistrationCommand } from './registration.command';

@CommandHandler(RegistrationCommand)
export class RegistrationHandler
  implements ICommandHandler<RegistrationCommand>
{
  constructor(
    private readonly prismaService: PrismaService,
    private readonly bcryptService: BcryptService,
  ) {}
  async execute(command: RegistrationCommand): Promise<any> {
    const { firstName, lastName, email, password } =
      command.registrationAuthDto;

    const isExistingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (isExistingUser) {
      throw new CustomError('User already exists', 400, 'UserAlreadyExists');
    }

    const hashedPassword = await this.bcryptService.hash(password);

    const user = await this.prismaService.user.create({
      data: {
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        email,
        password: hashedPassword,
        username: email.split('@')[0],
        clerkId: `clerk_${Date.now()}`,
      },
    });

    if (!user) {
      throw new CustomError(
        'User registration failed',
        500,
        'RegistrationError',
      );
    }

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    };
  }
}
