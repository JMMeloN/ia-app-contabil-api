import multer from 'multer';
import { Request } from 'express';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary';

// Configuração do storage com Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'notas-fiscais', // Pasta no Cloudinary
    allowed_formats: ['pdf'], // Apenas PDFs
    resource_type: 'raw', // Para arquivos não-imagem (PDFs)
    public_id: (req: Request, file: Express.Multer.File) => {
      // Gerar nome único: nota-timestamp-randomstring
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      return `nota-${uniqueSuffix}`;
    },
  } as any,
});

// Filtro para aceitar apenas PDFs
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos PDF são permitidos'));
  }
};

// Configuração do multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});
