import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsStrongPassword } from 'class-validator';

export class LoginAuthDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address',
  })
  @IsString()
  email: string;

  @ApiProperty({ example: 'StrongPassword123!', description: 'Password' })
  @IsStrongPassword()
  password: string;
}
