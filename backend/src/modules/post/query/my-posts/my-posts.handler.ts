import { PrismaService } from '@/common/shared/prisma/prisma.service';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMyPostsQuery } from './my-posts.query';

@QueryHandler(GetMyPostsQuery)
export class GetMyPostsHandler implements IQueryHandler<GetMyPostsQuery> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(query: GetMyPostsQuery): Promise<any> {
    const { userId } = query;
    return await this.prismaService.post.findMany({
      where: { authorId: userId },
    });
  }
}
