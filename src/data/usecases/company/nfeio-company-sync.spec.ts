import { describe, expect, it, vi } from 'vitest';
import { NfeioCompanySync, buildNfeioCompanyPayload } from './nfeio-company-sync';
import { CompanyModel } from '@/domain/models/company.model';

vi.mock('@/main/config/env', () => ({ env: { nfeioEnvironment: 'Development' } }));

const baseCompany: CompanyModel = {
  id: 'local-1',
  nome: 'SO OBRAS LTDA',
  cnpj: '06.697.621/0001-52',
  email: 'financeiro@soobras.com.br',
  endereco: 'ST SHIS QI 15 BLOCO A, SN',
  cidade: 'Brasília',
  estado: 'DF',
  cep: '71635-550',
  inscricaoEstadual: '0745745700165',
  inscricaoMunicipal: '0745745700165',
  userId: 'user-1',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

function makeSut(overrides: Partial<CompanyModel> = {}) {
  const company = { ...baseCompany, ...overrides };
  const repository = {
    update: vi.fn(async (_id: string, data: any) => ({ ...company, ...data })),
  } as any;
  const nfeio = {
    listCompanies: vi.fn(async () => []),
    createCompany: vi.fn(async () => ({ id: 'nfeio-created' })),
    updateCompany: vi.fn(async () => ({})),
  } as any;
  return { sut: new NfeioCompanySync(repository, nfeio), repository, nfeio, company };
}

describe('buildNfeioCompanyPayload', () => {
  it('maps Inscrição Estadual to regionalTaxNumber as a number', async () => {
    const payload = await buildNfeioCompanyPayload(baseCompany);
    expect(payload.regionalTaxNumber).toBe(745745700165);
    expect(payload.municipalTaxNumber).toBe('0745745700165');
    expect(payload.federalTaxNumber).toBe(6697621000152);
    expect(payload.address.street).toBe('ST SHIS QI 15 BLOCO A');
    expect(payload.address.number).toBe('SN');
  });

  it('omits regionalTaxNumber when the company has no Inscrição Estadual', async () => {
    const payload = await buildNfeioCompanyPayload({ ...baseCompany, inscricaoEstadual: null });
    expect(payload.regionalTaxNumber).toBeUndefined();
  });
});

describe('NfeioCompanySync.ensureLinked', () => {
  it('returns the company untouched when it is already linked', async () => {
    const { sut, nfeio, company } = makeSut({ nfeioCompanyId: 'nfeio-1' });
    const result = await sut.ensureLinked(company);
    expect(result.nfeioCompanyId).toBe('nfeio-1');
    expect(nfeio.listCompanies).not.toHaveBeenCalled();
  });

  it('links to an existing NFe.io company with the same CNPJ instead of creating a duplicate', async () => {
    const { sut, nfeio, repository, company } = makeSut();
    nfeio.listCompanies.mockResolvedValue([{ id: 'nfeio-existing', federalTaxNumber: 6697621000152 }]);
    const result = await sut.ensureLinked(company);
    expect(nfeio.createCompany).not.toHaveBeenCalled();
    expect(repository.update).toHaveBeenCalledWith('local-1', { nfeioCompanyId: 'nfeio-existing', syncStatus: 'SYNCED' });
    expect(result.nfeioCompanyId).toBe('nfeio-existing');
  });

  it('creates the company on NFe.io when no match exists', async () => {
    const { sut, nfeio, repository, company } = makeSut();
    const result = await sut.ensureLinked(company);
    expect(nfeio.createCompany).toHaveBeenCalledTimes(1);
    expect(repository.update).toHaveBeenCalledWith('local-1', { nfeioCompanyId: 'nfeio-created', syncStatus: 'SYNCED' });
    expect(result.syncStatus).toBe('SYNCED');
  });

  it('marks the company as FAILED and rethrows when NFe.io rejects it', async () => {
    const { sut, nfeio, repository, company } = makeSut();
    nfeio.createCompany.mockRejectedValue(new Error('CNPJ inválido'));
    await expect(sut.ensureLinked(company)).rejects.toThrow('Empresa não vinculada à NFe.io: CNPJ inválido');
    expect(repository.update).toHaveBeenCalledWith('local-1', { syncStatus: 'FAILED' });
  });
});
