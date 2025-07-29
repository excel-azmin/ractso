import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsStrongPassword } from 'class-validator';

export class RegistrationAuthDto {
  @ApiProperty({ example: 'John', description: 'First name of the user' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
  @IsString()
  @IsOptional()
  lastName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address',
  })
  @IsString()
  email: string;

  @ApiProperty({
    example: 'StrongPassword123!',
    description: 'Password',
    minLength: 8,
  })
  @IsStrongPassword()
  password: string;
}
