import { VerifyOTPUserInfo } from '@/common/shared/types';
import { VerifyRegistrationAuthDto } from '../../dto/verify-registration-auth.dto';

export class VerifyRegistrationCommand {
  constructor(
    public readonly verifyRegistrationAuthDto: VerifyRegistrationAuthDto,
    public readonly user: VerifyOTPUserInfo,
  ) {}
}
