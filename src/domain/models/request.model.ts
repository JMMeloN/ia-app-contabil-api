export type RequestStatus = 'PENDENTE' | 'PROCESSADA' | 'CANCELADA';

export interface RequestModel {
  id: string;
  valor: number;
  dataEmissao: Date;
  observacoes?: string | null;
  status: RequestStatus;
  arquivoUrl?: string | null;
  userId: string;
  companyId: string;
  payerId?: string | null;
  tomadorNome?: string | null;
  tomadorDocumento?: string | null;
  tomadorEmail?: string | null;
  nfeioInvoiceId?: string | null;
  processadoEm?: Date | null;
  emissaoAutomatica: boolean;
  createdAt: Date;
  updatedAt: Date;
}
