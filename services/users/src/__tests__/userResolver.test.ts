import { PrismaClient, UserRole } from '@prisma/client';
import { resolvers } from '../resolvers/userResolver';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock bcrypt
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Mock jwt
jest.mock('jsonwebtoken');
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

// Mock Prisma client
jest.mock('@prisma/client', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedpassword',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.CUSTOMER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findUnique: jest.fn().mockResolvedValue(mockUser),
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue(mockUser),
        update: jest.fn().mockResolvedValue(mockUser),
        delete: jest.fn().mockResolvedValue(mockUser),
        findMany: jest.fn().mockResolvedValue([mockUser]),
      },
    })),
    UserRole,
  };
});

describe('User Resolver', () => {
  let prisma: PrismaClient;
  const mockContext = { userId: '1', role: UserRole.CUSTOMER };

  beforeAll(() => {
    prisma = new PrismaClient();
    mockedBcrypt.hash.mockResolvedValue('hashedpassword');
    mockedBcrypt.compare.mockResolvedValue(true);
    mockedJwt.sign.mockReturnValue('test-token' as any);
    mockedJwt.verify.mockReturnValue({ userId: '1', role: UserRole.CUSTOMER } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Query', () => {
    it('should return the current user', async () => {
      const result = await resolvers.Query.me(
        {},
        {},
        { userId: '1' },
        {} as any
      );

      expect(result).toBeDefined();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return a user by ID for admin', async () => {
      const result = await resolvers.Query.user(
        {},
        { id: '1' },
        { userId: 'admin-1', role: UserRole.ADMIN },
        {} as any
      );

      expect(result).toBeDefined();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('Mutation', () => {
    it('should sign up a new user', async () => {
      const input = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        role: UserRole.CUSTOMER,
      };

      const result = await resolvers.Mutation.signup(
        {},
        { input },
        { prisma },
        {} as any
      );

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          ...input,
          password: 'hashedpassword',
        },
      });
    });

    it('should log in a user', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await resolvers.Mutation.login(
        {},
        { input },
        { prisma },
        {} as any
      );

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: input.email },
      });
      expect(prisma.user.update).toHaveBeenCalled();
    });
  });

  describe('User', () => {
    it('should return full name when first and last name are provided', () => {
      const result = resolvers.User.fullName(
        { firstName: 'John', lastName: 'Doe' },
        {},
        {},
        {} as any
      );
      expect(result).toBe('John Doe');
    });

    it('should return first name when only first name is provided', () => {
      const result = resolvers.User.fullName(
        { firstName: 'John', lastName: null },
        {},
        {},
        {} as any
      );
      expect(result).toBe('John');
    });
  });
});
