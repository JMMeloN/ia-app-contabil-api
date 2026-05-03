import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DbLogin } from './db-login.usecase';
import { UserRepository } from '@/data/protocols/user.repository';
import { UserWithPassword } from '@/domain/models/user.model';
import bcrypt from 'bcryptjs';

const makeUserRepository = (): UserRepository => ({
  create: vi.fn(),
  findByEmail: vi.fn(),
  findById: vi.fn(),
  findByIdWithPassword: vi.fn(),
  update: vi.fn(),
  updatePassword: vi.fn(),
});

const makeFakeUser = (): UserWithPassword => ({
  id: 'user-id',
  email: 'user@email.com',
  name: 'User Name',
  role: 'CLIENTE',
  password: bcrypt.hashSync('correct-password', 10),
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('DbLogin', () => {
  let userRepository: UserRepository;
  let sut: DbLogin;

  beforeEach(() => {
    userRepository = makeUserRepository();
    sut = new DbLogin(userRepository, 'jwt-secret', '7d');
  });

  it('deve lançar erro quando email não for encontrado', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

    await expect(sut.execute({ email: 'notfound@email.com', password: '123' }))
      .rejects.toThrow('Email ou senha inválidos');
  });

  it('deve lançar erro quando a senha estiver incorreta', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(makeFakeUser());

    await expect(sut.execute({ email: 'user@email.com', password: 'wrong-password' }))
      .rejects.toThrow('Email ou senha inválidos');
  });

  it('deve retornar o usuário e o token quando as credenciais forem válidas', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(makeFakeUser());

    const result = await sut.execute({ email: 'user@email.com', password: 'correct-password' });

    expect(result.accessToken).toBeTruthy();
    expect(result.user.email).toBe('user@email.com');
    expect(result.user).not.toHaveProperty('password');
  });

  it('deve retornar accessTokenExpiresAt no resultado', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(makeFakeUser());

    const result = await sut.execute({ email: 'user@email.com', password: 'correct-password' });

    expect(result.accessTokenExpiresAt).toBeTruthy();
  });
});
