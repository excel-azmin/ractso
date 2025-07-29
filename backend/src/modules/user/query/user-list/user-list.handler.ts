import { MAX_QUERY_LIMIT } from '@/common/constants/query-constants';
import { CustomError } from '@/common/shared/errors/custom-error';
import { PrismaService } from '@/common/shared/prisma/prisma.service';
import { USER_SAFE_FIELDS } from '@/common/shared/query-fields/query-fields.set';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserService } from '../../service/user.service';
import { GetUserListQuery } from './user-list.query';

@QueryHandler(GetUserListQuery)
export class UserListHandler implements IQueryHandler<GetUserListQuery> {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  private buildSelectFields(fields: string[]): Record<string, boolean> {
    const selection: Record<string, boolean> = {};
    for (const field of fields) {
      selection[field] = USER_SAFE_FIELDS.has(field);
    }
    return selection;
  }

  async execute(query: GetUserListQuery): Promise<any> {
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
    } = query.query;

    const parsedPage = Math.max(1, Number(page)) || 1;
    const parsedLimit =
      Math.max(1, Math.min(Number(limit), MAX_QUERY_LIMIT)) || 10;

    const where: Record<string, any> = {};

    if (fromDate && toDate) {
      where[dateField] = {
        gte: new Date(fromDate),
        lte: new Date(toDate),
      };
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Process field selection
    const requestedFields = select?.split(',') || filter?.split(',') || [];
    const finalSelect =
      requestedFields.length > 0
        ? this.buildSelectFields(requestedFields)
        : Object.fromEntries([...USER_SAFE_FIELDS].map((f) => [f, true]));

    try {
      const [users, totalCount] = await Promise.all([
        this.prismaService.user
          .findMany({
            where: Object.keys(where).length ? where : undefined,
            orderBy: { [sort]: order },
            select: finalSelect,
            skip: (parsedPage - 1) * parsedLimit,
            take: parsedLimit,
          })
          .then((users) => users.map(this.userService.sanitizeUser)),
        this.prismaService.user.count({
          where: Object.keys(where).length ? where : undefined,
        }),
      ]);

      // Calculate pagination flags
      const totalPages = Math.ceil(totalCount / parsedLimit);
      const hasNext = parsedPage < totalPages;
      const hasPrevious = parsedPage > 1;

      return {
        data: users,
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
