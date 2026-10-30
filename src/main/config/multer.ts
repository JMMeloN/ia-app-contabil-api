import multer, { StorageEngine } from 'multer';
import { Request } from 'express';
import type { UploadApiResponse } from 'cloudinary';
import cloudinary from './cloudinary';

const CLOUDINARY_FOLDER = 'notas-fiscais';

/**
 * Multer storage engine that streams the incoming file straight to Cloudinary.
 * Replaces `multer-storage-cloudinary`, which is pinned to the vulnerable
 * cloudinary 1.x SDK. It keeps the same contract the upload route relies on:
 * `file.path` receives the secure URL and `file.filename` the public id.
 */
class CloudinaryStorage implements StorageEngine {
  _handleFile(
    _req: Request,
    file: Express.Multer.File,
    cb: (error?: unknown, info?: Partial<Express.Multer.File>) => void,
  ): void {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: CLOUDINARY_FOLDER,
        public_id: `nota-${uniqueSuffix}`,
        resource_type: 'raw', // PDFs are not images
      },
      (error, result?: UploadApiResponse) => {
        if (error || !result) {
          return cb(error ?? new Error('Cloudinary upload failed'));
        }

        cb(null, {
          path: result.secure_url,
          filename: result.public_id,
          size: result.bytes,
        });
      },
    );

    file.stream.on('error', cb);
    file.stream.pipe(uploadStream);
  }

  _removeFile(
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null) => void,
  ): void {
    if (!file.filename) {
      return cb(null);
    }

    cloudinary.uploader
      .destroy(file.filename, { resource_type: 'raw' })
      .then(() => cb(null))
      .catch((error: Error) => cb(error));
  }
}

const storage = new CloudinaryStorage();

// Accept PDF files only
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos PDF são permitidos'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});
