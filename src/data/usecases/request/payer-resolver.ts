import { CompanyModel } from '@/domain/models/company.model';
import { RequestModel } from '@/domain/models/request.model';
import { PayerModel } from '@/data/protocols/payer.repository';

interface Borrower {
  type: 'LegalEntity' | 'NaturalPerson';
  federalTaxNumber: number;
  name: string;
  email: string;
}

function sanitizeDocument(document: string): string {
  return document.replace(/\D/g, '');
}

function fallbackBorrowerFromCompany(company: CompanyModel): Borrower {
  const digits = sanitizeDocument(company.cnpj);
  return {
    type: digits.length > 11 ? 'LegalEntity' : 'NaturalPerson',
    federalTaxNumber: Number(digits),
    name: company.nome,
    email: company.email,
  };
}

export function resolveBorrower(
  company: CompanyModel,
  data: {
    payer?: PayerModel | null;
    request?: RequestModel | null;
    tomadorNome?: string;
    tomadorDocumento?: string;
    tomadorEmail?: string;
  },
): Borrower {
  const request = data.request;
  const sourceName = data.payer?.name || data.tomadorNome || request?.tomadorNome;
  const sourceDocument = data.payer?.document || data.tomadorDocumento || request?.tomadorDocumento;
  const sourceEmail = data.payer?.email || data.tomadorEmail || request?.tomadorEmail;

  if (!sourceName || !sourceDocument) {
    return fallbackBorrowerFromCompany(company);
  }

  const digits = sanitizeDocument(sourceDocument);
  if (!digits) {
    return fallbackBorrowerFromCompany(company);
  }

  return {
    type: digits.length > 11 ? 'LegalEntity' : 'NaturalPerson',
    federalTaxNumber: Number(digits),
    name: sourceName,
    email: sourceEmail || company.email,
  };
}
