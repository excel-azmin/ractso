import { getMulterConfig } from '@/common/config/multer';
import UpdateUserProfileImageDto from '@/modules/user/dto/update-user-profile-image.dto';
import { UseInterceptors, applyDecorators } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

export function UploadAvatar() {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor(
        'file',
        getMulterConfig({
          dest: 'uploads/avatar',
          mimeType: ['image/jpeg', 'image/png'],
          maxSize: 1024 * 1024 * 5,
        }),
      ),
    ),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      type: UpdateUserProfileImageDto,
      description: 'file upload',
    }),
  );
}
