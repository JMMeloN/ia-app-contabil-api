export type RequestStatus = 'PENDENTE' | 'PROCESSANDO' | 'PROCESSADA' | 'FALHA' | 'CANCELADA';

export interface RequestModel {
  id: string;
  valor: number;
  dataEmissao: Date;
  observacoes?: string | null;
  cnaeCode?: string | null;
  issRate?: number | null;
  status: RequestStatus;
  arquivoUrl?: string | null;
  xmlUrl?: string | null;
  cancelamentoXmlUrl?: string | null;
  userId: string;
  companyId: string;
  payerId: string;
  cityServiceCode?: string | null;
  numeroNota?: string | null;
  codigoVerificacao?: string | null;
  errorMessage?: string | null;
  externalId?: string | null;
  tomadorNome?: string | null;
  tomadorDocumento?: string | null;
  tomadorEmail?: string | null;
  tomadorEndereco?: string | null;
  tomadorCidade?: string | null;
  tomadorEstado?: string | null;
  tomadorCep?: string | null;
  nfeioInvoiceId?: string | null;
  processadoEm?: Date | null;
  canceladoEm?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
