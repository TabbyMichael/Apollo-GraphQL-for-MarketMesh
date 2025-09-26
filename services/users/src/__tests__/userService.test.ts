import type { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { UserService } from '../userService';
import { AuthenticationError, ForbiddenError, UserInputError } from 'apollo-server-errors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock external dependencies
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

// Define UserRole locally for test isolation
enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  SELLER = 'SELLER',
}

describe('UserService', () => {
  let userService: UserService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedpassword',
    role: UserRole.CUSTOMER,
    firstName: 'Test',
    lastName: 'User',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: null,
    refreshToken: null,
  };

  beforeEach(() => {
    prismaMock = mockDeep<PrismaClient>();
    userService = new UserService(prismaMock);

    // Setup default mock returns with correct types
    (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
    (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
    (mockedJwt.sign as jest.Mock).mockReturnValue('test-token');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('me', () => {
    it('should throw AuthenticationError if no userId is provided', async () => {
      // Pass undefined instead of null to match the expected type
      await expect(userService.me(undefined as any)).rejects.toThrow(new AuthenticationError('Not authenticated'));
    });

    it('should return a user if userId is valid', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      const user = await userService.me('1');
      expect(user).toEqual(mockUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });

  describe('user', () => {
    it('should throw ForbiddenError if a non-admin tries to access another user', async () => {
      await expect(userService.user('2', '1', UserRole.CUSTOMER as any)).rejects.toThrow(new ForbiddenError('Not authorized'));
    });

    it('should allow an admin to access another user', async () => {
        prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
        await userService.user('2', '1', UserRole.ADMIN as any);
        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { id: '2' } });
    });
  });

  describe('signup', () => {
    it('should throw UserInputError if user already exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      await expect(userService.signup({ email: 'test@example.com', password: 'password' })).rejects.toThrow(new UserInputError('User already exists with this email'));
    });

    it('should create a new user and return token', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue(mockUser as any);

      const result = await userService.signup({ email: 'new@test.com', password: 'password' });

      expect(result.user).toEqual(mockUser);
      expect(result.token).toBe('test-token');
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(prismaMock.user.create).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should throw AuthenticationError for invalid credentials if user does not exist', async () => {
        prismaMock.user.findUnique.mockResolvedValue(null);
        await expect(userService.login({ email: 'wrong@test.com', password: 'password' })).rejects.toThrow(new AuthenticationError('Invalid credentials'));
    });

    it('should throw AuthenticationError for invalid credentials if password does not match', async () => {
        (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);
        prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
        await expect(userService.login({ email: 'test@example.com', password: 'wrongpassword' })).rejects.toThrow(new AuthenticationError('Invalid credentials'));
    });

    it('should return a token and user for valid credentials', async () => {
        prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
        const updatedUser = { ...mockUser, lastLogin: new Date() };
        prismaMock.user.update.mockResolvedValue(updatedUser as any);
        const result = await userService.login({ email: 'test@example.com', password: 'password' });
        expect(result.token).toBe('test-token');
        expect(result.user).toEqual(mockUser);
        expect(prismaMock.user.update).toHaveBeenCalled();
    });
  });

  describe('updateProfile', () => {
    it('should throw UserInputError if email is already taken', async () => {
      prismaMock.user.findFirst.mockResolvedValue(mockUser as any);
      await expect(userService.updateProfile('2', { email: 'test@example.com' })).rejects.toThrow(new UserInputError('Email already in use'));
    });
  });
});