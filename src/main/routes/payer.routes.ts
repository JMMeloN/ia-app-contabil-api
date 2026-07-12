import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '@/main/middlewares/auth.middleware';
import { PrismaPayerRepository } from '@/infra/db/prisma/payer.repository';
import { PrismaCompanyRepository } from '@/infra/db/prisma/company.repository';
import { NFEIOService } from '@/infra/nfeio/nfeio.service';

const router = Router();
const payerRepository = new PrismaPayerRepository();
const companyRepository = new PrismaCompanyRepository();
const nfeioService = new NFEIOService();

router.use(authMiddleware);

const createPayerSchema = z.object({
  companyId: z.string().uuid('ID da empresa inválido'),
  name: z.string().min(2, 'Nome é obrigatório'),
  document: z.string().min(11, 'Documento inválido'),
  type: z.enum(['LEGAL_ENTITY', 'NATURAL_PERSON']).optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  endereco: z.string().optional(),
  rua: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  complemento: z.string().optional(),
  cidade: z.string().optional(),
  codigoCidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
});

const updatePayerSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório').optional(),
  document: z.string().min(11, 'Documento inválido').optional(),
  type: z.enum(['LEGAL_ENTITY', 'NATURAL_PERSON']).optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  endereco: z.string().optional(),
  rua: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  complemento: z.string().optional(),
  cidade: z.string().optional(),
  codigoCidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
});

function normalizeDocument(document: string): string {
  return document.replace(/\D/g, '');
}

function buildAddress(input: {
  endereco?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  complemento?: string;
  cidade?: string;
  codigoCidade?: string;
  estado?: string;
  cep?: string;
}, company: {
  endereco?: string | null;
  rua?: string | null;
  numero?: string | null;
  bairro?: string | null;
  complemento?: string | null;
  cidade: string;
  codigoCidade?: string | null;
  estado: string;
  cep: string;
}) {
  const fullAddress = input.endereco || company.endereco || '';

  return {
    street: input.rua || fullAddress.split(',')[0] || company.rua || 'Não informado',
    number: input.numero || fullAddress.split(',')[1]?.trim() || company.numero || 'S/N',
    district: input.bairro || company.bairro || 'Centro',
    additionalInformation: input.complemento || company.complemento || undefined,
    city: {
      code: input.codigoCidade || company.codigoCidade || undefined,
      name: input.cidade || company.cidade,
    },
    state: input.estado || company.estado,
    postalCode: (input.cep || company.cep).replace(/\D/g, ''),
    country: 'BRA',
  };
}

