import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '@/main/middlewares/auth.middleware';
import { roleMiddleware } from '@/main/middlewares/role.middleware';
import { upload } from '@/main/config/multer';
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

      // URL do arquivo no Cloudinary
      const fileUrl = (req.file as any).path; // Cloudinary retorna a URL completa em 'path'

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

export default router;
