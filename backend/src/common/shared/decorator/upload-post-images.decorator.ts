// src/modules/post/decorators/upload-post-images.decorator.ts
import { getMulterConfig } from '@/common/config/multer';
import { CreatePostDto } from '@/modules/post/dto/create-post.dto';
import { UseInterceptors, applyDecorators } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

export function UploadPostImages() {
  return applyDecorators(
    UseInterceptors(
      FilesInterceptor(
        'files', // field name for the files array
        null, // maxCount - set to null for unlimited
        getMulterConfig({
          dest: 'uploads/posts',
          mimeType: ['image/jpeg', 'image/png', 'image/webp'],
          maxSize: 1024 * 1024 * 5, // 5MB per file
        }),
      ),
    ),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: 'Post creation with multiple images',
      type: CreatePostDto,
    }),
  );
}
