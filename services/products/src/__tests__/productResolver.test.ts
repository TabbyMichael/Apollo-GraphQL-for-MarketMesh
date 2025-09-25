import { PrismaClient } from '@prisma/client';
import { resolvers } from '../resolvers/productResolver';

// Mock Prisma client
jest.mock('@prisma/client', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    stock: 10,
    sellerId: 'seller-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      product: {
        findMany: jest.fn().mockResolvedValue([mockProduct]),
        findUnique: jest.fn().mockResolvedValue(mockProduct),
        create: jest.fn().mockResolvedValue(mockProduct),
        update: jest.fn().mockResolvedValue(mockProduct),
        delete: jest.fn().mockResolvedValue(mockProduct),
      },
    })),
  };
});

describe('Product Resolver', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Query', () => {
    it('should return an array of products', async () => {
      const result = await resolvers.Query.products(
        {},
        {},
        { prisma, token: null },
        {} as any
      );

      expect(Array.isArray(result)).toBe(true);
      expect(prisma.product.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return a single product', async () => {
      const result = await resolvers.Query.product(
        {},
        { id: '1' },
        { prisma, token: null },
        {} as any
      );

      expect(result).toHaveProperty('id', '1');
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('Mutation', () => {
    it('should create a product', async () => {
      const input = {
        name: 'New Product',
        description: 'New Description',
        price: 199.99,
        stock: 5,
        sellerId: 'seller-1',
      };

      const result = await resolvers.Mutation.createProduct(
        {},
        { input },
        { prisma, token: null },
        {} as any
      );

      expect(result).toHaveProperty('id');
      expect(prisma.product.create).toHaveBeenCalledWith({
        data: input,
      });
    });

    it('should update a product', async () => {
      const updates = {
        name: 'Updated Product',
        price: 249.99,
      };

      const result = await resolvers.Mutation.updateProduct(
        {},
        { id: '1', input: updates },
        { prisma, token: null },
        {} as any
      );

      expect(result).toHaveProperty('id');
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updates,
      });
    });

    it('should delete a product', async () => {
      const result = await resolvers.Mutation.deleteProduct(
        {},
        { id: '1' },
        { prisma, token: null },
        {} as any
      );

      expect(result).toBe(true);
      expect(prisma.product.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
