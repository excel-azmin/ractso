import { PrismaService } from '@/common/shared/prisma/prisma.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserService } from '../../service/user.service';
import { UpdateUserProfileCommand } from './update-user.command';

@CommandHandler(UpdateUserProfileCommand)
export class UpdateUserProfileHandler
  implements ICommandHandler<UpdateUserProfileCommand>
{
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  async execute(command: UpdateUserProfileCommand): Promise<any> {
    const { id, updateUserDto } = command;
    const user = await this.prismaService.user.update({
      where: { id },
      data: updateUserDto,
    });
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    return await this.userService.sanitizeUser(user);
  }
}
