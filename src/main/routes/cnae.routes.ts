import { Router, Request, Response } from 'express';
import { z } from 'zod';
import cnaes from '@/data/reference/cnaes.json';

const router = Router();

function getSingleValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

const listQuerySchema = z.object({
  query: z.string().trim().optional(),
  level: z.enum(['section', 'division', 'group', 'class', 'subclass']).optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

router.get('/', (req: Request, res: Response) => {
  try {
    const { query, level, limit } = listQuerySchema.parse(req.query);
    const normalizedQuery = query ? normalizeText(query) : '';

    const filtered = cnaes.filter((item) => {
      if (level && item.level !== level) return false;
      if (!normalizedQuery) return true;

      return (
        item.code.includes(query || '') ||
        item.normalizedDescription.includes(normalizedQuery)
      );
    });

    return res.status(200).json({
      total: filtered.length,
      items: filtered.slice(0, limit).map((item) => ({
        code: item.code,
        level: item.level,
        description: item.description,
        sectionCode: item.sectionCode,
        divisionCode: item.divisionCode,
        groupCode: item.groupCode,
        classCode: item.classCode,
        subclassCode: item.subclassCode,
      })),
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Parâmetros inválidos', details: error.errors });
    }
    return res.status(500).json({ error: error.message });
  }
});

router.get('/:code', (req: Request, res: Response) => {
  const code = getSingleValue(req.params.code).trim();
  const item = cnaes.find((entry) => entry.code === code);

  if (!item) {
    return res.status(404).json({ error: 'CNAE não encontrado' });
  }

  return res.status(200).json(item);
});

export default router;
