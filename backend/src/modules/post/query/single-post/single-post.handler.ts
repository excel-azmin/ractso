import { PrismaService } from '@/common/shared/prisma/prisma.service';
import { CommandHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetSinglePostQuery } from './single-post.query';

@CommandHandler(GetSinglePostQuery)
export class GetSinglePostHandler implements IQueryHandler<GetSinglePostQuery> {
  constructor(private readonly prismaService: PrismaService) {}
  async execute(query: GetSinglePostQuery): Promise<any> {
    const { postId } = query;
    return await this.prismaService.post.findUnique({
      where: { id: postId },
    });
  }
}
