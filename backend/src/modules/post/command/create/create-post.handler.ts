import { PrismaService } from '@/common/shared/prisma/prisma.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostCommand } from './create-post.command';

@CommandHandler(CreatePostCommand)
export class CreatePostHandler implements ICommandHandler<CreatePostCommand> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(command: CreatePostCommand): Promise<any> {
    const { createPostDto, files, userId } = command;
    createPostDto.images = files.map((file) => file.path);
    createPostDto.authorId = userId;
    const post = await this.prismaService.post.create({
      data: {
        ...createPostDto,
      },
    });
    return post;
  }
}
