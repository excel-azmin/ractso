import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { userCommands, userHandlers } from './command';
import { UserController } from './controller/user.controller';
import { UserDetailsHandler } from './query/user-details/user-details.handler';
import { UserListHandler } from './query/user-list/user-list.handler';
import { UserService } from './service/user.service';

@Module({
  imports: [CqrsModule],
  controllers: [UserController],
  providers: [
    UserService,
    UserListHandler,
    UserDetailsHandler,
    ...userCommands,
    ...userHandlers,
  ],
  exports: [UserService],
})
export class UserModule {}
