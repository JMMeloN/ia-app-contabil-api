import { ListCompaniesUseCase } from '@/domain/usecases/company/list-companies.usecase';
import { CompanyModel } from '@/domain/models/company.model';
import { CompanyRepository } from '@/data/protocols/company.repository';
import { NFEIOServiceProtocol } from '@/data/protocols/nfeio.service';

export class DbListCompanies implements ListCompaniesUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly nfeioService: NFEIOServiceProtocol
  ) {}

  async execute(userId: string): Promise<CompanyModel[]> {
    // 1. Retornar dados locais imediatamente para performance
    const companies = await this.companyRepository.findByUserId(userId);
    
    // 2. Disparar sincronização em background
    this.syncWithNfeioBackground(userId, companies);

    return companies;
  }

  private async syncWithNfeioBackground(userId: string, localCompanies: CompanyModel[]): Promise<void> {
    try {
      console.info(`[NFe.io Sync] Iniciando sincronização para usuário ${userId}`);
      
      // Buscar todas as empresas na conta do NFe.io
      const nfeioCompanies = await this.nfeioService.listCompanies();
      
      if (!nfeioCompanies || nfeioCompanies.length === 0) {
        console.info(`[NFe.io Sync] Nenhuma empresa encontrada na API externa.`);
        return;
      }

      for (const external of nfeioCompanies) {
        // Formatar CNPJ da API (número) para o formato do nosso banco (string com máscara ou sem)
        // Nossa aplicação usa máscara: 12.345.678/0001-90
        const rawCnpj = external.federalTaxNumber.toString().padStart(14, '0');
        const formattedCnpj = rawCnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");

        // Verificar se essa empresa externa pertence a uma das empresas locais do usuário
        const matchingLocal = localCompanies.find(c => 
          c.cnpj === formattedCnpj || 
          c.cnpj.replace(/\D/g, '') === rawCnpj ||
          c.nfeioCompanyId === external.id
        );

        if (matchingLocal) {
          console.info(`[NFe.io Sync] Atualizando dados da empresa ${matchingLocal.id} (${external.name})`);
          
          await this.companyRepository.update(matchingLocal.id, {
            nfeioCompanyId: external.id,
            nomeFantasia: external.tradeName || external.name,
            rua: external.address?.street,
            numero: external.address?.number,
            bairro: external.address?.district,
            complemento: external.address?.additionalInformation,
            inscricaoMunicipal: external.municipalTaxNumber,
            regimeTributario: external.taxRegime,
            naturezaJuridica: external.legalNature,
            statusFiscal: (external as any).fiscalStatus || matchingLocal.statusFiscal,
            ambiente: (external as any).environment || matchingLocal.ambiente
          });
        }
      }
      
      console.info(`[NFe.io Sync] Sincronização concluída para usuário ${userId}`);
    } catch (error: any) {
      console.error(`[NFe.io Sync] Erro durante sincronização em background:`, error.message);
    }
  }
}
