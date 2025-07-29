import { Injectable } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class ImageDeleteService {
  constructor() {}
  async deleteImage(imagePath: string): Promise<void> {
    try {
      const fullPath = join(process.cwd(), imagePath);
      await unlink(fullPath);
      console.log('Successfully deleted old image:', imagePath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Failed to delete old image:', error);
      }
    }
  }
  async deleteImageList(imagePaths: string[]): Promise<void> {
    for (const imagePath of imagePaths) {
      await this.deleteImage(imagePath);
    }
  }
}
