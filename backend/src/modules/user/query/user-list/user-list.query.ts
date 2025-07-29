import { BasePaginationDto } from '@/common/shared/base-classes/base.pagination';

export class GetUserListQuery {
  constructor(public readonly query: BasePaginationDto) {}
}
