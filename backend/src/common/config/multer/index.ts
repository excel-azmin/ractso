import { BadRequestException } from '@nestjs/common';
import { MulterModuleOptions } from '@nestjs/platform-express';
import type { Request } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';

interface MulterConfig {
  dest: string;
  mimeType: string[];
  maxSize: number;
  isOptional?: boolean;
}

// Multer configuration
export const getSingleUploadConfig = (config: MulterConfig) => {
  // destructure the config
  const { dest, mimeType, maxSize } = config;

  // return the multer config
  return {
    storage: diskStorage({
      destination: (_req, _file, callback) => {
        callback(null, dest);
      },
      filename: (_req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      },
    }),

    fileFilter(_req: Request, file: Express.Multer.File, callback: any) {
      if (!mimeType.includes(file.mimetype)) {
        return callback(
          new BadRequestException('Only image files are allowed!'),
          false,
        );
      }
      callback(null, true);
    },

    limits: {
      fileSize: maxSize,
    },
  };
};

/**
 * @description Config for uploading NOC
 * @returns {MulterModuleOptions}
 */

export const getMulterConfig = (config: MulterConfig): MulterModuleOptions => {
  // destructure the config
  const { dest, mimeType, maxSize, isOptional } = config;

  // return the multer config
  return {
    // storage
    storage: diskStorage({
      // destination is the folder where the file will be stored
      destination: (_req, _file, cb) => {
        cb(null, dest);
      },

      // filename is the name of the file in the storage
      filename: (_req, file, cb) => {
        const name = file.originalname.split('.')[0];
        const extension = file.originalname.split('.').pop();
        cb(null, `${name}-${Date.now()}.${extension}`);
      },
    }),

    // fileFilter is the function that filters the file
    fileFilter: (_req, file, cb) => {
      if (!file && isOptional) return cb(null, true);

      if (mimeType.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Please upload a valid file'), false);
      }
    },

    limits: {
      fileSize: maxSize,
    },
  };
};
