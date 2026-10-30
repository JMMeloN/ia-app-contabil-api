export type PayerType = 'LEGAL_ENTITY' | 'NATURAL_PERSON';
export type PayerSyncStatus = 'PENDING' | 'SYNCED' | 'FAILED';

export interface PayerModel {
  id: string;
  name: string;
  document: string;
  type: PayerType;
  email?: string | null;
  phone?: string | null;
  /** Inscrição Municipal (somente pessoa jurídica) */
  municipalTaxNumber?: string | null;
  /** Inscrição Estadual (somente pessoa jurídica) */
  stateTaxNumber?: string | null;
  cidade?: string | null;
  estado?: string | null;
  companyId: string;
  userId: string;
  syncStatus?: PayerSyncStatus;
  /** Present when the payer was saved but NFe.io rejected it */
  syncError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePayerData {
  companyId: string;
  name: string;
  document: string;
  type?: PayerType;
  email?: string;
  phone?: string;
  municipalTaxNumber?: string;
  stateTaxNumber?: string;
}
