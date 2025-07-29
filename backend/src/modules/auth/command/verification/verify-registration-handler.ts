import { JsonWebTokenService } from '@/common/lib/jwt-token/jsonwebtoken.service';
import { RedisCacheService } from '@/common/shared/cache/redis-cache.service';
import { UserService } from '@/modules/user/service/user.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VerifyRegistrationCommand } from './verify-registration-command';

@CommandHandler(VerifyRegistrationCommand)
export class VerifyRegistrationHandler
  implements ICommandHandler<VerifyRegistrationCommand>
{
  constructor(
    private readonly jsonWebTokenService: JsonWebTokenService,
    private readonly redisCacheService: RedisCacheService,
    private readonly userService: UserService,
  ) {}
  async execute(command: VerifyRegistrationCommand): Promise<any> {
    // try {
    //   const { email } = command.user;
    //   const { otp } = command.verifyRegistrationAuthDto;
    //   const getVerifyingUser = await this.redisCacheService.getCacheValue(
    //     USER_REGISTRATION_CACHE_PREFIX,
    //     email,
    //   );
    //   if (!getVerifyingUser) {
    //     return {
    //       message: 'The registration process time has expired.',
    //       statusCode: 404,
    //     };
    //   }
    //   if (getVerifyingUser.otp !== otp) {
    //     return {
    //       message: 'Invalid OTP provided.',
    //       statusCode: 400,
    //     };
    //   }
    //   const user = await this.userService.createUser(getVerifyingUser);
    //   const [access_token, refreshToken] = await Promise.all([
    //     this.jsonWebTokenService.loginToken(getVerifyingUser),
    //     this.jsonWebTokenService.generateRefreshToken(getVerifyingUser),
    //   ]);
    //   return {
    //     message: 'OTP verified successfully. User registered.',
    //     statusCode: 200,
    //     access_token,
    //     refreshToken,
    //     user,
    //   };
    // } catch (error) {
    //   return error;
    // }
  }
}
