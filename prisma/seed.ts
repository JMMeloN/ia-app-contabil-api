import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

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

  await prisma.user.upsert({
    where: { email: 'operacional@iacontabil.com' },
    update: {},
    create: {
      email: 'operacional@iacontabil.com',
      password: operacionalPassword,
      name: 'Maria Santos',
      role: 'OPERACIONAL',
    },
  });

  await prisma.user.upsert({
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

  const empresa1 = await prisma.company.upsert({
    where: { userId_cnpj: { userId: cliente.id, cnpj: '12.345.678/0001-90' } },
    update: {},
    create: {
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

  const empresa2 = await prisma.company.upsert({
    where: { userId_cnpj: { userId: cliente.id, cnpj: '98.765.432/0001-10' } },
    update: {},
    create: {
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

  const tomadora1 = await prisma.payer.upsert({
    where: { companyId_document: { companyId: empresa1.id, document: '11222333000144' } },
    update: {},
    create: {
      name: 'Tomadora Alpha Ltda',
      document: '11222333000144',
      type: 'LEGAL_ENTITY',
      email: 'financeiro@alpha.com.br',
      userId: cliente.id,
      companyId: empresa1.id,
    },
  });

  const tomadora2 = await prisma.payer.upsert({
    where: { companyId_document: { companyId: empresa2.id, document: '12345678901' } },
    update: {},
    create: {
      name: 'Carlos Souza',
      document: '12345678901',
      type: 'NATURAL_PERSON',
      email: 'carlos.souza@email.com',
      userId: cliente.id,
      companyId: empresa2.id,
    },
  });

  console.log('✅ Tomadoras criadas');

  const requestsExistentes = await prisma.request.count({ where: { userId: cliente.id } });
  if (requestsExistentes === 0) {
    await prisma.request.create({
      data: {
        valor: 2500.0,
        dataEmissao: new Date('2024-01-15'),
        observacoes: 'Nota fiscal de serviços de consultoria',
        status: 'PENDENTE',
        userId: cliente.id,
        companyId: empresa1.id,
        payerId: tomadora1.id,
        cityServiceCode: '2690',
        tomadorNome: tomadora1.name,
        tomadorDocumento: tomadora1.document,
        tomadorEmail: tomadora1.email,
        externalId: randomUUID(),
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
        payerId: tomadora2.id,
        cityServiceCode: '1401',
        tomadorNome: tomadora2.name,
        tomadorDocumento: tomadora2.document,
        tomadorEmail: tomadora2.email,
        externalId: randomUUID(),
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
        payerId: tomadora1.id,
        cityServiceCode: '2690',
        tomadorNome: tomadora1.name,
        tomadorDocumento: tomadora1.document,
        tomadorEmail: tomadora1.email,
        externalId: randomUUID(),
      },
    });
  }

  console.log('✅ Solicitações criadas');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