async function syncPayerWithNfeio(
  company: NonNullable<Awaited<ReturnType<typeof companyRepository.findById>>>,
  payload: {
    id?: string;
    document: string;
    name: string;
    type: 'LEGAL_ENTITY' | 'NATURAL_PERSON';
    email?: string;
    phone?: string;
    endereco?: string;
    rua?: string;
    numero?: string;
    bairro?: string;
    complemento?: string;
    cidade?: string;
    codigoCidade?: string;
    estado?: string;
    cep?: string;
    nfeioPayerId?: string | null;
  }
) {
  if (!company.nfeioCompanyId) {
    throw new Error('Empresa ainda não sincronizada com a NFE.io');
  }

  const data = {
    federalTaxNumber: payload.document,
    name: payload.name,
    email: payload.email || company.email,
    address: buildAddress(payload, company),
  };

  if (payload.type === 'LEGAL_ENTITY') {
    const existing =
      payload.nfeioPayerId
        ? { id: payload.nfeioPayerId }
        : await nfeioService.findLegalPersonByTaxNumber(company.nfeioCompanyId, payload.document);

    if (existing?.id) {
      return nfeioService.updateLegalPerson(company.nfeioCompanyId, existing.id, data);
    }

    return nfeioService.createLegalPerson(company.nfeioCompanyId, data);
  }

  const existing =
    payload.nfeioPayerId
      ? { id: payload.nfeioPayerId }
      : await nfeioService.findNaturalPersonByTaxNumber(company.nfeioCompanyId, payload.document);

  if (existing?.id) {
    return nfeioService.updateNaturalPerson(company.nfeioCompanyId, existing.id, data);
  }

  return nfeioService.createNaturalPerson(company.nfeioCompanyId, data);
}

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const companyId = typeof req.query.companyId === 'string' ? req.query.companyId : undefined;
    if (companyId) {
      const company = await companyRepository.findById(companyId);
      if (!company || company.userId !== req.user!.userId) {
        return res.status(404).json({ error: 'Empresa não encontrada' });
      }

      const payers = await payerRepository.findByCompanyId(companyId);
      return res.status(200).json(payers);
    }

    const payers = await payerRepository.findByUserId(req.user!.userId);
    return res.status(200).json(payers);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = createPayerSchema.parse(req.body);
    const company = await companyRepository.findById(data.companyId);
    if (!company || company.userId !== req.user!.userId) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    const document = normalizeDocument(data.document);
    const existing = await payerRepository.findByCompanyIdAndDocument(data.companyId, document);
    if (existing) {
      return res.status(409).json({ error: 'Tomador já cadastrado para esta empresa' });
    }

    const payer = await payerRepository.create({
      name: data.name,
      document,
      type: data.type,
      email: data.email || undefined,
      phone: data.phone,
      endereco: data.endereco,
      rua: data.rua,
      numero: data.numero,
      bairro: data.bairro,
      complemento: data.complemento,
      cidade: data.cidade,
      codigoCidade: data.codigoCidade,
      estado: data.estado,
      cep: data.cep,
      companyId: data.companyId,
      userId: req.user!.userId,
    });

    try {
      const synced = await syncPayerWithNfeio(company, {
        ...data,
        document,
        type: data.type || 'LEGAL_ENTITY',
        email: data.email || undefined,
      });

      const updated = await payerRepository.update(payer.id, {
        nfeioPayerId: synced.id,
        syncStatus: 'SYNCED',
      });

      return res.status(201).json(updated);
    } catch (error: any) {
      const updated = await payerRepository.update(payer.id, {
        syncStatus: 'FAILED',
      });

      return res.status(201).json({
        ...updated,
        syncError: error.message,
      });
    }
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    return res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = updatePayerSchema.parse(req.body);

    const payer = await payerRepository.findById(id);
    if (!payer || payer.userId !== req.user!.userId) {
      return res.status(404).json({ error: 'Tomador não encontrado' });
    }

    const nextDocument = data.document ? normalizeDocument(data.document) : undefined;
    if (nextDocument && nextDocument !== payer.document) {
      const existing = await payerRepository.findByCompanyIdAndDocument(payer.companyId, nextDocument);
      if (existing) {
        return res.status(409).json({ error: 'Já existe tomador com este documento' });
      }
    }

    const updated = await payerRepository.update(id, {
      name: data.name,
      document: nextDocument,
      type: data.type,
      email: data.email,
      phone: data.phone,
      endereco: data.endereco,
      rua: data.rua,
      numero: data.numero,
      bairro: data.bairro,
      complemento: data.complemento,
      cidade: data.cidade,
      codigoCidade: data.codigoCidade,
      estado: data.estado,
      cep: data.cep,
    });

    const company = await companyRepository.findById(payer.companyId);
    if (!company || company.userId !== req.user!.userId) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    try {
      const synced = await syncPayerWithNfeio(company, {
        id: updated.id,
        document: updated.document,
        name: updated.name,
        type: updated.type,
        email: updated.email || undefined,
        phone: updated.phone || undefined,
        endereco: updated.endereco || undefined,
        rua: updated.rua || undefined,
        numero: updated.numero || undefined,
        bairro: updated.bairro || undefined,
        complemento: updated.complemento || undefined,
        cidade: updated.cidade || undefined,
        codigoCidade: updated.codigoCidade || undefined,
        estado: updated.estado || undefined,
        cep: updated.cep || undefined,
        nfeioPayerId: updated.nfeioPayerId || undefined,
      });

      const syncedPayer = await payerRepository.update(id, {
        nfeioPayerId: synced.id,
        syncStatus: 'SYNCED',
      });

      return res.status(200).json(syncedPayer);
    } catch (error: any) {
      const failed = await payerRepository.update(id, {
        syncStatus: 'FAILED',
      });

      return res.status(200).json({
        ...failed,
        syncError: error.message,
      });
    }
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    return res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const payer = await payerRepository.findById(id);
    if (!payer || payer.userId !== req.user!.userId) {
      return res.status(404).json({ error: 'Tomador não encontrado' });
    }

    await payerRepository.delete(id);
    return res.status(204).send();
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

export default router;
