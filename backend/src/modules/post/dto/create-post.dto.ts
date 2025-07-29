// src/modules/post/dto/create-post.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @IsOptional()
  @IsString()
  authorId: string;

  @ApiPropertyOptional({
    description: 'The content/text of the post',
    example: 'This is my first post!',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  content?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Array of image files',
    required: false,
  })
  @IsOptional()
  files?: any;
}
