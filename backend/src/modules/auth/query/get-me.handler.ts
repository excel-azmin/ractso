import { UserService } from '@/modules/user/service/user.service';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMeQuery } from './get-me.query';

@QueryHandler(GetMeQuery)
export class GetMeHandler implements IQueryHandler<GetMeQuery> {
  constructor(private readonly userService: UserService) {}

  async execute(query: GetMeQuery): Promise<any> {
    const { userId } = query;
    return {
      data: await this.userService.getUserById(userId),
    };
  }
}
