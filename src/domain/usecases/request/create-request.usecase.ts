import { RequestModel, TaxationType } from '@/domain/models/request.model';

export interface CreateRequestDTO {
  valor: number;
  dataEmissao: Date;
  observacoes?: string;
  cnaeCode?: string;
  issRate?: number;
  federalServiceCode?: string;
  taxationType?: TaxationType;
  issWithheld?: boolean;
  deductionsAmount?: number;
  unconditionedDiscountAmount?: number;
  conditionedDiscountAmount?: number;
  irAmountWithheld?: number;
  pisAmountWithheld?: number;
  cofinsAmountWithheld?: number;
  csllAmountWithheld?: number;
  inssAmountWithheld?: number;
  userId: string;
  companyId: string;
  payerId: string;
  // Compatibilidade com payload atual
  tomadorNome?: string;
  tomadorDocumento?: string;
  tomadorEmail?: string;
}

export interface CreateRequestUseCase {
  execute(data: CreateRequestDTO): Promise<RequestModel>;
}
