import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DbRegister } from './db-register.usecase';
import { UserRepository } from '@/data/protocols/user.repository';
import { UserModel } from '@/domain/models/user.model';

const makeUserRepository = (): UserRepository => ({
  create: vi.fn(),
  findByEmail: vi.fn(),
  findById: vi.fn(),
  findByIdWithPassword: vi.fn(),
  update: vi.fn(),
  updatePassword: vi.fn(),
});

const makeFakeUser = (): UserModel => ({
  id: 'user-id',
  email: 'new@email.com',
  name: 'New User',
  role: 'CLIENTE',
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('DbRegister', () => {
  let userRepository: UserRepository;
  let sut: DbRegister;

  beforeEach(() => {
    userRepository = makeUserRepository();
    sut = new DbRegister(userRepository);
  });

  it('deve lançar erro quando o email já estiver cadastrado', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue({
      ...makeFakeUser(),
      password: 'hashed',
    });

    await expect(sut.execute({ email: 'new@email.com', password: '123456', name: 'New User' }))
      .rejects.toThrow('Email já cadastrado');
  });

  it('deve criar o usuário quando o email não estiver em uso', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(userRepository.create).mockResolvedValue(makeFakeUser());

    const result = await sut.execute({ email: 'new@email.com', password: '123456', name: 'New User' });

    expect(result.email).toBe('new@email.com');
    expect(result.id).toBe('user-id');
  });

  it('deve fazer hash da senha antes de salvar', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(userRepository.create).mockResolvedValue(makeFakeUser());

    await sut.execute({ email: 'new@email.com', password: '123456', name: 'New User' });

    const createCall = vi.mocked(userRepository.create).mock.calls[0][0];
    expect(createCall.password).not.toBe('123456');
    expect(createCall.password).toMatch(/^\$2[ab]\$/);
  });
});
