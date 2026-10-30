import { CompanyModel, CompanySyncStatus } from '@/domain/models/company.model';

/** Fiscal and NFe.io related fields shared by create and update. */
export interface CompanyFiscalData {
  nomeFantasia?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  complemento?: string;
  codigoCidade?: string;
  dataAbertura?: Date;
  regimeTributario?: string;
  naturezaJuridica?: string;
  inscricaoMunicipal?: string;
  inscricaoEstadual?: string;
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
  cityServiceCode?: string;
  certificateThumbprint?: string;
  certificateExpiresAt?: Date;
  certificateStatus?: string;
  nfeioCompanyId?: string;
  syncStatus?: CompanySyncStatus;
}

export interface CreateCompanyData extends CompanyFiscalData {
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  userId: string;
}

export interface UpdateCompanyData extends CompanyFiscalData {
  nome?: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

export interface CompanyRepository {
  create(data: CreateCompanyData): Promise<CompanyModel>;
  findByUserId(userId: string): Promise<CompanyModel[]>;
  findById(id: string): Promise<CompanyModel | null>;
  findByUserIdAndCnpj(userId: string, cnpj: string): Promise<CompanyModel | null>;
  update(id: string, data: UpdateCompanyData): Promise<CompanyModel>;
  delete(id: string): Promise<void>;
}
