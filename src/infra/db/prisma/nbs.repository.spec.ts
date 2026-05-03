import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaNbsRepository } from './nbs.repository';

vi.mock('./client', () => ({
  prisma: {
    nbs: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { prisma } from './client';

const makeFakeNbs = () => ({
  id: 'nbs-id',
  nbs: '1.1502.10.00',
  descricaoNbs: 'Serviços de desenvolvimento de software',
  psOnerosa: null,
  adqExterior: null,
  indop: '100501',
  localIncidencia: 'Domicílio principal do adquirente',
  cClassTrib: '000001',
  nomeClassTrib: 'Situações tributadas integralmente pelo IBS e CBS.',
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('PrismaNbsRepository', () => {
  let sut: PrismaNbsRepository;

  beforeEach(() => {
    sut = new PrismaNbsRepository();
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar um registro NBS', async () => {
      const fakeNbs = makeFakeNbs();
      vi.mocked(prisma.nbs.create).mockResolvedValue(fakeNbs);

      const { id, createdAt, updatedAt, ...data } = fakeNbs;
      const result = await sut.create(data);

      expect(result.nbs).toBe('1.1502.10.00');
      expect(prisma.nbs.create).toHaveBeenCalledWith({ data });
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os registros NBS ordenados pelo código', async () => {
      const list = [makeFakeNbs()];
      vi.mocked(prisma.nbs.findMany).mockResolvedValue(list);

      const result = await sut.findAll();

      expect(result).toHaveLength(1);
      expect(prisma.nbs.findMany).toHaveBeenCalledWith({ orderBy: { nbs: 'asc' } });
    });
  });

  describe('findById', () => {
    it('deve retornar o registro quando encontrado', async () => {
      vi.mocked(prisma.nbs.findUnique).mockResolvedValue(makeFakeNbs());

      const result = await sut.findById('nbs-id');

      expect(result?.id).toBe('nbs-id');
    });

    it('deve retornar null quando não encontrado', async () => {
      vi.mocked(prisma.nbs.findUnique).mockResolvedValue(null);

      const result = await sut.findById('invalid-id');

      expect(result).toBeNull();
    });
  });

  describe('findByCode', () => {
    it('deve retornar o registro pelo código NBS', async () => {
      vi.mocked(prisma.nbs.findUnique).mockResolvedValue(makeFakeNbs());

      const result = await sut.findByCode('1.1502.10.00');

      expect(result?.nbs).toBe('1.1502.10.00');
      expect(prisma.nbs.findUnique).toHaveBeenCalledWith({ where: { nbs: '1.1502.10.00' } });
    });
  });

  describe('update', () => {
    it('deve atualizar e retornar o registro', async () => {
      const updated = { ...makeFakeNbs(), descricaoNbs: 'Nova descrição' };
      vi.mocked(prisma.nbs.update).mockResolvedValue(updated);

      const result = await sut.update('nbs-id', { descricaoNbs: 'Nova descrição' });

      expect(result.descricaoNbs).toBe('Nova descrição');
    });
  });

  describe('delete', () => {
    it('deve deletar o registro sem retornar valor', async () => {
      vi.mocked(prisma.nbs.delete).mockResolvedValue(makeFakeNbs());

      await expect(sut.delete('nbs-id')).resolves.toBeUndefined();
      expect(prisma.nbs.delete).toHaveBeenCalledWith({ where: { id: 'nbs-id' } });
    });
  });
});
