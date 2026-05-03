export interface CnaeModel {
  id: string;
  codCnae: string;
  descricaoCnae: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCnaeData {
  codCnae: string;
  descricaoCnae: string;
}

export interface UpdateCnaeData {
  codCnae?: string;
  descricaoCnae?: string;
}

export interface CnaeRepository {
  create(data: CreateCnaeData): Promise<CnaeModel>;
  createMany(data: CreateCnaeData[]): Promise<number>;
  count(): Promise<number>;
  findAll(search?: string): Promise<CnaeModel[]>;
  findById(id: string): Promise<CnaeModel | null>;
  findByCode(codCnae: string): Promise<CnaeModel | null>;
  update(id: string, data: UpdateCnaeData): Promise<CnaeModel>;
  delete(id: string): Promise<void>;
}
