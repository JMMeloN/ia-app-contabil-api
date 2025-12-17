import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Criando usuário operacional...');

  const hashedPassword = await bcrypt.hash('Lordsk@531', 10);

  const user = await prisma.user.upsert({
    where: { email: 'iaappcontabil@gmail.com' },
    update: {
      password: hashedPassword,
      role: 'OPERATIONAL',
    },
    create: {
      email: 'iaappcontabil@gmail.com',
      password: hashedPassword,
      name: 'Operacional IAContabil',
      role: 'OPERATIONAL',
    },
  });

  console.log('✅ Usuário operacional criado:', user);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao criar usuário:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
