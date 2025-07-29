import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'your-refresh-token',
    description:
      'The refresh token to be used for obtaining a new access token',
    required: true,
  })
  @IsString()
  refreshToken: string;
}
