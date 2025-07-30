import { CurrentUser } from '@/common/shared/decorator/current-user.decorator';
import { Roles } from '@/common/shared/decorator/roles.decorator';
import { UserRole } from '@/common/shared/enum/user.enum';
import { ClerkAuthGuard } from '@/common/shared/guards/clerk-auth.guard';
import { AuthGuard } from '@/common/shared/guards/login-auth.guard';
import { RolesGuard } from '@/common/shared/guards/roles.guard';
import { User } from '@clerk/backend';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginCommand } from '../command/login/login.command';
import { LogoutCommand } from '../command/logout/logout.command';
import { RefreshTokenCommand } from '../command/refresh-token/refresh-token.command';
import { RegistrationCommand } from '../command/registration/registration.command';
import { LoginAuthDto } from '../dto/login-auth.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { RegistrationAuthDto } from '../dto/registration-auth.dto';
import { GetMeQuery } from '../query/get-me.query';

@Controller('v1/auth')
@ApiTags('Authorization')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @Get('clerk/sync')
  async authClerk(@CurrentUser() user: User) {
    console.log('Syncing user with backend...', user);
    return await this.commandBus.execute(new RegistrationCommand(user));
  }

  @Post('register')
  async register(@Body() createUser: RegistrationAuthDto) {
    return await this.commandBus.execute(new RegistrationCommand(createUser));
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginAuthDto) {
    return await this.commandBus.execute(new LoginCommand(loginUserDto));
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async logout(@CurrentUser() user: User, @Req() request: Request) {
    return await this.commandBus.execute(new LogoutCommand(user.id, request));
  }

  @Post('refresh-token')
  @UseGuards(RefreshTokenGuard)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.commandBus.execute(
      new RefreshTokenCommand(refreshTokenDto),
    );
  }

  @Get('me')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER)
  @ApiBearerAuth()
  async getMe(@CurrentUser() user: User) {
    return await this.queryBus.execute(new GetMeQuery(user.id));
  }
}
