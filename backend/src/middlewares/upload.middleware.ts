import multer from 'multer';
import { BadRequestError } from '../utils/errors.js';

const storage = multer.memoryStorage();

export const uploadCoverImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new BadRequestError('Only image files (JPEG, PNG, WEBP, etc.) are permitted'));
    }
  },
});

export const uploadResourceDocument = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per document
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeSubstrings = [
      'pdf',
      'document',
      'word',
      'presentation',
      'powerpoint',
      'sheet',
      'excel',
      'text',
      'zip',
      'rar',
      'tar',
      'image',
      'octet-stream',
    ];

    const isAllowed = allowedMimeSubstrings.some((term) =>
      file.mimetype.toLowerCase().includes(term)
    );

    if (isAllowed || file.originalname.match(/\.(pdf|docx?|pptx?|xlsx?|txt|zip|rar|jpg|jpeg|png)$/i)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestError(
          'Supported document formats: PDF, Word, PowerPoint, Excel, Text, Zip, or Image (max 10MB)'
        )
      );
    }
  },
});
