import { CompanyModel } from '@/domain/models/company.model';

export interface CreateCompanyDTO {
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  userId: string;
  // Campos fiscais e técnicos
  dataAbertura?: string;
  regimeTributario?: string;
  naturezaJuridica?: string;
  inscricaoMunicipal?: string;
  inscricaoEstadual?: string;
  cityServiceCode?: string;
  nomeFantasia?: string;
  
  // Campos avançados NFe.io
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

export interface CreateCompanyUseCase {
  execute(data: CreateCompanyDTO): Promise<CompanyModel>;
}
