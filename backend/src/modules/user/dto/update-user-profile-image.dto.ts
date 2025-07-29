import { ApiProperty } from '@nestjs/swagger';

export default class UpdateUserProfileImageDto {
  @ApiProperty({
    description: 'The new profile image file',
    required: true,
    type: 'string',
    format: 'binary',
  })
  file: Express.Multer.File;
}
