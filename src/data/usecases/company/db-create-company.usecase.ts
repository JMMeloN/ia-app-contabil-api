import { CreateCompanyUseCase, CreateCompanyDTO } from '@/domain/usecases/company/create-company.usecase';
import { CompanyModel } from '@/domain/models/company.model';
import { CompanyRepository } from '@/data/protocols/company.repository';
import { NFEIOServiceProtocol } from '@/data/protocols/nfeio.service';
import { CepServiceProtocol } from '@/data/protocols/cep.service';

export class DbCreateCompany implements CreateCompanyUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly nfeioService: NFEIOServiceProtocol,
    private readonly cepService: CepServiceProtocol
  ) {}

  async execute(data: CreateCompanyDTO): Promise<CompanyModel> {
    // Verificar se o usuário já cadastrou este CNPJ no nosso banco
    const existingCompany = await this.companyRepository.findByUserIdAndCnpj(data.userId, data.cnpj);
    if (existingCompany) {
      throw new Error('Você já cadastrou uma empresa com este CNPJ');
    }

    // Criar empresa no banco local primeiro para obter o ID
    const company = await this.companyRepository.create({
      ...data,
      dataAbertura: data.dataAbertura ? new Date(data.dataAbertura) : undefined,
      nfeioCompanyId: undefined,
      cityServiceCode: data.cityServiceCode,
      // Conversão de tipos para o Prisma (BigInt)
      numeroJuntaComercial: data.numeroJuntaComercial ? BigInt(data.numeroJuntaComercial) : undefined,
      rpsNumero: data.rpsNumero ? BigInt(data.rpsNumero) : undefined,
    });

    // Disparar criação no NFe.io em segundo plano (sem await)
    this.createInNfeioBackground(company.id, data);

    return company;
  }

  private async createInNfeioBackground(companyId: string, data: CreateCompanyDTO): Promise<void> {
    try {
      console.info(`[NFe.io] Iniciando criação em background para empresa ${companyId}`);
      
      // Consultar ViaCep para preencher dados extras (bairro, código IBGE)
      const addressFromCep = await this.cepService.getAddressByCep(data.cep);
      
      // Mapeamento para o formato exato esperado pela API NFe.io (POST /companies)
      const nfeioCompanyResponse = await this.nfeioService.createCompany({
        name: data.nome,
        tradeName: data.nomeFantasia || data.nome,
        federalTaxNumber: Number(data.cnpj.replace(/\D/g, '')),
        email: data.email,
        address: {
          country: 'BRA',
          postalCode: data.cep.replace(/\D/g, ''),
          street: addressFromCep?.logradouro || data.endereco.split(',')[0]?.trim() || data.endereco,
          number: data.endereco.split(',')[1]?.trim() || 'SN',
          additionalInformation: '',
          district: addressFromCep?.bairro || 'Centro',
          city: {
            code: addressFromCep?.ibge || '3550308',
            name: addressFromCep?.localidade || data.cidade
          },
          state: addressFromCep?.uf || data.estado
        },
        openningDate: data.dataAbertura ? new Date(data.dataAbertura).toISOString() : new Date().toISOString(),
        taxRegime: data.regimeTributario || 'Isento',
        specialTaxRegime: data.regimeEspecialTributacao || 'Automatico',
        legalNature: data.naturezaJuridica || 'Empresario',
        municipalTaxNumber: data.inscricaoMunicipal || '',
        regionalTaxNumber: data.inscricaoEstadual ? Number(data.inscricaoEstadual.replace(/\D/g, '')) : undefined,
        companyRegistryNumber: data.numeroJuntaComercial,
        rpsSerialNumber: data.rpsSerie,
        rpsNumber: data.rpsNumero,
        issRate: data.aliquotaIss,
        environment: 'Development',
        fiscalStatus: 'Active',
        federalTaxDetermination: data.determinacaoImpostoFederal || 'NotInformed',
        municipalTaxDetermination: data.determinacaoImpostoMunicipal || 'NotInformed',
        loginName: data.prefeituraLogin,
        loginPassword: data.prefeituraSenha,
        authIssueValue: data.valorAutorizacao,
        economicActivities: [
          {
            type: 'Main',
            code: 0
          }
        ]
      });
      
      console.info(`[NFe.io] Resposta completa da API:`, JSON.stringify(nfeioCompanyResponse, null, 2));

      const nfeioCompanyAny = nfeioCompanyResponse as any;
      const nfeioId = nfeioCompanyAny.id || nfeioCompanyAny.companies?.id || nfeioCompanyAny.company?.id;
      
      if (nfeioId) {
        await this.companyRepository.update(companyId, {
          nfeioCompanyId: nfeioId,
          statusFiscal: nfeioCompanyAny.companies?.status || 'Active'
        });
        console.info(`[NFe.io] Empresa ${companyId} vinculada com sucesso ao NFe.io (ID: ${nfeioId})`);
      }
    } catch (error: any) {
      console.error(`[NFe.io] Falha ao criar empresa ${companyId} no NFe.io:`, error.message);
    }
  }
}
