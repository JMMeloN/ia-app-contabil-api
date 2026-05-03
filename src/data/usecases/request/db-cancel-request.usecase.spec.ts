import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DbCancelRequest } from './db-cancel-request.usecase';
import { RequestRepository } from '@/data/protocols/request.repository';
import { RequestModel } from '@/domain/models/request.model';

const makeRequestRepository = (): RequestRepository => ({
  create: vi.fn(),
  findById: vi.fn(),
  findMany: vi.fn(),
  updateStatus: vi.fn(),
});

const makeFakeRequest = (overrides: Partial<RequestModel> = {}): RequestModel => ({
  id: 'request-id',
  valor: 500,
  dataEmissao: new Date(),
  status: 'PENDENTE',
  userId: 'user-id',
  companyId: 'company-id',
  emissaoAutomatica: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('DbCancelRequest', () => {
  let requestRepository: RequestRepository;
  let sut: DbCancelRequest;

  beforeEach(() => {
    requestRepository = makeRequestRepository();
    sut = new DbCancelRequest(requestRepository);
  });

  it('deve lançar erro quando a solicitação não for encontrada', async () => {
    vi.mocked(requestRepository.findById).mockResolvedValue(null);

    await expect(sut.execute({ requestId: 'invalid-id', userId: 'user-id' }))
      .rejects.toThrow('Solicitação não encontrada');
  });

  it('deve lançar erro quando a solicitação não pertence ao usuário', async () => {
    vi.mocked(requestRepository.findById).mockResolvedValue(makeFakeRequest({ userId: 'other-user' }));

    await expect(sut.execute({ requestId: 'request-id', userId: 'user-id' }))
      .rejects.toThrow('Você não tem permissão para cancelar esta solicitação');
  });

  it('deve lançar erro quando a solicitação já estiver cancelada', async () => {
    vi.mocked(requestRepository.findById).mockResolvedValue(makeFakeRequest({ status: 'CANCELADA' }));

    await expect(sut.execute({ requestId: 'request-id', userId: 'user-id' }))
      .rejects.toThrow('Esta solicitação já está cancelada');
  });

  it('deve lançar erro ao cancelar solicitação processada sem vínculo NFE.io', async () => {
    vi.mocked(requestRepository.findById).mockResolvedValue(
      makeFakeRequest({ status: 'PROCESSADA', nfeioInvoiceId: null }),
    );

    await expect(sut.execute({ requestId: 'request-id', userId: 'user-id' }))
      .rejects.toThrow('Não é possível cancelar uma solicitação processada sem vínculo NFE.io');
  });

  it('deve cancelar com sucesso uma solicitação pendente', async () => {
    const cancelledRequest = makeFakeRequest({ status: 'CANCELADA' });
    vi.mocked(requestRepository.findById).mockResolvedValue(makeFakeRequest({ status: 'PENDENTE' }));
    vi.mocked(requestRepository.updateStatus).mockResolvedValue(cancelledRequest);

    const result = await sut.execute({ requestId: 'request-id', userId: 'user-id' });

    expect(result.status).toBe('CANCELADA');
    expect(requestRepository.updateStatus).toHaveBeenCalledWith('request-id', { status: 'CANCELADA' });
  });

  it('deve cancelar com sucesso uma solicitação processada com vínculo NFE.io', async () => {
    const cancelledRequest = makeFakeRequest({ status: 'CANCELADA' });
    vi.mocked(requestRepository.findById).mockResolvedValue(
      makeFakeRequest({ status: 'PROCESSADA', nfeioInvoiceId: 'nfeio-id' }),
    );
    vi.mocked(requestRepository.updateStatus).mockResolvedValue(cancelledRequest);

    const result = await sut.execute({ requestId: 'request-id', userId: 'user-id' });

    expect(result.status).toBe('CANCELADA');
  });
});
