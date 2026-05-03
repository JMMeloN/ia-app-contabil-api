import { CreateCnaeData } from './cnae.repository';

export interface CnaeExternalService {
  fetchAll(): Promise<CreateCnaeData[]>;
}
