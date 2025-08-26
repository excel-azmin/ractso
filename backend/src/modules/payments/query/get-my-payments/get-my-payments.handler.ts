import { MAX_QUERY_LIMIT } from '@/common/constants/query-constants';
import { CustomError } from '@/common/shared/errors/custom-error';
import { PrismaService } from '@/common/shared/prisma/prisma.service';
import { PAYMENTS_SAFE_FIELDS } from '@/common/shared/query-fields/query-fields.set';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMyPaymentsQuery } from './get-my-payments.query';

@QueryHandler(GetMyPaymentsQuery)
export class GetMyPaymentsHandler implements IQueryHandler<GetMyPaymentsQuery> {
  constructor(private readonly prismaService: PrismaService) {}

  private buildSelectFields(fields: string[]): Record<string, boolean> {
    const selection: Record<string, boolean> = {};
    for (const field of fields) {
      selection[field] = PAYMENTS_SAFE_FIELDS.has(field);
    }
    return selection;
  }

  async execute(query: GetMyPaymentsQuery) {
    const { userId } = query;
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
        { paymentType: { contains: search, mode: 'insensitive' } },
        { status: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Process field selection
    const requestedFields = select?.split(',') || filter?.split(',') || [];
    const finalSelect =
      requestedFields.length > 0
        ? this.buildSelectFields(requestedFields)
        : Object.fromEntries([...PAYMENTS_SAFE_FIELDS].map((f) => [f, true]));

    try {
      const [payments, totalCount] = await Promise.all([
        this.prismaService.payments.findMany({
          where: { userId: userId },
          orderBy: { [sort]: order },
          select: finalSelect,
          skip: (parsedPage - 1) * parsedLimit,
          take: parsedLimit,
        }),

        this.prismaService.payments.count({
          where: { userId: userId },
        }),
      ]);

      // Calculate pagination flags
      const totalPages = Math.ceil(totalCount / parsedLimit);
      const hasNext = parsedPage < totalPages;
      const hasPrevious = parsedPage > 1;

      return {
        data: payments,
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
