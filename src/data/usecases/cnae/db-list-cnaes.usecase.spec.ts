import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DbListCnaes } from './db-list-cnaes.usecase';
import { CnaeRepository, CnaeModel } from '@/data/protocols/cnae.repository';
import { CnaeExternalService } from '@/data/protocols/cnae-external.service';

const makeCnaeRepository = (): CnaeRepository => ({
  create: vi.fn(),
  createMany: vi.fn(),
  count: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  findByCode: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
});

const makeCnaeExternalService = (): CnaeExternalService => ({
  fetchAll: vi.fn(),
});

const mockCnaes: CnaeModel[] = [
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

describe('DbListCnaes', () => {
  let cnaeRepository: CnaeRepository;
  let cnaeExternalService: CnaeExternalService;
  let sut: DbListCnaes;

  beforeEach(() => {
    cnaeRepository = makeCnaeRepository();
    cnaeExternalService = makeCnaeExternalService();
    sut = new DbListCnaes(cnaeRepository, cnaeExternalService);
  });

  it('deve retornar os CNAEs do banco quando já existem registros', async () => {
    vi.mocked(cnaeRepository.count).mockResolvedValue(14);
    vi.mocked(cnaeRepository.findAll).mockResolvedValue(mockCnaes);

    const result = await sut.execute();

    expect(result).toHaveLength(14);
    expect(cnaeExternalService.fetchAll).not.toHaveBeenCalled();
    expect(cnaeRepository.createMany).not.toHaveBeenCalled();
  });

  it('deve buscar na API externa quando o banco está vazio e salvar os resultados', async () => {
    const externalData = mockCnaes.map(({ codCnae, descricaoCnae }) => ({ codCnae, descricaoCnae }));
    vi.mocked(cnaeRepository.count).mockResolvedValue(0);
    vi.mocked(cnaeExternalService.fetchAll).mockResolvedValue(externalData);
    vi.mocked(cnaeRepository.createMany).mockResolvedValue(14);
    vi.mocked(cnaeRepository.findAll).mockResolvedValue(mockCnaes);

    const result = await sut.execute();

    expect(cnaeExternalService.fetchAll).toHaveBeenCalledOnce();
    expect(cnaeRepository.createMany).toHaveBeenCalledWith(externalData);
    expect(result).toHaveLength(14);
  });

  it('não deve chamar createMany quando a API externa retornar vazio', async () => {
    vi.mocked(cnaeRepository.count).mockResolvedValue(0);
    vi.mocked(cnaeExternalService.fetchAll).mockResolvedValue([]);
    vi.mocked(cnaeRepository.findAll).mockResolvedValue([]);

    await sut.execute();

    expect(cnaeRepository.createMany).not.toHaveBeenCalled();
  });

  it('deve passar o filtro de busca para o repositório', async () => {
    const filtered = mockCnaes.filter((c) => c.descricaoCnae.toLowerCase().includes('soja'));
    vi.mocked(cnaeRepository.count).mockResolvedValue(14);
    vi.mocked(cnaeRepository.findAll).mockResolvedValue(filtered);

    const result = await sut.execute('soja');

    expect(cnaeRepository.findAll).toHaveBeenCalledWith('soja');
    expect(result).toHaveLength(1);
    expect(result[0].codCnae).toBe('115600');
  });

  it('deve buscar na API e aplicar o filtro em seguida quando o banco está vazio', async () => {
    const externalData = mockCnaes.map(({ codCnae, descricaoCnae }) => ({ codCnae, descricaoCnae }));
    const filtered = mockCnaes.filter((c) => c.descricaoCnae.toLowerCase().includes('algodão'));
    vi.mocked(cnaeRepository.count).mockResolvedValue(0);
    vi.mocked(cnaeExternalService.fetchAll).mockResolvedValue(externalData);
    vi.mocked(cnaeRepository.createMany).mockResolvedValue(14);
    vi.mocked(cnaeRepository.findAll).mockResolvedValue(filtered);

    const result = await sut.execute('algodão');

    expect(cnaeExternalService.fetchAll).toHaveBeenCalledOnce();
    expect(cnaeRepository.findAll).toHaveBeenCalledWith('algodão');
    expect(result[0].codCnae).toBe('112101');
  });
});
