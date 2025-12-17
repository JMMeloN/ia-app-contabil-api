import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const router = Router();
const prisma = new PrismaClient();

// Rota temporária para criar usuário operacional
router.post('/create-operational', async (req: Request, res: Response) => {
  try {
    const hashedPassword = await bcrypt.hash('Lordsk@531', 10);

    const user = await prisma.user.upsert({
      where: { email: 'iaappcontabil@gmail.com' },
      update: {
        password: hashedPassword,
        role: 'OPERACIONAL',
      },
      create: {
        email: 'iaappcontabil@gmail.com',
        password: hashedPassword,
        name: 'Operacional IAContabil',
        role: 'OPERACIONAL',
      },
    });

    res.json({
      success: true,
      message: 'Usuário operacional criado com sucesso!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });
  } catch (error: any) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
