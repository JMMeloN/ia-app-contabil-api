export interface NbsModel {
  id: string;
  nbs: string;
  descricaoNbs: string;
  psOnerosa?: boolean | null;
  adqExterior?: boolean | null;
  indop: string;
  localIncidencia: string;
  cClassTrib: string;
  nomeClassTrib: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNbsData {
  nbs: string;
  descricaoNbs: string;
  psOnerosa?: boolean;
  adqExterior?: boolean;
  indop: string;
  localIncidencia: string;
  cClassTrib: string;
  nomeClassTrib: string;
}

export interface UpdateNbsData {
  nbs?: string;
  descricaoNbs?: string;
  psOnerosa?: boolean | null;
  adqExterior?: boolean | null;
  indop?: string;
  localIncidencia?: string;
  cClassTrib?: string;
  nomeClassTrib?: string;
}

export interface NbsRepository {
  create(data: CreateNbsData): Promise<NbsModel>;
  findAll(): Promise<NbsModel[]>;
  findById(id: string): Promise<NbsModel | null>;
  findByCode(nbs: string): Promise<NbsModel | null>;
  update(id: string, data: UpdateNbsData): Promise<NbsModel>;
  delete(id: string): Promise<void>;
}
