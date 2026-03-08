import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '@/main/middlewares/auth.middleware';
import { PrismaPayerRepository } from '@/infra/db/prisma/payer.repository';

const router = Router();
const payerRepository = new PrismaPayerRepository();

router.use(authMiddleware);

const createPayerSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  document: z.string().min(11, 'Documento inválido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
});

const updatePayerSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório').optional(),
  document: z.string().min(11, 'Documento inválido').optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
});

function normalizeDocument(document: string): string {
  return document.replace(/\D/g, '');
}

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const payers = await payerRepository.findByUserId(req.user!.userId);
    return res.status(200).json(payers);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = createPayerSchema.parse(req.body);
    const document = normalizeDocument(data.document);
    const existing = await payerRepository.findByUserIdAndDocument(req.user!.userId, document);
    if (existing) {
      return res.status(409).json({ error: 'Tomador já cadastrado para este usuário' });
    }

    const payer = await payerRepository.create({
      name: data.name,
      document,
      email: data.email || undefined,
      userId: req.user!.userId,
    });

    return res.status(201).json(payer);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    return res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = updatePayerSchema.parse(req.body);

    const payer = await payerRepository.findById(id);
    if (!payer || payer.userId !== req.user!.userId) {
      return res.status(404).json({ error: 'Tomador não encontrado' });
    }

    const nextDocument = data.document ? normalizeDocument(data.document) : undefined;
    if (nextDocument && nextDocument !== payer.document) {
      const existing = await payerRepository.findByUserIdAndDocument(req.user!.userId, nextDocument);
      if (existing) {
        return res.status(409).json({ error: 'Já existe tomador com este documento' });
      }
    }

    const updated = await payerRepository.update(id, {
      name: data.name,
      document: nextDocument,
      email: data.email,
    });

    return res.status(200).json(updated);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    return res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const payer = await payerRepository.findById(id);
    if (!payer || payer.userId !== req.user!.userId) {
      return res.status(404).json({ error: 'Tomador não encontrado' });
    }

    await payerRepository.delete(id);
    return res.status(204).send();
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

export default router;
