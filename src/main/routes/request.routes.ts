import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '@/main/middlewares/auth.middleware';
import { roleMiddleware } from '@/main/middlewares/role.middleware';
import {
  makeCreateRequestUseCase,
  makeListRequestsUseCase,
  makeGetRequestByIdUseCase,
  makeUpdateRequestStatusUseCase,
  makeCancelRequestUseCase,
} from '@/main/factories/request.factory';

const router = Router();

// Todas as rotas de solicitação precisam de autenticação
router.use(authMiddleware);

// Schemas de validação
const createRequestSchema = z.object({
  valor: z.number().positive('Valor deve ser positivo'),
  dataEmissao: z.string().transform((str) => new Date(str)),
  observacoes: z.string().optional(),
  companyId: z.string().uuid('ID da empresa inválido'),
});

const updateStatusSchema = z.object({
  status: z.enum(['PENDENTE', 'PROCESSADA', 'CANCELADA']),
  arquivoUrl: z.string().url().optional(),
});

// GET /requests - Listar solicitações
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const listRequestsUseCase = makeListRequestsUseCase();
    const { status } = req.query;

    // Se for cliente, só pode ver suas próprias solicitações
    const filters =
      req.user!.role === 'CLIENTE'
        ? { userId: req.user!.userId, ...(status && { status: status as any }) }
        : { ...(status && { status: status as any }) };

    const requests = await listRequestsUseCase.execute(filters);

    return res.status(200).json(requests);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /requests/:id - Buscar solicitação por ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const getRequestByIdUseCase = makeGetRequestByIdUseCase();

    // Se for cliente, só pode ver suas próprias solicitações
    const userId = req.user!.role === 'CLIENTE' ? req.user!.userId : undefined;

    const request = await getRequestByIdUseCase.execute(id, userId);

    return res.status(200).json(request);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

// POST /requests - Criar solicitação (apenas clientes)
router.post('/', roleMiddleware(['CLIENTE']), async (req: AuthRequest, res: Response) => {
  try {
    const data = createRequestSchema.parse(req.body);
    const createRequestUseCase = makeCreateRequestUseCase();
    const request = await createRequestUseCase.execute({
      ...data,
      userId: req.user!.userId,
    });

    return res.status(201).json(request);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    return res.status(400).json({ error: error.message });
  }
});

// PATCH /requests/:id/status - Atualizar status (operacional e admin)
router.patch(
  '/:id/status',
  roleMiddleware(['OPERACIONAL', 'ADMIN']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const data = updateStatusSchema.parse(req.body);
      const updateStatusUseCase = makeUpdateRequestStatusUseCase();
      const request = await updateStatusUseCase.execute({
        requestId: id,
        ...data,
      });

      return res.status(200).json(request);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      }
      return res.status(400).json({ error: error.message });
    }
  }
);

// DELETE /requests/:id/cancel - Cancelar solicitação (apenas o próprio cliente)
router.delete('/:id/cancel', roleMiddleware(['CLIENTE']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const cancelRequestUseCase = makeCancelRequestUseCase();
    const request = await cancelRequestUseCase.execute({
      requestId: id,
      userId: req.user!.userId,
    });

    return res.status(200).json(request);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

export default router;
