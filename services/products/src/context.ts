import { PrismaClient } from '@prisma/client';
import { ProductService } from './productService';
import { getUserIdAndRole } from '@marketmesh/utils';
import { ExpressContext } from 'apollo-server-express';

const prisma = new PrismaClient();
const productService = new ProductService(prisma);

export interface Context {
  productService: ProductService;
  userId: string | null;
  userRole: string | null;
}

export const createContext = ({ req }: ExpressContext): Context => {
  const token = req.headers.authorization || '';
  const { userId, userRole } = getUserIdAndRole(token);

  return {
    productService,
    userId,
    userRole,
  };
};