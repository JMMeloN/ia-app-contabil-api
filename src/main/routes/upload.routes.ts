import { Router, Response, Request, NextFunction } from 'express';
import {
  authMiddleware,
  AuthRequest,
} from '@/main/middlewares/auth.middleware';
import { roleMiddleware } from '@/main/middlewares/role.middleware';
import { upload } from '@/main/config/multer';
import { makeUpdateRequestStatusUseCase } from '@/main/factories/request.factory';

const router = Router();

// Todas as rotas precisam de autenticação
router.use(authMiddleware);

// Helper para lidar com erros do multer (ex.: arquivo maior que o limite, formato inválido, etc.)
function multerSingle(field: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.single(field)(req, res, (err: any) => {
      if (err) {
        console.error('Multer error:', err);
        // Retorna status adequado para erro do multer
        return res
          .status(400)
          .json({ error: err.message || 'Erro no upload do arquivo' });
      }
      next();
    });
  };
}

// POST /upload/:requestId - Upload de nota fiscal (operacional e admin)
router.post(
  '/:requestId',
  roleMiddleware(['OPERACIONAL', 'ADMIN']),
  multerSingle('file'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
      }

      // Log do objeto file para depuração em produção
      console.info(
        'Upload received. req.file:',
        JSON.stringify(req.file, null, 2),
      );

      const { requestId } = req.params;
      const updateStatusUseCase = makeUpdateRequestStatusUseCase();

      // Tentar obter a URL retornada pelo Cloudinary em diferentes propriedades
      const fileAny = req.file as any;
      const fileUrl =
        fileAny?.path ||
        fileAny?.secure_url ||
        fileAny?.url ||
        fileAny?.location ||
        null;

      if (!fileUrl) {
        console.error(
          'Cloudinary did not return a file URL. req.file:',
          req.file,
        );
        return res
          .status(500)
          .json({
            error:
              'Upload realizado, porém URL do arquivo não foi retornada pelo provedor',
          });
      }

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
      console.error('Upload handler error:', error);
      return res
        .status(500)
        .json({ error: error.message || 'Erro interno ao processar upload' });
    }
  },
);

export default router;
