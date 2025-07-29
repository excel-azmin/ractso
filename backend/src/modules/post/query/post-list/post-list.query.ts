import { BasePaginationDto } from '@/common/shared/base-classes/base.pagination';

export class GetPostListQuery {
  constructor(public readonly pagination: BasePaginationDto) {}
}
