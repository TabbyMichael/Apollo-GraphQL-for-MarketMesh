import { AuthenticationError, ForbiddenError } from 'apollo-server-errors';
import resolvers from '../resolvers/userResolver';
import { UserService } from '../userService';
import { Context } from '../context';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

// Define UserRole locally for test isolation
enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  SELLER = 'SELLER',
}

describe('User Resolver', () => {
  let userServiceMock: DeepMockProxy<UserService>;
  let mockContext: Context;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.CUSTOMER,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: null,
    refreshToken: null,
    password: 'hashedpassword',
  };

  beforeEach(() => {
    userServiceMock = mockDeep<UserService>();
    mockContext = {
      prisma: {} as any, // Not needed for resolver tests
      userService: userServiceMock,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Query.me', () => {
    it('should return a user for an authenticated request', async () => {
      mockContext.userId = '1';
      userServiceMock.me.mockResolvedValue(mockUser);

      const result = await resolvers.Query!.me!({}, {}, mockContext, {} as any);

      expect(result).toEqual(mockUser);
      expect(userServiceMock.me).toHaveBeenCalledWith('1');
    });

    it('should throw AuthenticationError if not authenticated', () => {
      mockContext.userId = undefined;

      expect(() =>
        resolvers.Query!.me!({}, {}, mockContext, {} as any)
      ).toThrow(new AuthenticationError('Not authenticated'));

      expect(userServiceMock.me).not.toHaveBeenCalled();
    });
  });

  describe('Query.users', () => {
    it('should throw ForbiddenError for non-ADMIN users', () => {
      mockContext.role = UserRole.CUSTOMER;

      expect(() =>
        resolvers.Query!.users!({}, { role: null, page: 1, limit: 10 }, mockContext, {} as any)
      ).toThrow(new ForbiddenError('Not authorized'));

      expect(userServiceMock.users).not.toHaveBeenCalled();
    });
  });

  describe('Mutation.updateProfile', () => {
    it('should throw AuthenticationError if not authenticated', () => {
      mockContext.userId = undefined;
      const input = { firstName: 'New' };

      expect(() =>
        resolvers.Mutation!.updateProfile!({}, { input }, mockContext, {} as any)
      ).toThrow(new AuthenticationError('Not authenticated'));

      expect(userServiceMock.updateProfile).not.toHaveBeenCalled();
    });
  });

  describe('Mutation.deleteAccount', () => {
    it('should throw AuthenticationError if not authenticated', () => {
      mockContext.userId = undefined;

      expect(() =>
        resolvers.Mutation!.deleteAccount!({}, {}, mockContext, {} as any)
      ).toThrow(new AuthenticationError('Not authenticated'));

      expect(userServiceMock.deleteAccount).not.toHaveBeenCalled();
    });
  });
});