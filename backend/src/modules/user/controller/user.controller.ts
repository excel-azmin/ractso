import { BasePaginationDto } from '@/common/shared/base-classes/base.pagination';
import { UploadAvatar } from '@/common/shared/decorator/avatar.decorator';
import { Roles } from '@/common/shared/decorator/roles.decorator';
import { UserRole } from '@/common/shared/enum/user.enum';
import { RolesGuard } from '@/common/shared/guards/roles.guard';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateUserProfileImageCommand } from '../command/update-profile-image/update-user-profile-image.command';
import { UpdateUserProfileCommand } from '../command/update-user/update-user.command';
import { UpdateUserDto } from '../dto/update-user.dto';
import { GetUserDetailsQuery } from '../query/user-details/user-details.query';
import { GetUserListQuery } from '../query/user-list/user-list.query';

@Controller('v1/user')
@ApiBearerAuth()
export class UserController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('list')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  async getUserList(@Query() query: BasePaginationDto) {
    return this.queryBus.execute(new GetUserListQuery(query));
  }

  @Get(':id/details')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  async getUserDetails(@Param('id') id: string) {
    return this.queryBus.execute(new GetUserDetailsQuery(id));
  }

  @Patch(':id/profile')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER)
  async updateUserProfile(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.commandBus.execute(
      new UpdateUserProfileCommand(id, updateUserDto),
    );
  }

  @Patch('/profile-image')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER)
  @UploadAvatar()
  async updateUserProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.commandBus.execute(
      new UpdateUserProfileImageCommand(file, req.user.id),
    );
  }
}
