import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserService } from '../../service/user.service';
import { GetUserDetailsQuery } from './user-details.query';

@QueryHandler(GetUserDetailsQuery)
export class UserDetailsHandler implements IQueryHandler<GetUserDetailsQuery> {
  constructor(private readonly userService: UserService) {}

  async execute(query: GetUserDetailsQuery): Promise<any> {
    const { id } = query;
    return this.userService.getUserById(id);
  }
}
