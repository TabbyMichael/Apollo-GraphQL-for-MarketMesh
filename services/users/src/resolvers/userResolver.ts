import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Resolvers } from '../generated/graphql';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const prisma = new PrismaClient();

// Utility function to generate JWT token
const generateToken = (userId: string, role: UserRole): string => {
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

const resolvers: Resolvers = {
  User: {
    // Resolve the fullName field by combining firstName and lastName
    fullName: (user) => {
      if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
      }
      return user.firstName || user.lastName || '';
    },
  },
  Query: {
    me: async (_, __, { userId }) => {
      if (!userId) throw new Error('Not authenticated');
      
      return prisma.user.findUnique({
        where: { id: userId },
      });
    },
    user: async (_, { id }, { userId, role }) => {
      // Only allow admins to fetch other users
      if (id !== userId && role !== 'ADMIN') {
        throw new Error('Not authorized');
      }
      
      return prisma.user.findUnique({
        where: { id },
      });
    },
    users: async (_, { role, page = 1, limit = 20 }, { role: userRole }) => {
      // Only allow admins to list users
      if (userRole !== 'ADMIN') {
        throw new Error('Not authorized');
      }
      
      const skip = (page - 1) * limit;
      const where = role ? { role } : {};
      
      return prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
    },
  },
  Mutation: {
    signup: async (_, { input }) => {
      const { email, password, firstName, lastName, role } = input;
      
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      
      if (existingUser) {
        throw new Error('User already exists');
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role,
        },
      });
      
      // Generate token
      const token = generateToken(user.id, user.role);
      
      return {
        token,
        user,
      };
    },
    
    login: async (_, { input }) => {
      const { email, password } = input;
      
      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });
      
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new Error('Invalid credentials');
      }
      
      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });
      
      // Generate token
      const token = generateToken(user.id, user.role);
      
      return {
        token,
        user,
      };
    },
    
    updateProfile: async (_, { input }, { userId }) => {
      if (!userId) throw new Error('Not authenticated');
      
      const { email, firstName, lastName, role } = input;
      
      // Check if email is already taken
      if (email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email,
            NOT: { id: userId },
          },
        });
        
        if (existingUser) {
          throw new Error('Email already in use');
        }
      }
      
      // Update user
      return prisma.user.update({
        where: { id: userId },
        data: {
          ...(email && { email }),
          ...(firstName !== undefined && { firstName }),
          ...(lastName !== undefined && { lastName }),
          ...(role && { role }),
        },
      });
    },
    
    deleteAccount: async (_, __, { userId }) => {
      if (!userId) throw new Error('Not authenticated');
      
      await prisma.user.delete({
        where: { id: userId },
      });
      
      return true;
    },
  },
};

export default resolvers;
