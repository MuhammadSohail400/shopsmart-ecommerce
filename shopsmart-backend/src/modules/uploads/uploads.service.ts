import fs from 'node:fs';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import { ValidationError } from '@shared/errors';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'custom-designs');

// Ensure directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const uploadsService = {
  /**
   * Saves a base64 encoded image or buffer safely to disk.
   */
  async saveBase64Image(dataUriOrBase64: string): Promise<{ url: string; filename: string; size: number; mimeType: string }> {
    let mimeType = 'image/png';
    let base64Data = dataUriOrBase64;

    // Check for Data URI format: data:image/png;base64,...
    const matches = dataUriOrBase64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      mimeType = matches[1].toLowerCase();
      base64Data = matches[2];
    }

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new ValidationError('Invalid file type. Only PNG, JPEG, and WebP are allowed.');
    }

    const buffer = Buffer.from(base64Data, 'base64');
    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      throw new ValidationError('File size exceeds the 10MB limit.');
    }

    let extension = '.png';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) extension = '.jpg';
    if (mimeType.includes('webp')) extension = '.webp';

    const filename = `asora-custom-${Date.now()}-${uuidv4().slice(0, 8)}${extension}`;
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
