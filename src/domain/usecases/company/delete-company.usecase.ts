export interface DeleteCompanyDTO {
  id: string;
  userId: string; // Para validar propriedade
}

export interface DeleteCompanyUseCase {
  execute(data: DeleteCompanyDTO): Promise<void>;
}
