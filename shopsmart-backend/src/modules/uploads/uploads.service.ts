import fs from 'node:fs';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import { ValidationError } from '@shared/errors';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'custom-designs');

// Ensure directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/pjpeg', 'image/jfif'];
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export const uploadsService = {
  /**
   * Saves a base64 encoded image or buffer safely to disk.
   */
  async saveBase64Image(dataUriOrBase64: string): Promise<{ url: string; filename: string; size: number; mimeType: string }> {
    let mimeType = 'image/png';
    let base64Data = dataUriOrBase64;

    // Check for Data URI format: data:image/png;base64,...
    if (dataUriOrBase64.includes(';base64,')) {
      const parts = dataUriOrBase64.split(';base64,');
      const mimePart = parts[0].replace(/^data:/, '').trim().split(';')[0];
      if (mimePart) {
        mimeType = mimePart.toLowerCase();
      }
      base64Data = parts[1] || '';
    } else {
      const matches = dataUriOrBase64.match(/^data:([A-Za-z0-9-+./]+);base64,(.+)$/s);
      if (matches && matches.length === 3) {
        mimeType = matches[1].toLowerCase().split(';')[0];
        base64Data = matches[2];
      }
    }

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new ValidationError(`Invalid file type (${mimeType}). Only PNG, JPEG, and WebP are allowed.`);
    }

    // Clean any whitespace/newlines
    base64Data = base64Data.replace(/\s/g, '');

    const buffer = Buffer.from(base64Data, 'base64');
    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      throw new ValidationError('File size exceeds the 15MB limit.');
    }

    let extension = '.png';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg') || mimeType.includes('jfif') || mimeType.includes('pjpeg')) {
      extension = '.jpg';
    } else if (mimeType.includes('webp')) {
      extension = '.webp';
    }

    const filename = `asora-custom-${Date.now()}-${uuidv4().slice(0, 8)}${extension}`;
    await fs.promises.mkdir(UPLOAD_DIR, { recursive: true });
    const filePath = path.join(UPLOAD_DIR, filename);

    await fs.promises.writeFile(filePath, buffer);

    const publicUrl = `/uploads/custom-designs/${filename}`;
    return {
      url: publicUrl,
      filename,
      size: buffer.length,
      mimeType,
    };
  },
};
