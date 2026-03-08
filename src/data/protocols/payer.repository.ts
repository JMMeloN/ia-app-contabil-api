export interface PayerModel {
  id: string;
  name: string;
  document: string;
  email?: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePayerData {
  name: string;
  document: string;
  email?: string;
  userId: string;
}

export interface UpdatePayerData {
  name?: string;
  document?: string;
  email?: string;
}

export interface PayerRepository {
  create(data: CreatePayerData): Promise<PayerModel>;
  findById(id: string): Promise<PayerModel | null>;
  findByUserId(userId: string): Promise<PayerModel[]>;
  findByUserIdAndDocument(userId: string, document: string): Promise<PayerModel | null>;
  update(id: string, data: UpdatePayerData): Promise<PayerModel>;
  delete(id: string): Promise<void>;
}
