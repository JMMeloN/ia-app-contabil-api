import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaCnaeRepository } from './cnae.repository';

vi.mock('./client', () => ({
  prisma: {
    cnae: {
      create: vi.fn(),
      createMany: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { prisma } from './client';

const mockCnaes = [
  { id: 'id-1', codCnae: '111301', descricaoCnae: 'Cultivo de arroz', createdAt: new Date(), updatedAt: new Date() },
  { id: 'id-2', codCnae: '111302', descricaoCnae: 'Cultivo de milho', createdAt: new Date(), updatedAt: new Date() },
  { id: 'id-3', codCnae: '111303', descricaoCnae: 'Cultivo de trigo', createdAt: new Date(), updatedAt: new Date() },
  { id: 'id-4', codCnae: '111399', descricaoCnae: 'Cultivo de outros cereais não especificados anteriormente', createdAt: new Date(), updatedAt: new Date() },
  { id: 'id-5', codCnae: '112101', descricaoCnae: 'Cultivo de algodão herbáceo', createdAt: new Date(), updatedAt: new Date() },
  { id: 'id-6', codCnae: '112102', descricaoCnae: 'Cultivo de juta', createdAt: new Date(), updatedAt: new Date() },
  { id: 'id-7', codCnae: '112199', descricaoCnae: 'Cultivo de outras fibras de lavoura temporária não especificadas anteriormente', createdAt: new Date(), updatedAt: new Date() },
  { id: 'id-8', codCnae: '113000', descricaoCnae: 'Cultivo de cana-de-açúcar', createdAt: new Date(), updatedAt: new Date() },
  { id: 'id-9', codCnae: '114800', descricaoCnae: 'Cultivo de fumo', createdAt: new Date(), updatedAt: new Date() },
  { id: 'id-10', codCnae: '115600', descricaoCnae: 'Cultivo de soja', createdAt: new Date(), updatedAt: new Date() },
  { id: 'id-11', codCnae: '116401', descricaoCnae: 'Cultivo de amendoim', createdAt: new Date(), updatedAt: new Date() },
  { id: 'id-12', codCnae: '116402', descricaoCnae: 'Cultivo de girassol', createdAt: new Date(), updatedAt: new Date() },
  { id: 'id-13', codCnae: '116403', descricaoCnae: 'Cultivo de mamona', createdAt: new Date(), updatedAt: new Date() },
  { id: 'id-14', codCnae: '116499', descricaoCnae: 'Cultivo de outras oleaginosas de lavoura temporária não especificadas anteriormente', createdAt: new Date(), updatedAt: new Date() },
];

describe('PrismaCnaeRepository', () => {
  let sut: PrismaCnaeRepository;

  beforeEach(() => {
    sut = new PrismaCnaeRepository();
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar um CNAE', async () => {
      vi.mocked(prisma.cnae.create).mockResolvedValue(mockCnaes[0]);

      const result = await sut.create({ codCnae: '111301', descricaoCnae: 'Cultivo de arroz' });

      expect(result.codCnae).toBe('111301');
      expect(result.descricaoCnae).toBe('Cultivo de arroz');
      expect(prisma.cnae.create).toHaveBeenCalledWith({
        data: { codCnae: '111301', descricaoCnae: 'Cultivo de arroz' },
      });
    });
  });

  describe('createMany', () => {
    it('deve importar múltiplos CNAEs e retornar a quantidade inserida', async () => {
      vi.mocked(prisma.cnae.createMany).mockResolvedValue({ count: mockCnaes.length });

      const data = mockCnaes.map(({ codCnae, descricaoCnae }) => ({ codCnae, descricaoCnae }));
      const count = await sut.createMany(data);

      expect(count).toBe(14);
      expect(prisma.cnae.createMany).toHaveBeenCalledWith({ data, skipDuplicates: true });
    });

    it('deve ignorar duplicatas ao importar', async () => {
      vi.mocked(prisma.cnae.createMany).mockResolvedValue({ count: 1 });

      const count = await sut.createMany([
        { codCnae: '111301', descricaoCnae: 'Cultivo de arroz' },
        { codCnae: '111301', descricaoCnae: 'Cultivo de arroz (duplicado)' },
      ]);

      expect(count).toBe(1);
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os CNAEs ordenados pelo código', async () => {
      vi.mocked(prisma.cnae.findMany).mockResolvedValue(mockCnaes);

      const result = await sut.findAll();

      expect(result).toHaveLength(14);
      expect(result[0].codCnae).toBe('111301');
      expect(result[13].codCnae).toBe('116499');
      expect(prisma.cnae.findMany).toHaveBeenCalledWith({ orderBy: { codCnae: 'asc' } });
    });
  });

  describe('findById', () => {
    it('deve retornar o CNAE quando encontrado', async () => {
      vi.mocked(prisma.cnae.findUnique).mockResolvedValue(mockCnaes[7]);

      const result = await sut.findById('id-8');

      expect(result?.codCnae).toBe('113000');
      expect(result?.descricaoCnae).toBe('Cultivo de cana-de-açúcar');
    });

    it('deve retornar null quando não encontrado', async () => {
      vi.mocked(prisma.cnae.findUnique).mockResolvedValue(null);

      const result = await sut.findById('id-inexistente');

      expect(result).toBeNull();
    });
  });

  describe('findByCode', () => {
    it('deve retornar o CNAE pelo código', async () => {
      vi.mocked(prisma.cnae.findUnique).mockResolvedValue(mockCnaes[9]);

      const result = await sut.findByCode('115600');

      expect(result?.descricaoCnae).toBe('Cultivo de soja');
      expect(prisma.cnae.findUnique).toHaveBeenCalledWith({ where: { codCnae: '115600' } });
    });

    it('deve retornar null para código inexistente', async () => {
      vi.mocked(prisma.cnae.findUnique).mockResolvedValue(null);

      const result = await sut.findByCode('999999');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('deve atualizar a descrição de um CNAE', async () => {
      const updated = { ...mockCnaes[11], descricaoCnae: 'Cultivo de girassol atualizado' };
      vi.mocked(prisma.cnae.update).mockResolvedValue(updated);

      const result = await sut.update('id-12', { descricaoCnae: 'Cultivo de girassol atualizado' });

      expect(result.descricaoCnae).toBe('Cultivo de girassol atualizado');
      expect(result.codCnae).toBe('116402');
    });
  });

  describe('delete', () => {
    it('deve deletar um CNAE sem retornar valor', async () => {
      vi.mocked(prisma.cnae.delete).mockResolvedValue(mockCnaes[8]);

      await expect(sut.delete('id-9')).resolves.toBeUndefined();
      expect(prisma.cnae.delete).toHaveBeenCalledWith({ where: { id: 'id-9' } });
    });
  });
});
