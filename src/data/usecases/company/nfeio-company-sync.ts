import { CompanyModel } from '@/domain/models/company.model';
import { CompanyRepository } from '@/data/protocols/company.repository';
import { NFEIOCompanyInput, NFEIOServiceProtocol } from '@/data/protocols/nfeio.service';
import { CepAddress, CepServiceProtocol } from '@/data/protocols/cep.service';
import { env } from '@/main/config/env';

export function onlyDigits(value?: string | null): string {
  return (value || '').replace(/\D/g, '');
}

function toInteger(value?: string | number | bigint | null): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const parsed = Number(typeof value === 'string' ? onlyDigits(value) : value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

/**
 * Builds the payload NFe.io expects for POST/PUT /companies from the data we
 * store locally. The same mapping is used on create, update and re-sync so
 * NFe.io never receives placeholder values that overwrite real company data.
 */
export async function buildNfeioCompanyPayload(
  company: CompanyModel,
  cepService?: CepServiceProtocol,
): Promise<NFEIOCompanyInput> {
  let cepAddress: CepAddress | null = null;
  if (cepService && (!company.codigoCidade || !company.bairro)) {
    try {
      cepAddress = await cepService.getAddressByCep(company.cep);
    } catch {
      cepAddress = null;
    }
  }

  const [streetPart, numberPart] = (company.endereco || '').split(',').map((part) => part.trim());
  const cityCode = company.codigoCidade || cepAddress?.ibge || '';

  return {
    name: company.nome,
    tradeName: company.nomeFantasia || company.nome,
    federalTaxNumber: Number(onlyDigits(company.cnpj)),
    email: company.email,
    address: {
      country: company.pais || 'BRA',
      postalCode: onlyDigits(company.cep),
      street: company.rua || cepAddress?.logradouro || streetPart || 'Não informado',
      number: company.numero || numberPart || 'SN',
      additionalInformation: company.complemento || '',
      district: company.bairro || cepAddress?.bairro || 'Centro',
      city: {
        code: cityCode,
        name: cepAddress?.localidade || company.cidade,
      },
      state: cepAddress?.uf || company.estado,
    },
    openningDate: (company.dataAbertura ?? company.createdAt ?? new Date()).toISOString(),
    taxRegime: company.regimeTributario || 'Isento',
    specialTaxRegime: company.regimeEspecialTributacao || 'Automatico',
    legalNature: company.naturezaJuridica || 'Empresario',
    municipalTaxNumber: onlyDigits(company.inscricaoMunicipal),
    regionalTaxNumber: toInteger(company.inscricaoEstadual),
    companyRegistryNumber: toInteger(company.numeroJuntaComercial),
    rpsSerialNumber: company.rpsSerie || undefined,
    rpsNumber: toInteger(company.rpsNumero),
    issRate: company.aliquotaIss ?? undefined,
    environment: env.nfeioEnvironment as 'Development' | 'Production' | 'Staging',
    fiscalStatus: 'Active',
    federalTaxDetermination: company.determinacaoImpostoFederal || 'NotInformed',
    municipalTaxDetermination: company.determinacaoImpostoMunicipal || 'NotInformed',
    loginName: company.prefeituraLogin || undefined,
    loginPassword: company.prefeituraSenha || undefined,
    authIssueValue: company.valorAutorizacao || undefined,
    economicActivities: [{ type: 'Main', code: 0 }],
  };
}

/**
 * Keeps a local company linked to its NFe.io counterpart.
 *
 * `ensureLinked` is called lazily by every flow that needs `nfeioCompanyId`
 * (payers, certificate upload, invoice emission), so a company whose
 * background creation failed or has not finished yet is linked on demand
 * instead of failing with "Empresa ainda não sincronizada com a NFE.io".
 */
export class NfeioCompanySync {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly nfeioService: NFEIOServiceProtocol,
    private readonly cepService?: CepServiceProtocol,
  ) {}

  async ensureLinked(company: CompanyModel): Promise<CompanyModel> {
    if (company.nfeioCompanyId) {
      return company;
    }

    try {
      const nfeioCompanyId =
        (await this.findRemoteIdByCnpj(company.cnpj)) ?? (await this.createRemote(company));

      const linked = await this.companyRepository.update(company.id, {
        nfeioCompanyId,
        syncStatus: 'SYNCED',
      });
      console.info(`[NFe.io] Empresa ${company.id} vinculada (ID NFe.io: ${nfeioCompanyId})`);
      return linked;
    } catch (error: any) {
      console.error(`[NFe.io] Falha ao vincular empresa ${company.id}:`, error.message);
      await this.companyRepository
        .update(company.id, { syncStatus: 'FAILED' })
        .catch(() => undefined);
      throw new Error(`Empresa não vinculada à NFe.io: ${error.message}`);
    }
  }

  /** Pushes the current local data to NFe.io. No-op for unlinked companies. */
  async pushUpdate(company: CompanyModel): Promise<void> {
    if (!company.nfeioCompanyId) {
      return;
    }
    const payload = await buildNfeioCompanyPayload(company, this.cepService);
    await this.nfeioService.updateCompany(company.nfeioCompanyId, payload);
  }

  private async findRemoteIdByCnpj(cnpj: string): Promise<string | undefined> {
    const target = onlyDigits(cnpj);
    let companies: Array<{ id: string; federalTaxNumber: number }> = [];
    try {
      companies = (await this.nfeioService.listCompanies()) || [];
    } catch {
      companies = [];
    }

    return companies.find(
      (remote) => String(remote.federalTaxNumber).padStart(14, '0') === target,
    )?.id;
  }

  private async createRemote(company: CompanyModel): Promise<string> {
    const payload = await buildNfeioCompanyPayload(company, this.cepService);
    const response = (await this.nfeioService.createCompany(payload)) as any;
    const id = response?.id || response?.companies?.id || response?.company?.id;
    if (!id) {
      throw new Error('NFe.io não retornou o ID da empresa criada');
    }
    return id;
  }
}
