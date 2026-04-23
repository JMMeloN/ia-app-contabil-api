import { Router, Response } from 'express';
import axios from 'axios';
import { authMiddleware, AuthRequest } from '@/main/middlewares/auth.middleware';
import { env } from '@/main/config/env';

type RawCnaeRecord = Record<string, unknown>;

type NormalizedCnae = {
  id: string;
  code: string;
  description: string;
};

const router = Router();

router.use(authMiddleware);

let cnaeCache: { expiresAt: number; items: NormalizedCnae[] } | null = null;

const CACHE_TTL_MS = 1000 * 60 * 30;

function pickFirstString(record: RawCnaeRecord, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (typeof value === 'number') {
      return String(value);
    }
  }
  return '';
}

function normalizeCnae(record: RawCnaeRecord, index: number): NormalizedCnae {
  const code = pickFirstString(record, [
    'cnae',
    'codigo',
    'code',
    'subclasse',
    'classe',
    'id',
  ]);
  const description = pickFirstString(record, [
    'descricao',
    'description',
    'denominacao',
    'titulo',
    'nome',
  ]);

  return {
    id: code || `cnae-${index}`,
    code,
    description,
  };
}

async function fetchCnaes(): Promise<NormalizedCnae[]> {
  if (cnaeCache && cnaeCache.expiresAt > Date.now()) {
    return cnaeCache.items;
  }

  if (!env.listaCnaeUrl || !env.listaCnaeBearerToken) {
    throw new Error('Integração de CNAE não configurada no ambiente');
  }

  const response = await axios.get(env.listaCnaeUrl, {
    headers: {
      Authorization: `Bearer ${env.listaCnaeBearerToken}`,
      Accept: 'application/json',
    },
    timeout: 30000,
  });

  const payload = response.data;
  const rawItems = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload?.cnaes)
          ? payload.cnaes
          : [];

  const items = (rawItems as unknown[])
    .map((item: unknown, index: number) => normalizeCnae((item || {}) as RawCnaeRecord, index))
    .filter((item: NormalizedCnae) => item.code || item.description);

  cnaeCache = {
    expiresAt: Date.now() + CACHE_TTL_MS,
    items,
  };

  return items;
}

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const allItems = await fetchCnaes();
    const search = String(req.query.search || '').trim().toLowerCase();
    const limit = Number(req.query.limit || 50);

    const filteredItems = search
      ? allItems.filter((item) =>
          [item.code, item.description]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(search))
        )
      : allItems;

    return res.status(200).json({
      items: filteredItems.slice(0, Number.isFinite(limit) ? Math.max(limit, 1) : 50),
      total: filteredItems.length,
    });
  } catch (error: any) {
    const status = error.response?.status || 500;
    return res.status(status).json({
      error: error.message || 'Erro ao consultar CNAEs',
    });
  }
});

export default router;
