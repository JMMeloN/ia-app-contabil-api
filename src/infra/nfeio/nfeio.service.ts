import { env } from '@/main/config/env';

// Tipos baseados na documentação nfe.io
export interface NFEIOBorrower {
  type: 'LegalEntity' | 'NaturalPerson';
  federalTaxNumber: number; // CNPJ ou CPF (apenas números)
  name: string;
  email: string;
  address?: {
    country: string; // 'BRA'
    postalCode: string;
    street: string;
    number: string;
    additionalInformation?: string;
    district: string;
    city: {
      code: string; // Código IBGE
      name: string;
    };
    state: string; // Sigla do estado (2 letras)
  };
}

export interface NFEIOServiceInvoiceInput {
  cityServiceCode: string; // Código do serviço municipal
  description: string; // Descrição dos serviços
  servicesAmount: number; // Valor total dos serviços
  borrower: NFEIOBorrower; // Dados do tomador do serviço
  rpsNumber?: number; // Número do RPS (opcional)
  rpsSerialNumber?: string; // Série do RPS (opcional)
}

export interface NFEIOServiceInvoiceResponse {
  id: string;
  status: string;
  borrower: NFEIOBorrower;
  cityServiceCode: string;
  description: string;
  servicesAmount: number;
  number?: string; // Número da nota fiscal emitida
  verificationCode?: string; // Código de verificação
  pdfUrl?: string; // URL do PDF da nota
  xmlUrl?: string; // URL do XML da nota
  createdOn: string;
  modifiedOn: string;
  flowStatus: string;
  flowMessage?: string;
}

export class NFEIOService {
  private apiKey: string;
  private companyId: string;
  private baseUrl = 'https://api.nfe.io';

  constructor(apiKey?: string, companyId?: string) {
    this.apiKey = apiKey || env.nfeioApiKey;
    this.companyId = companyId || env.nfeioCompanyId;
  }

  /**
   * Emite uma nota fiscal de serviço eletrônica (NFS-e)
   */
  async emitServiceInvoice(
    data: NFEIOServiceInvoiceInput
  ): Promise<NFEIOServiceInvoiceResponse> {
    try {
      const nfeio = require('nfe-io')(this.apiKey);

      return new Promise((resolve, reject) => {
        nfeio.serviceInvoices.create(
          this.companyId,
          data,
          (error: any, result: NFEIOServiceInvoiceResponse) => {
            if (error) {
              console.error('Erro ao emitir nota fiscal:', error);
              reject(new Error(`Erro ao emitir nota fiscal: ${error.message || error}`));
            } else {
              resolve(result);
            }
          }
        );
      });
    } catch (error: any) {
      console.error('Erro ao emitir nota fiscal:', error);
      throw new Error(`Erro ao emitir nota fiscal: ${error.message}`);
    }
  }

  /**
   * Consulta uma nota fiscal pelo ID
   */
  async getServiceInvoice(invoiceId: string): Promise<NFEIOServiceInvoiceResponse> {
    try {
      const nfeio = require('nfe-io')(this.apiKey);

      return new Promise((resolve, reject) => {
        nfeio.serviceInvoices.get(
          this.companyId,
          invoiceId,
          (error: any, result: NFEIOServiceInvoiceResponse) => {
            if (error) {
              console.error('Erro ao consultar nota fiscal:', error);
              reject(new Error(`Erro ao consultar nota fiscal: ${error.message || error}`));
            } else {
              resolve(result);
            }
          }
        );
      });
    } catch (error: any) {
      console.error('Erro ao consultar nota fiscal:', error);
      throw new Error(`Erro ao consultar nota fiscal: ${error.message}`);
    }
  }

  /**
   * Lista todas as notas fiscais da empresa
   */
  async listServiceInvoices(): Promise<NFEIOServiceInvoiceResponse[]> {
    try {
      const nfeio = require('nfe-io')(this.apiKey);

      return new Promise((resolve, reject) => {
        nfeio.serviceInvoices.list(
          this.companyId,
          (error: any, result: NFEIOServiceInvoiceResponse[]) => {
            if (error) {
              console.error('Erro ao listar notas fiscais:', error);
              reject(new Error(`Erro ao listar notas fiscais: ${error.message || error}`));
            } else {
              resolve(result);
            }
          }
        );
      });
    } catch (error: any) {
      console.error('Erro ao listar notas fiscais:', error);
      throw new Error(`Erro ao listar notas fiscais: ${error.message}`);
    }
  }

  /**
   * Cancela uma nota fiscal
   */
  async cancelServiceInvoice(invoiceId: string): Promise<NFEIOServiceInvoiceResponse> {
    try {
      const nfeio = require('nfe-io')(this.apiKey);

      return new Promise((resolve, reject) => {
        nfeio.serviceInvoices.cancel(
          this.companyId,
          invoiceId,
          (error: any, result: NFEIOServiceInvoiceResponse) => {
            if (error) {
              console.error('Erro ao cancelar nota fiscal:', error);
              reject(new Error(`Erro ao cancelar nota fiscal: ${error.message || error}`));
            } else {
              resolve(result);
            }
          }
        );
      });
    } catch (error: any) {
      console.error('Erro ao cancelar nota fiscal:', error);
      throw new Error(`Erro ao cancelar nota fiscal: ${error.message}`);
    }
  }
}
