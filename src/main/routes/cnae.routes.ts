import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '@/main/middlewares/auth.middleware';
import { roleMiddleware } from '@/main/middlewares/role.middleware';
import { PrismaCnaeRepository } from '@/infra/db/prisma/cnae.repository';
import { CnaeApiService } from '@/infra/external/cnae-api.service';
import { DbListCnaes } from '@/data/usecases/cnae/db-list-cnaes.usecase';
import { env } from '@/main/config/env';

const router = Router();
const cnaeRepository = new PrismaCnaeRepository();
const cnaeApiService = new CnaeApiService(env.listaCnaeUrl, env.listaCnaeBearerToken);
const listCnaesUseCase = new DbListCnaes(cnaeRepository, cnaeApiService);

const codCnaeSchema = z.string().min(1, 'Código CNAE é obrigatório').regex(/^[0-9]+$/, 'Código CNAE deve conter apenas números');

const createCnaeSchema = z.object({
  codCnae: codCnaeSchema,
  descricaoCnae: z.string().min(1, 'Descrição é obrigatória'),
});

const updateCnaeSchema = createCnaeSchema.partial();

const importCnaeSchema = z.array(
  z.object({
    codCnae: codCnaeSchema,
    descricaoCnae: z.string().min(1),
  }),
).min(1, 'A lista não pode ser vazia');

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const search = req.query['search'] ? String(req.query['search']).trim() : undefined;
    const cnaes = await listCnaesUseCase.execute(search);
    return res.status(200).json(cnaes);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params['id'] as string;
    const cnae = await cnaeRepository.findById(id);
    if (!cnae) {
      return res.status(404).json({ error: 'CNAE não encontrado' });
    }
    return res.status(200).json(cnae);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/', authMiddleware, roleMiddleware(['OPERACIONAL', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const data = createCnaeSchema.parse(req.body);

    const existing = await cnaeRepository.findByCode(data.codCnae);
    if (existing) {
      return res.status(409).json({ error: 'Já existe um CNAE com este código' });
    }

    const cnae = await cnaeRepository.create(data);
    return res.status(201).json(cnae);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    return res.status(400).json({ error: error.message });
  }
});

router.post('/import', authMiddleware, roleMiddleware(['OPERACIONAL', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const data = importCnaeSchema.parse(req.body);
    const count = await cnaeRepository.createMany(data);
    return res.status(201).json({ imported: count });
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
    const data = updateCnaeSchema.parse(req.body);

    const cnae = await cnaeRepository.findById(id);
    if (!cnae) {
      return res.status(404).json({ error: 'CNAE não encontrado' });
    }

    if (data.codCnae && data.codCnae !== cnae.codCnae) {
      const existing = await cnaeRepository.findByCode(data.codCnae);
      if (existing) {
        return res.status(409).json({ error: 'Já existe um CNAE com este código' });
      }
    }

    const updated = await cnaeRepository.update(id, data);
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
    const cnae = await cnaeRepository.findById(id);
    if (!cnae) {
      return res.status(404).json({ error: 'CNAE não encontrado' });
    }

    await cnaeRepository.delete(id);
    return res.status(204).send();
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

export default router;
