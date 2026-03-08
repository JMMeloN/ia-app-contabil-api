import axios from 'axios';
import FormData from 'form-data';
import { env } from '@/main/config/env';
import { 
  NFEIOCompanyInput, 
  NFEIOCompanyResponse, 
  NFEIOServiceProtocol,
  NFEIOServiceInvoiceInput
} from '@/data/protocols/nfeio.service';

export class NFEIOService implements NFEIOServiceProtocol {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    const rawKey = apiKey || env.nfeioApiKey;
    this.apiKey = rawKey.replace(/['"]+/g, '').trim();
    this.baseUrl = env.nfeioBaseUrl;
  }

  private getRequestConfig(path: string) {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      'Authorization': this.apiKey,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    return { url, headers };
  }

  private handleError(operation: string, error: any) {
    const errorData = error.response?.data;
    const status = error.response?.status;
    
    console.error(`[NFe.io] Erro na operação: ${operation}`);
    console.error(`[NFe.io] Status: ${status}`);
    
    let message = error.message;
    
    if (errorData) {
      if (typeof errorData === 'string') {
        message = errorData;
      } else if (errorData.message && typeof errorData.message === 'string') {
        message = errorData.message;
      } else if (errorData.message && typeof errorData.message === 'object') {
        message = JSON.stringify(errorData.message);
      } else if (errorData.errors && Array.isArray(errorData.errors)) {
        message = errorData.errors.map((e: any) => (typeof e === 'object' ? JSON.stringify(e) : e)).join(', ');
      } else if (errorData.error && typeof errorData.error === 'string') {
        message = errorData.error;
      } else {
        message = JSON.stringify(errorData);
      }
    }
    
    console.error(`[NFe.io] Mensagem processada: ${message}`);
    
    throw new Error(`Erro no NFe.io (${operation}): ${message}`);
  }

  async listCompanies(): Promise<NFEIOCompanyResponse[]> {
    const { url, headers } = this.getRequestConfig('/companies');
    try {
      const response = await axios.get(url, { headers });
      return response.data.companies;
    } catch (error: any) {
      this.handleError('listCompanies', error);
      throw error;
    }
  }

  async createCompany(data: NFEIOCompanyInput): Promise<NFEIOCompanyResponse> {
    const { url, headers } = this.getRequestConfig('/companies');
    try {
      const response = await axios.post(url, data, { headers });
      return response.data;
    } catch (error: any) {
      this.handleError('createCompany', error);
      throw error;
    }
  }

  async getCompany(companyIdOrTaxNumber: string): Promise<NFEIOCompanyResponse> {
    const { url, headers } = this.getRequestConfig(`/companies/${companyIdOrTaxNumber}`);
    try {
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error: any) {
      this.handleError('getCompany', error);
      throw error;
    }
  }

  async updateCompany(companyId: string, data: NFEIOCompanyInput): Promise<NFEIOCompanyResponse> {
    const { url, headers } = this.getRequestConfig(`/companies/${companyId}`);
    try {
      const response = await axios.put(url, data, { headers });
      return response.data;
    } catch (error: any) {
      this.handleError('updateCompany', error);
      throw error;
    }
  }

  async deleteCompany(companyId: string): Promise<any> {
    const { url, headers } = this.getRequestConfig(`/companies/${companyId}`);
    try {
      const response = await axios.delete(url, { headers });
      return response.data;
    } catch (error: any) {
      this.handleError('deleteCompany', error);
      throw error;
    }
  }

  async uploadCertificate(companyId: string, certificateData: { file: Buffer, fileName: string, password?: string }): Promise<any> {
    const { url } = this.getRequestConfig(`/companies/${companyId}/certificate`);
    
    try {
      const form = new FormData();
      form.append('file', certificateData.file, {
        filename: certificateData.fileName,
        contentType: 'application/x-pkcs12'
      });
      
      if (certificateData.password) {
        form.append('password', certificateData.password);
      }

      const response = await axios.post(url, form, {
        headers: {
          ...form.getHeaders(),
          'Authorization': this.apiKey,
          'Accept': 'application/json'
        }
      });
      
      return response.data;
    } catch (error: any) {
      this.handleError('uploadCertificate', error);
      throw error;
    }
  }

  async emitServiceInvoice(data: NFEIOServiceInvoiceInput): Promise<any> {
    const { companyId, ...invoiceData } = data;
    const { url, headers } = this.getRequestConfig(`/companies/${companyId}/serviceinvoices`);
    try {
      const response = await axios.post(url, invoiceData, { headers });
      return response.data;
    } catch (error: any) {
      this.handleError('emitServiceInvoice', error);
      throw error;
    }
  }

  async getServiceInvoice(companyId: string, invoiceId: string): Promise<any> {
    const { url, headers } = this.getRequestConfig(`/companies/${companyId}/serviceinvoices/${invoiceId}`);
    try {
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error: any) {
      this.handleError('getServiceInvoice', error);
      throw error;
    }
  }

  async getServiceInvoicePdfUrl(companyId: string, invoiceId: string): Promise<string | undefined> {
    const { url, headers } = this.getRequestConfig(`/companies/${companyId}/serviceinvoices/${invoiceId}/pdf`);

    // 1) Tenta capturar redirect explícito (Location)
    try {
      const redirectResponse = await axios.get(url, {
        headers,
        maxRedirects: 0,
        validateStatus: () => true,
      });

      const locationHeader = redirectResponse.headers?.location;
      if (typeof locationHeader === 'string' && locationHeader.startsWith('http')) {
        return locationHeader;
      }

      const redirectData = redirectResponse.data;
      if (typeof redirectData === 'string' && redirectData.startsWith('http')) return redirectData;
      if (redirectData?.url && typeof redirectData.url === 'string') return redirectData.url;
      if (redirectData?.pdfUrl && typeof redirectData.pdfUrl === 'string') return redirectData.pdfUrl;
      if (redirectData?.pdf?.url && typeof redirectData.pdf.url === 'string') return redirectData.pdf.url;
    } catch {
      // segue fallback
    }

    // 2) Segue redirects e tenta extrair URL final/estrutura retornada
    try {
      const response = await axios.get(url, {
        headers,
        responseType: 'arraybuffer',
        maxRedirects: 10,
      });

      const finalUrl = response.request?.res?.responseUrl;
      if (typeof finalUrl === 'string' && finalUrl.startsWith('http')) {
        return finalUrl;
      }

      const data = response.data;
      if (typeof data === 'string' && data.startsWith('http')) return data;
      if (data?.url && typeof data.url === 'string') return data.url;
      if (data?.pdfUrl && typeof data.pdfUrl === 'string') return data.pdfUrl;
      if (data?.pdf?.url && typeof data.pdf.url === 'string') return data.pdf.url;

      return undefined;
    } catch (error: any) {
      this.handleError('getServiceInvoicePdfUrl', error);
      throw error;
    }
  }

  async getServiceInvoicePdfBinary(companyId: string, invoiceId: string): Promise<Buffer | undefined> {
    const { url, headers } = this.getRequestConfig(`/companies/${companyId}/serviceinvoices/${invoiceId}/pdf`);
    try {
      const response = await axios.get(url, {
        headers,
        responseType: 'arraybuffer',
        maxRedirects: 10,
      });

      const contentType = String(response.headers['content-type'] || '').toLowerCase();
      if (contentType.includes('application/pdf')) {
        return Buffer.from(response.data);
      }
      return undefined;
    } catch (error: any) {
      this.handleError('getServiceInvoicePdfBinary', error);
      throw error;
    }
  }

  async cancelServiceInvoice(companyId: string, invoiceId: string): Promise<any> {
    const { url, headers } = this.getRequestConfig(`/companies/${companyId}/serviceinvoices/${invoiceId}`);
    try {
      const response = await axios.delete(url, { headers });
      return response.data;
    } catch (error: any) {
      this.handleError('cancelServiceInvoice', error);
      throw error;
    }
  }
}
