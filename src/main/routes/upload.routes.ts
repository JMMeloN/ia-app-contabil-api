import { Router, Request, Response } from 'express';
import path from 'path';
import { authMiddleware, AuthRequest } from '@/main/middlewares/auth.middleware';
import { roleMiddleware } from '@/main/middlewares/role.middleware';
import { upload, uploadsPath } from '@/main/config/multer';
import { makeUpdateRequestStatusUseCase } from '@/main/factories/request.factory';

const router = Router();

// Todas as rotas precisam de autenticação
router.use(authMiddleware);

// POST /upload/:requestId - Upload de nota fiscal (operacional e admin)
router.post(
  '/:requestId',
  roleMiddleware(['OPERACIONAL', 'ADMIN']),
  upload.single('file'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
      }

      const { requestId } = req.params;
      const updateStatusUseCase = makeUpdateRequestStatusUseCase();

      // Construir URL do arquivo
      const fileUrl = `${req.protocol}://${req.get('host')}/files/${req.file.filename}`;

      // Atualizar status da solicitação para PROCESSADA com o arquivo
      const request = await updateStatusUseCase.execute({
        requestId,
        status: 'PROCESSADA',
        arquivoUrl: fileUrl,
      });

      return res.status(200).json({
        message: 'Arquivo enviado com sucesso',
        request,
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
);

// GET /upload/files/:filename - Download de arquivo (autenticado)
router.get('/files/:filename', async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadsPath, filename);

    // Verificar se arquivo existe
    return res.download(filePath, (err) => {
      if (err) {
        return res.status(404).json({ error: 'Arquivo não encontrado' });
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
