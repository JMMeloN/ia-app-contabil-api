import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '@/main/middlewares/auth.middleware';
import { roleMiddleware } from '@/main/middlewares/role.middleware';
import { PrismaNbsRepository } from '@/infra/db/prisma/nbs.repository';

const router = Router();
const nbsRepository = new PrismaNbsRepository();

const createNbsSchema = z.object({
  nbs: z.string().min(1, 'Código NBS é obrigatório'),
  descricaoNbs: z.string().min(1, 'Descrição NBS é obrigatória'),
  psOnerosa: z.boolean().optional(),
  adqExterior: z.boolean().optional(),
  indop: z.string().min(1, 'INDOP é obrigatório'),
  localIncidencia: z.string().min(1, 'Local de incidência IBS é obrigatório'),
  cClassTrib: z.string().min(1, 'cClassTrib é obrigatório'),
  nomeClassTrib: z.string().min(1, 'Nome da classificação tributária é obrigatório'),
});

const updateNbsSchema = createNbsSchema.partial();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const nbs = await nbsRepository.findAll();
    return res.status(200).json(nbs);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params['id'] as string;
    const nbs = await nbsRepository.findById(id);
    if (!nbs) {
      return res.status(404).json({ error: 'Registro NBS não encontrado' });
    }
    return res.status(200).json(nbs);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/', authMiddleware, roleMiddleware(['OPERACIONAL', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const data = createNbsSchema.parse(req.body);

    const existing = await nbsRepository.findByCode(data.nbs);
    if (existing) {
      return res.status(409).json({ error: 'Já existe um registro com este código NBS' });
    }

    const nbs = await nbsRepository.create(data);
    return res.status(201).json(nbs);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    return res.status(400).json({ error: error.message });
  }
});

router.put('/:id', authMiddleware, roleMiddleware(['OPERACIONAL', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params['id'] as string;
    const data = updateNbsSchema.parse(req.body);

    const nbs = await nbsRepository.findById(id);
    if (!nbs) {
      return res.status(404).json({ error: 'Registro NBS não encontrado' });
    }

    if (data.nbs && data.nbs !== nbs.nbs) {
      const existing = await nbsRepository.findByCode(data.nbs);
      if (existing) {
        return res.status(409).json({ error: 'Já existe um registro com este código NBS' });
      }
    }

    const updated = await nbsRepository.update(id, data);
    return res.status(200).json(updated);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    return res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params['id'] as string;
    const nbs = await nbsRepository.findById(id);
    if (!nbs) {
      return res.status(404).json({ error: 'Registro NBS não encontrado' });
    }

    await nbsRepository.delete(id);
    return res.status(204).send();
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

export default router;
