import { CustomError } from '@/common/shared/errors/custom-error';
import { PrismaService } from '@/common/shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUserById(userId: string): Promise<any> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new CustomError('User not found', 404, 'UserNotFound');
    }

    return this.sanitizeUser(user);
  }

  sanitizeUser<T extends Record<string, any>>(
    user: T,
  ): Omit<T, 'password' | 'hashedRefreshToken'> {
    const userCopy = { ...user };
    delete userCopy.password;
    delete userCopy.hashedRefreshToken;
    return userCopy;
  }
}
