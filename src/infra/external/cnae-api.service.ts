import axios from 'axios';
import { CnaeExternalService } from '@/data/protocols/cnae-external.service';
import { CreateCnaeData } from '@/data/protocols/cnae.repository';

type RawCnae = Record<string, unknown>;

export class CnaeApiService implements CnaeExternalService {
  constructor(
    private readonly apiUrl: string,
    private readonly bearerToken: string,
  ) {}

  async fetchAll(): Promise<CreateCnaeData[]> {
    const response = await axios.get(this.apiUrl, {
      headers: {
        Authorization: `Bearer ${this.bearerToken}`,
        Accept: 'application/json',
      },
      timeout: 30000,
    });

    const payload = response.data;
    const raw: RawCnae[] = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.items)
          ? payload.items
          : Array.isArray(payload?.cnaes)
            ? payload.cnaes
            : [];

    return raw
      .map((item) => ({
        codCnae: String(item.codigo ?? item.cnae ?? item.code ?? item.id ?? '').trim(),
        descricaoCnae: String(item.descricao ?? item.description ?? item.denominacao ?? '').trim(),
      }))
      .filter((item) => item.codCnae && /^[0-9]+$/.test(item.codCnae) && item.descricaoCnae);
  }
}
