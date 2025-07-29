import { ImageDeleteService } from '@/common/lib/image/image-delete.service';
import { CustomError } from '@/common/shared/errors/custom-error';
import { PrismaService } from '@/common/shared/prisma/prisma.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePostCommand } from './update-post.command';

@CommandHandler(UpdatePostCommand)
export class UpdatePostHandler implements ICommandHandler<UpdatePostCommand> {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly imageDeleteService: ImageDeleteService,
  ) {}
  async execute(command: UpdatePostCommand): Promise<any> {
    const { id, updatePostDto, userId } = command;
    const { images } = updatePostDto;

    images && (await this.imageDeleteService.deleteImageList(images));

    const response = await this.prismaService.post.update({
      where: { id, authorId: userId },
      data: {
        ...updatePostDto,
      },
    });

    if (!response) {
      throw new CustomError(
        'Post not found or you do not have permission to update this post.',
        404,
        'PostNotFoundError',
      );
    }
    return response;
  }
}
