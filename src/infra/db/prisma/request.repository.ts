import {
  RequestRepository,
  CreateRequestData,
  UpdateRequestStatusData,
  FindRequestsFilters,
} from '@/data/protocols/request.repository';
import { RequestModel } from '@/domain/models/request.model';
import { prisma } from './client';

export class PrismaRequestRepository implements RequestRepository {
  async create(data: CreateRequestData): Promise<RequestModel> {
    const request = await prisma.request.create({
      data,
    });

    return request;
  }

  async findById(id: string): Promise<RequestModel | null> {
    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            nome: true,
            cnpj: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return request;
  }

  async findMany(filters?: FindRequestsFilters): Promise<RequestModel[]> {
    const requests = await prisma.request.findMany({
      where: {
        ...(filters?.userId && { userId: filters.userId }),
        ...(filters?.status && { status: filters.status }),
      },
      include: {
        company: {
          select: {
            nome: true,
            cnpj: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests;
  }

  async updateStatus(id: string, data: UpdateRequestStatusData): Promise<RequestModel> {
    const request = await prisma.request.update({
      where: { id },
      data,
    });

    return request;
  }
}
