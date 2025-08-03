import { PrismaService } from '@/common/shared/prisma/prisma.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostCommand } from './create-post.command';

@CommandHandler(CreatePostCommand)
export class CreatePostHandler implements ICommandHandler<CreatePostCommand> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(command: CreatePostCommand): Promise<any> {
    const { createPostDto, files, userId } = command;
    // Need files validation if files exist then it will process
    if (files && files.length > 0) {
      createPostDto.images = files.map((file) => file.path);
    }

    createPostDto.authorId = userId;
    const { files: _, ...postData } = createPostDto;
    const post = await this.prismaService.post.create({
      data: {
        ...postData,
      },
    });
    return post;
  }
}
