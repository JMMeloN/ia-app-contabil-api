export interface NFEIOCompanyAddress {
  country?: string;
  postalCode: string;
  street: string;
  number: string;
  additionalInformation?: string;
  district: string;
  city: {
    code: string;
    name: string;
  };
  state: string;
}

export interface NFEIOCompanyInput {
  id?: string;
  name: string;
  tradeName?: string;
  federalTaxNumber: number;
  email: string;
  address: NFEIOCompanyAddress;
  openningDate: string;
  taxRegime: string;
  specialTaxRegime?: string;
  legalNature: string;
  economicActivities?: Array<{
    type: string;
    code: number;
  }>;
  companyRegistryNumber?: number;
  regionalTaxNumber?: number;
  municipalTaxNumber: string;
  rpsSerialNumber?: string;
  rpsNumber?: number;
  issRate?: number;
  environment?: 'Development' | 'Production' | 'Staging';
  fiscalStatus?: string;
  federalTaxDetermination?: string;
  municipalTaxDetermination?: string;
  loginName?: string;
  loginPassword?: string;
  authIssueValue?: string;
  certificate?: {
    thumbprint: string;
    modifiedOn: string;
    expiresOn: string;
    status: string;
  };
}

export interface NFEIOCompanyResponse {
  id: string;
  name: string;
  tradeName?: string;
  federalTaxNumber: number;
  email: string;
  address: NFEIOCompanyAddress;
  status: string;
  createdOn: string;
  modifiedOn: string;
}

export interface NFEIOServiceInvoiceInput {
  companyId: string;
  externalId?: string;
  cityServiceCode: string;
  cnaeCode?: string;
  description: string;
  servicesAmount: number;
  borrower: {
    type: 'LegalEntity' | 'NaturalPerson';
    federalTaxNumber: number;
    name: string;
    email: string;
  };
}

export interface NFEIOPersonInput {
  federalTaxNumber: string | number;
  name: string;
  email: string;
  address: {
    country?: string;
    postalCode?: string;
    street: string;
    number: string;
    additionalInformation?: string;
    district?: string;
    city?: {
      code?: string;
      name?: string;
    };
    state?: string;
  };
}

export interface NFEIOServiceProtocol {
  createCompany(data: NFEIOCompanyInput): Promise<NFEIOCompanyResponse>;
  listCompanies(): Promise<NFEIOCompanyResponse[]>;
  getCompany(companyIdOrTaxNumber: string): Promise<NFEIOCompanyResponse>;
  updateCompany(companyId: string, data: NFEIOCompanyInput): Promise<NFEIOCompanyResponse>;
  deleteCompany(companyId: string): Promise<any>;
  uploadCertificate(companyId: string, certificateData: any): Promise<any>;
  createLegalPerson(companyId: string, data: NFEIOPersonInput): Promise<any>;
  updateLegalPerson(companyId: string, personId: string, data: Partial<NFEIOPersonInput>): Promise<any>;
  findLegalPersonByTaxNumber(companyId: string, federalTaxNumber: string): Promise<any | undefined>;
  createNaturalPerson(companyId: string, data: NFEIOPersonInput): Promise<any>;
  updateNaturalPerson(companyId: string, personId: string, data: Partial<NFEIOPersonInput>): Promise<any>;
  findNaturalPersonByTaxNumber(companyId: string, federalTaxNumber: string): Promise<any | undefined>;
  emitServiceInvoice(data: NFEIOServiceInvoiceInput): Promise<any>;
  getServiceInvoice(companyId: string, invoiceId: string): Promise<any>;
  getServiceInvoicePdfUrl(companyId: string, invoiceId: string): Promise<string | undefined>;
  getServiceInvoicePdfBinary(companyId: string, invoiceId: string): Promise<Buffer | undefined>;
  cancelServiceInvoice(companyId: string, invoiceId: string): Promise<any>;
}
