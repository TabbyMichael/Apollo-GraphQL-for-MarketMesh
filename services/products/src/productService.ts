import { PrismaClient, UserRole } from '@prisma/client';
import { ForbiddenError, UserInputError } from 'apollo-server-errors';
import { CreateProductInput, UpdateProductInput } from './generated/graphql';

export class ProductService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async products(
    name: string | null | undefined,
    minPrice: number | null | undefined,
    maxPrice: number | null | undefined,
    sellerId: string | null | undefined,
    page: number = 1,
    limit: number = 20
  ) {
    const skip = (page - 1) * limit;
    const where: any = {
      ...(name && { name: { contains: name, mode: 'insensitive' } }),
      ...(sellerId && { sellerId }),
    };

    if (minPrice !== undefined && maxPrice !== undefined) {
      where.price = { gte: minPrice, lte: maxPrice };
    } else if (minPrice !== undefined) {
      where.price = { gte: minPrice };
    } else if (maxPrice !== undefined) {
      where.price = { lte: maxPrice };
    }

    return this.prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async product(id: string) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  async createProduct(input: CreateProductInput, sellerId: string) {
    // The sellerId from the input should be validated against the authenticated user
    if (input.sellerId !== sellerId) {
        throw new ForbiddenError('You can only create products for yourself.');
    }
    return this.prisma.product.create({
      data: {
        name: input.name,
        description: input.description,
        price: input.price,
        stock: input.stock,
        sellerId: sellerId,
      },
    });
  }

  async updateProduct(id: string, input: UpdateProductInput, userId: string, userRole: UserRole) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new UserInputError('Product not found');
    }

    if (product.sellerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError('Not authorized to update this product');
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.price !== undefined && { price: input.price }),
        ...(input.stock !== undefined && { stock: input.stock }),
      },
    });
  }

  async deleteProduct(id: string, userId: string, userRole: UserRole) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new UserInputError('Product not found');
    }

    if (product.sellerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError('Not authorized to delete this product');
    }

    await this.prisma.product.delete({ where: { id } });
    return true;
  }
}