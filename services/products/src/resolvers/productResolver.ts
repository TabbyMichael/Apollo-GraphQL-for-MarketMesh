import { PrismaClient } from '@prisma/client';
import { Resolvers } from '../generated/graphql';

const prisma = new PrismaClient();

const resolvers: Resolvers = {
  Product: {
    // Resolve the seller field by returning a reference to the User type
    seller: (product) => {
      return { __typename: 'User', id: product.sellerId };
    },
  },
  Query: {
    products: async (_, {
      name,
      minPrice,
      maxPrice,
      sellerId,
      page = 1,
      limit = 20,
    }) => {
      const skip = (page - 1) * limit;
      
      const where = {
        ...(name && { name: { contains: name, mode: 'insensitive' } }),
        ...(minPrice !== undefined && { price: { gte: minPrice } }),
        ...(maxPrice !== undefined && { 
          price: { 
            ...(minPrice !== undefined ? { gte: minPrice } : {}),
            lte: maxPrice 
          } 
        }),
        ...(sellerId && { sellerId }),
      };

      return prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
    },
    product: (_, { id }) => {
      return prisma.product.findUnique({
        where: { id },
      });
    },
  },
  Mutation: {
    createProduct: async (_, { input }) => {
      return prisma.product.create({
        data: {
          name: input.name,
          description: input.description,
          price: input.price,
          stock: input.stock,
          sellerId: input.sellerId,
        },
      });
    },
    updateProduct: async (_, { id, input }) => {
      return prisma.product.update({
        where: { id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.price !== undefined && { price: input.price }),
          ...(input.stock !== undefined && { stock: input.stock }),
        },
      });
    },
    deleteProduct: async (_, { id }) => {
      await prisma.product.delete({
        where: { id },
      });
      return true;
    },
  },
};

export default resolvers;
