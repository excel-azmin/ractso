import { MAX_QUERY_LIMIT } from '@/common/constants/query-constants';
import { CustomError } from '@/common/shared/errors/custom-error';
import { PrismaService } from '@/common/shared/prisma/prisma.service';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPostListQuery } from './post-list.query';

@QueryHandler(GetPostListQuery)
export class GetPostListHandler implements IQueryHandler<GetPostListQuery> {
  constructor(private readonly prismaService: PrismaService) {}

  private buildSelectFields(fields: string[]): Record<string, boolean> {
    const selection: Record<string, boolean> = {};
    for (const field of fields) {
      selection[field] = true;
    }
    return selection;
  }

  async execute(query: GetPostListQuery): Promise<any> {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      search,
      filter,
      select,
      fromDate,
      toDate,
      dateField = 'createdAt',
    } = query.pagination;

    const parsedPage = Math.max(1, Number(page)) || 1;
    const parsedLimit =
      Math.max(1, Math.min(Number(limit), MAX_QUERY_LIMIT)) || 10;

    const where: Record<string, any> = {};

    // Date filtering
    if (fromDate && toDate) {
      where[dateField] = {
        gte: new Date(fromDate),
        lte: new Date(toDate),
      };
    }

    // Search functionality
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Process field selection
    const requestedFields = select?.split(',') || filter?.split(',') || [];
    const finalSelect =
      requestedFields.length > 0
        ? this.buildSelectFields(requestedFields)
        : undefined; // Return all fields if none specified

    try {
      const [posts, totalCount] = await Promise.all([
        this.prismaService.post.findMany({
          where: Object.keys(where).length ? where : undefined,
          orderBy: { [sort]: order },
          select: finalSelect,
          skip: (parsedPage - 1) * parsedLimit,
          take: parsedLimit,
        }),
        this.prismaService.post.count({
          where: Object.keys(where).length ? where : undefined,
        }),
      ]);

      // Calculate pagination flags
      const totalPages = Math.ceil(totalCount / parsedLimit);
      const hasNext = parsedPage < totalPages;
      const hasPrevious = parsedPage > 1;

      return {
        data: posts,
        meta: {
          total: totalCount,
          page: parsedPage,
          limit: parsedLimit,
          totalPages,
          hasNext,
          hasPrevious,
        },
      };
    } catch (error) {
      throw new CustomError('Invalid query parameters', 400, {
        cause: error,
      });
    }
  }
}
