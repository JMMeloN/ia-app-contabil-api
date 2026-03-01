export interface UploadCertificateDTO {
  companyId: string;
  userId: string;
  file: Buffer;
  fileName: string;
  password?: string;
}

export interface UploadCertificateUseCase {
  execute(data: UploadCertificateDTO): Promise<any>;
}
