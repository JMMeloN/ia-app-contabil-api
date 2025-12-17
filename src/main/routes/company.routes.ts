import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '@/main/middlewares/auth.middleware';
import {
  makeCreateCompanyUseCase,
  makeListCompaniesUseCase,
  makeUpdateCompanyUseCase,
  makeDeleteCompanyUseCase,
} from '@/main/factories/company.factory';

const router = Router();

// Todas as rotas de empresa precisam de autenticação
router.use(authMiddleware);

// Schemas de validação
const createCompanySchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido'),
  email: z.string().email('Email inválido'),
  telefone: z.string().regex(/^\(\d{2}\)\s?\d{4,5}-\d{4}$/, 'Telefone inválido'),
  endereco: z.string().min(5, 'Endereço inválido'),
  cidade: z.string().min(2, 'Cidade inválida'),
  estado: z.string().length(2, 'UF deve ter 2 caracteres'),
  cep: z.string().regex(/^\d{5}-\d{3}$/, 'CEP inválido'),
});

const updateCompanySchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').optional(),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido').optional(),
  email: z.string().email('Email inválido').optional(),
  telefone: z.string().regex(/^\(\d{2}\)\s?\d{4,5}-\d{4}$/, 'Telefone inválido').optional(),
  endereco: z.string().min(5, 'Endereço inválido').optional(),
  cidade: z.string().min(2, 'Cidade inválida').optional(),
  estado: z.string().length(2, 'UF deve ter 2 caracteres').optional(),
  cep: z.string().regex(/^\d{5}-\d{3}$/, 'CEP inválido').optional(),
});

// GET /companies - Listar empresas do usuário
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const listCompaniesUseCase = makeListCompaniesUseCase();
    const companies = await listCompaniesUseCase.execute(req.user!.userId);

    return res.status(200).json(companies);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /companies - Criar empresa
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = createCompanySchema.parse(req.body);
    const createCompanyUseCase = makeCreateCompanyUseCase();
    const company = await createCompanyUseCase.execute({
      ...data,
      userId: req.user!.userId,
    });

    return res.status(201).json(company);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    return res.status(400).json({ error: error.message });
  }
});

// PUT /companies/:id - Atualizar empresa
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateCompanySchema.parse(req.body);
    const updateCompanyUseCase = makeUpdateCompanyUseCase();
    const company = await updateCompanyUseCase.execute({
      id,
      ...data,
      userId: req.user!.userId,
    });

    return res.status(200).json(company);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    return res.status(400).json({ error: error.message });
  }
});

// DELETE /companies/:id - Deletar empresa
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleteCompanyUseCase = makeDeleteCompanyUseCase();
    await deleteCompanyUseCase.execute({
      id,
      userId: req.user!.userId,
    });

    return res.status(204).send();
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

export default router;
