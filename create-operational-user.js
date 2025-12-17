const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_qO3c5ugNvLYM@ep-square-firefly-aeppsfoo-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    }
  }
});

async function main() {
  console.log('🌱 Criando usuário operacional no banco de produção...');

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

  console.log('✅ Usuário operacional criado com sucesso!');
  console.log('📧 Email:', user.email);
  console.log('👤 Nome:', user.name);
  console.log('🔑 Role:', user.role);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao criar usuário:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
