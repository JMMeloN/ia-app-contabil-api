import { Router, Request, Response } from 'express';
import { z } from 'zod';
import {
  makeRegisterUseCase,
  makeLoginUseCase,
  makeGetCurrentUserRepository,
} from '@/main/factories/auth.factory';
import { authMiddleware, AuthRequest } from '@/main/middlewares/auth.middleware';

const router = Router();

// Schemas de validação
const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

// POST /auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    const registerUseCase = makeRegisterUseCase();
    const user = await registerUseCase.execute(data);

    return res.status(201).json(user);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    return res.status(400).json({ error: error.message });
  }
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);
    const loginUseCase = makeLoginUseCase();
    const result = await loginUseCase.execute(data);

    return res.status(200).json(result);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    return res.status(401).json({ error: error.message });
  }
});

// GET /auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userRepository = makeGetCurrentUserRepository();
    const user = await userRepository.findById(req.user!.userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    return res.status(200).json(user);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

export default router;
