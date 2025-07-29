import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifyRegistrationAuthDto {
  @ApiProperty({ example: '656963', description: 'User registration otp' })
  @IsString()
  otp: string;
}
