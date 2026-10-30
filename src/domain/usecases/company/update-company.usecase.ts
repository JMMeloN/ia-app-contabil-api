import { CompanyModel } from '@/domain/models/company.model';

export interface UpdateCompanyDTO {
  id: string;
  userId: string;
  nome?: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  nomeFantasia?: string;
  dataAbertura?: string;
  regimeTributario?: string;
  naturezaJuridica?: string;
  inscricaoMunicipal?: string;
  inscricaoEstadual?: string;
  cityServiceCode?: string;
  regimeEspecialTributacao?: string;
  numeroJuntaComercial?: number;
  rpsSerie?: string;
  rpsNumero?: number;
  aliquotaIss?: number;
  determinacaoImpostoFederal?: string;
  determinacaoImpostoMunicipal?: string;
  prefeituraLogin?: string;
  prefeituraSenha?: string;
  valorAutorizacao?: string;
}

export interface UpdateCompanyUseCase {
  execute(data: UpdateCompanyDTO): Promise<CompanyModel>;
}
