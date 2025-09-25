import { PrismaClient, OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import { resolvers } from '../resolvers/orderResolver';

// Mock Prisma client
jest.mock('@prisma/client', () => {
  const mockOrder = {
    id: 'order-123',
    customerId: 'user-123',
    status: 'PENDING',
    total: 99.99,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PENDING',
    shippingAddress: {
      street: '123 Main St',
      city: 'Anytown',
      postalCode: '12345',
      country: 'USA',
    },
    items: [
      {
        id: 'item-1',
        productId: 'product-1',
        quantity: 1,
        price: 99.99,
        total: 99.99,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      order: {
        findUnique: jest.fn().mockResolvedValue(mockOrder),
        findMany: jest.fn().mockResolvedValue([mockOrder]),
        create: jest.fn().mockResolvedValue(mockOrder),
        update: jest.fn().mockResolvedValue(mockOrder),
      },
      orderItem: {
        create: jest.fn().mockResolvedValue(mockOrder.items[0]),
      },
    })),
    OrderStatus,
    PaymentStatus,
    PaymentMethod,
  };
});

describe('Order Resolver', () => {
  let prisma: PrismaClient;
  const mockContext = { userId: 'user-123', role: 'CUSTOMER' };
  const adminContext = { userId: 'admin-1', role: 'ADMIN' };

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Query', () => {
    it('should return an order by ID', async () => {
      const result = await resolvers.Query.order(
        {},
        { id: 'order-123' },
        mockContext,
        {} as any
      );

      expect(result).toBeDefined();
      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'order-123' },
        include: { items: true },
      });
    });

    it('should return orders for the current user', async () => {
      const result = await resolvers.Query.myOrders(
        {},
        { status: 'PENDING', page: 1, limit: 10 },
        mockContext,
        {} as any
      );

      expect(Array.isArray(result)).toBe(true);
      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: { customerId: 'user-123', status: 'PENDING' },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      });
    });

    it('should return all orders for admin', async () => {
      const result = await resolvers.Query.allOrders(
        {},
        { status: 'PENDING', customerId: 'user-123', page: 1, limit: 10 },
        adminContext,
        {} as any
      );

      expect(Array.isArray(result)).toBe(true);
      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: { status: 'PENDING', customerId: 'user-123' },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      });
    });
  });

  describe('Mutation', () => {
    it('should create a new order', async () => {
      const input = {
        items: [
          { productId: 'product-1', quantity: 1 },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Anytown',
          postalCode: '12345',
          country: 'USA',
        },
        paymentMethod: 'CREDIT_CARD',
      };

      const result = await resolvers.Mutation.createOrder(
        {},
        { input },
        mockContext,
        {} as any
      );

      expect(result).toBeDefined();
      expect(prisma.order.create).toHaveBeenCalled();
    });

    it('should update order status (admin only)', async () => {
      const result = await resolvers.Mutation.updateOrderStatus(
        {},
        { id: 'order-123', status: 'PROCESSING' },
        adminContext,
        {} as any
      );

      expect(result).toBeDefined();
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-123' },
        data: { status: 'PROCESSING' },
        include: { items: true },
      });
    });
  });
});
