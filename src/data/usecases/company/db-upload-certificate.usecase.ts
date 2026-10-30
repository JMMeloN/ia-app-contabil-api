import { UploadCertificateUseCase, UploadCertificateDTO } from '@/domain/usecases/company/upload-certificate.usecase';
import { CompanyRepository } from '@/data/protocols/company.repository';
import { NFEIOServiceProtocol } from '@/data/protocols/nfeio.service';
import { NfeioCompanySync } from './nfeio-company-sync';

export class DbUploadCertificate implements UploadCertificateUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly nfeioService: NFEIOServiceProtocol,
    private readonly nfeioSync: NfeioCompanySync,
  ) {}

  async execute(data: UploadCertificateDTO): Promise<any> {
    const company = await this.companyRepository.findById(data.companyId);
    if (!company) {
      throw new Error('Empresa não encontrada');
    }

    if (company.userId !== data.userId) {
      throw new Error('Você não tem permissão para alterar esta empresa');
    }

    // Links the company to NFe.io first, so uploading right after creation works.
    const linked = await this.nfeioSync.ensureLinked(company);

    const result = await this.nfeioService.uploadCertificate(linked.nfeioCompanyId!, {
      file: data.file,
      fileName: data.fileName,
      password: data.password,
    });

    const certificate = result?.certificate ?? result ?? {};
    await this.companyRepository.update(company.id, {
      certificateStatus: certificate.status || 'Uploaded',
      certificateThumbprint: certificate.thumbprint || undefined,
      certificateExpiresAt: certificate.expiresOn ? new Date(certificate.expiresOn) : undefined,
    });

    return result;
  }
}
