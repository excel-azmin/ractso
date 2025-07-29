import * as fs from 'fs';
import * as sharp from 'sharp';

export async function compressImage(
  path: string,
  mimetype: string,
): Promise<void> {
  const sharpInstance = sharp(path);

  let buffer: Buffer;
  if (mimetype === 'image/jpeg') {
    buffer = await sharpInstance.jpeg({ quality: 70 }).toBuffer();
  } else if (mimetype === 'image/png') {
    buffer = await sharpInstance.png({ compressionLevel: 8 }).toBuffer();
  } else {
    return;
  }

  await fs.promises.writeFile(path, buffer);
}
