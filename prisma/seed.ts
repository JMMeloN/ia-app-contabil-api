import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Criar usuários
  const clientePassword = await bcrypt.hash('cliente123', 10);
  const operacionalPassword = await bcrypt.hash('operacional123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  const cliente = await prisma.user.upsert({
    where: { email: 'cliente@iacontabil.com' },
    update: {},
    create: {
      email: 'cliente@iacontabil.com',
      password: clientePassword,
      name: 'João Silva',
      role: 'CLIENTE',
    },
  });

  const operacional = await prisma.user.upsert({
    where: { email: 'operacional@iacontabil.com' },
    update: {},
    create: {
      email: 'operacional@iacontabil.com',
      password: operacionalPassword,
      name: 'Maria Santos',
      role: 'OPERACIONAL',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@iacontabil.com' },
    update: {},
    create: {
      email: 'admin@iacontabil.com',
      password: adminPassword,
      name: 'Admin IAContabil',
      role: 'ADMIN',
    },
  });

  console.log('✅ Usuários criados');

  // Criar empresas para o cliente
  const empresa1 = await prisma.company.create({
    data: {
      nome: 'Empresa ABC Ltda',
      cnpj: '12.345.678/0001-90',
      email: 'contato@abc.com.br',
      telefone: '(11) 98765-4321',
      endereco: 'Rua Exemplo, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567',
      userId: cliente.id,
    },
  });

  const empresa2 = await prisma.company.create({
    data: {
      nome: 'Tech Solutions SA',
      cnpj: '98.765.432/0001-10',
      email: 'financeiro@techsolutions.com',
      telefone: '(11) 91234-5678',
      endereco: 'Av. Paulista, 1000',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310-100',
      userId: cliente.id,
    },
  });

  console.log('✅ Empresas criadas');

  // Criar solicitações
  await prisma.request.create({
    data: {
      valor: 2500.0,
      dataEmissao: new Date('2024-01-15'),
      observacoes: 'Nota fiscal de serviços de consultoria',
      status: 'PENDENTE',
      userId: cliente.id,
      companyId: empresa1.id,
    },
  });

  await prisma.request.create({
    data: {
      valor: 3200.5,
      dataEmissao: new Date('2024-01-20'),
      observacoes: '',
      status: 'PROCESSADA',
      arquivoUrl: 'https://exemplo.com/notas/nota-002.pdf',
      processadoEm: new Date('2024-01-13'),
      userId: cliente.id,
      companyId: empresa2.id,
    },
  });

  await prisma.request.create({
    data: {
      valor: 1800.0,
      dataEmissao: new Date('2024-01-18'),
      observacoes: 'Urgente - prazo até 20/01',
      status: 'PENDENTE',
      userId: cliente.id,
      companyId: empresa1.id,
    },
  });

  console.log('✅ Solicitações criadas');

  console.log('\n📊 Dados de acesso:');
  console.log('------------------');
  console.log('Cliente:');
  console.log('  Email: cliente@iacontabil.com');
  console.log('  Senha: cliente123');
  console.log('\nOperacional:');
  console.log('  Email: operacional@iacontabil.com');
  console.log('  Senha: operacional123');
  console.log('\nAdmin:');
  console.log('  Email: admin@iacontabil.com');
  console.log('  Senha: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
