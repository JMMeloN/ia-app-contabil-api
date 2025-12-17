import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '@/main/middlewares/auth.middleware';
import { makeUpdateProfileUseCase, makeChangePasswordUseCase } from '@/main/factories/auth.factory';

const router = Router();

// Todas as rotas de usuário precisam de autenticação
router.use(authMiddleware);

// Schemas de validação
const updateProfileSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
});

// PUT /users/profile - Atualizar perfil
router.put('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    const updateProfileUseCase = makeUpdateProfileUseCase();
    const user = await updateProfileUseCase.execute({
      userId: req.user!.userId,
      ...data,
    });

    return res.status(200).json(user);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    return res.status(400).json({ error: error.message });
  }
});

// PUT /users/password - Trocar senha
router.put('/password', async (req: AuthRequest, res: Response) => {
  try {
    const data = changePasswordSchema.parse(req.body);
    const changePasswordUseCase = makeChangePasswordUseCase();
    await changePasswordUseCase.execute({
      userId: req.user!.userId,
      ...data,
    });

    return res.status(200).json({ message: 'Senha alterada com sucesso' });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    return res.status(400).json({ error: error.message });
  }
});

export default router;
