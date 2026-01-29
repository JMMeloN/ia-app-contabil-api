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
  processadoEm?: Date | null;
  emissaoAutomatica: boolean;
  createdAt: Date;
  updatedAt: Date;
}
