import { Resolvers } from '../generated/graphql';
import { AuthenticationError } from '@marketmesh/utils';
import prisma from '../lib/prisma';

const resolvers: Resolvers = {
  Order: {
    customer: (order) => ({ __typename: 'User', id: order.userId }),
    items: (order) => prisma.orderItem.findMany({ where: { orderId: order.id } }),
    total: async (order, _, __, info) => {
      const items = await prisma.orderItem.findMany({ where: { orderId: order.id } });
      const productIds = items.map((item) => item.productId);
      const products = info.variableValues.representations
        .filter((rep: any) => rep.__typename === 'Product' && productIds.includes(rep.id))
        .reduce((acc: any, rep: any) => {
          acc[rep.id] = rep;
          return acc;
        }, {});
      return items.reduce((acc, item) => acc + products[item.productId].price * item.quantity, 0);
    },
  },
  OrderItem: {
    product: (item) => ({ __typename: 'Product', id: item.productId }),
  },
  Product: {
    __resolveReference: (product) => {
      return product;
    },
  },
  Query: {
    cart: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError();
      return prisma.order.findFirst({ where: { userId: user.userId, status: 'DRAFT' }, include: { items: true } });
    },
    order: async (_, { id }, { user }) => {
      if (!user) throw new AuthenticationError();
      const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
      if (order && order.userId !== user.userId) throw new AuthenticationError();
      return order;
    },
    myOrders: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError();
      return prisma.order.findMany({ where: { userId: user.userId, NOT: { status: 'DRAFT' } }, include: { items: true } });
    },
  },
  Mutation: {
    addProductToCart: async (_, { productId, quantity }, { user }) => {
      if (!user) throw new AuthenticationError();
      let cart = await prisma.order.findFirst({ where: { userId: user.userId, status: 'DRAFT' } });
      if (!cart) {
        cart = await prisma.order.create({ data: { userId: user.userId, status: 'DRAFT' } });
      }
      await prisma.orderItem.create({
        data: { orderId: cart.id, productId, quantity, price: 0 }, // Price is a placeholder
      });
      return prisma.order.findUnique({ where: { id: cart.id }, include: { items: true } });
    },
  },
};

export default resolvers;