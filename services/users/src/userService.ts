import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AuthenticationError, ForbiddenError, UserInputError } from 'apollo-server-errors';
import { generateToken } from '@marketmesh/utils';
import { CreateUserInput, UpdateUserInput, LoginInput } from './generated/graphql';

export class UserService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async me(userId: string) {
    if (!userId) {
      throw new AuthenticationError('Not authenticated');
    }
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  async user(id: string, currentUserId: string, currentUserRole: UserRole) {
    if (id !== currentUserId && currentUserRole !== 'ADMIN') {
      throw new ForbiddenError('Not authorized');
    }
    return this.prisma.user.findUnique({ where: { id } });
  }

  async users(role: UserRole | null | undefined, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const where = role ? { role } : {};
    return this.prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async signup(input: CreateUserInput) {
    const { email, password, firstName, lastName, role } = input;
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new UserInputError('User already exists with this email');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
      },
    });
    const token = generateToken(user.id, user.role);
    return { token, user };
  }

  async login(input: LoginInput) {
    const { email, password } = input;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new AuthenticationError('Invalid credentials');
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });
    const token = generateToken(user.id, user.role);
    return { token, user };
  }

  async updateProfile(userId: string, input: UpdateUserInput) {
    const { email, firstName, lastName, role } = input;
    if (email) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email,
          NOT: { id: userId },
        },
      });
      if (existingUser) {
        throw new UserInputError('Email already in use');
      }
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(email && { email }),
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(role && { role }),
      },
    });
  }

  async deleteAccount(userId: string) {
    await this.prisma.user.delete({ where: { id: userId } });
    return true;
  }
}