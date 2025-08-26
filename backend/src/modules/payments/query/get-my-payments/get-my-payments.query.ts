import { BasePaginationDto } from '@/common/shared/base-classes/base.pagination';

export class GetMyPaymentsQuery {
  constructor(
    public readonly query: BasePaginationDto,
    public readonly userId: string,
  ) {}
}
