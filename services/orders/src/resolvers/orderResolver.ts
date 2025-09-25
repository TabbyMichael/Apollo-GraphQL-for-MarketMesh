import { PrismaClient, OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import { Resolvers } from '../generated/graphql';

const prisma = new PrismaClient();

const resolvers: Resolvers = {
  Order: {
    // Resolve the customer field by returning a reference to the User type
    customer: (order) => {
      return { __typename: 'User', id: order.customerId };
    },
    // Resolve the items field
    items: async (order) => {
      const items = await prisma.orderItem.findMany({
        where: { orderId: order.id },
      });
      
      return items.map(item => ({
        ...item,
        product: { __typename: 'Product', id: item.productId },
      }));
    },
    // Parse the shipping address from JSON
    shippingAddress: (order) => {
      return order.shippingAddress as any;
    },
    // Parse the billing address from JSON if it exists
    billingAddress: (order) => {
      return order.billingAddress as any || null;
    },
  },
  
  OrderItem: {
    // Resolve the product field by returning a reference to the Product type
    product: (item) => {
      return { __typename: 'Product', id: item.productId };
    },
    // Resolve the order field
    order: (item) => {
      return prisma.order.findUnique({
        where: { id: item.orderId },
      }) as any;
    },
  },

  Query: {
    // Get order by ID
    order: async (_, { id }, { userId, role }) => {
      const order = await prisma.order.findUnique({
        where: { id },
        include: { items: true },
      });

      // Only allow the customer or admin to view the order
      if (order && order.customerId !== userId && role !== 'ADMIN') {
        throw new Error('Not authorized to view this order');
      }

      return order as any;
    },

    // Get orders for the current user
    myOrders: async (_, { status, page = 1, limit = 20 }, { userId }) => {
      if (!userId) throw new Error('Not authenticated');
      
      const skip = (page - 1) * limit;
      const where = {
        customerId: userId,
        ...(status && { status }),
      };

      const orders = await prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      });

      return orders as any[];
    },

    // Get all orders (admin only)
    allOrders: async (_, { status, customerId, page = 1, limit = 20 }, { role }) => {
      if (role !== 'ADMIN') {
        throw new Error('Not authorized');
      }
      
      const skip = (page - 1) * limit;
      const where = {
        ...(status && { status }),
        ...(customerId && { customerId }),
      };

      const orders = await prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      });

      return orders as any[];
    },
  },

  Mutation: {
    // Create a new order
    createOrder: async (_, { input }, { userId }) => {
      if (!userId) throw new Error('Not authenticated');

      const { items, shippingAddress, billingAddress, paymentMethod } = input;

      // In a real app, you would validate the items (check stock, prices, etc.)
      // and calculate the total
      const orderItems = await Promise.all(
        items.map(async (item) => {
          // In a real app, you would fetch the product to get the current price
          // and validate availability
          const product = { price: 0 }; // Replace with actual product fetch
          
          return {
            productId: item.productId,
            quantity: item.quantity,
            price: product.price,
            total: product.price * item.quantity,
          };
        })
      );

      // Calculate the order total
      const total = orderItems.reduce((sum, item) => sum + item.total, 0);

      // Create the order
      const order = await prisma.order.create({
        data: {
          customerId: userId,
          status: 'PENDING',
          total,
          paymentMethod,
          paymentStatus: 'PENDING',
          shippingAddress: shippingAddress as any,
          billingAddress: (billingAddress || shippingAddress) as any,
          items: {
            create: orderItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              total: item.total,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      return order as any;
    },

    // Update order status (admin only)
    updateOrderStatus: async (_, { id, status }, { role }) => {
      if (role !== 'ADMIN') {
        throw new Error('Not authorized');
      }

      const order = await prisma.order.update({
        where: { id },
        data: { status },
        include: { items: true },
      });

      return order as any;
    },

    // Cancel an order
    cancelOrder: async (_, { id }, { userId, role }) => {
      const order = await prisma.order.findUnique({
        where: { id },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Only the customer or admin can cancel the order
      if (order.customerId !== userId && role !== 'ADMIN') {
        throw new Error('Not authorized to cancel this order');
      }

      // Only allow cancelling if the order is still pending or processing
      if (!['PENDING', 'PROCESSING'].includes(order.status)) {
        throw new Error('Cannot cancel an order that is already shipped or delivered');
      }

      const updatedOrder = await prisma.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: { items: true },
      });

      return updatedOrder as any;
    },

    // Process a payment for an order
    processPayment: async (_, { orderId, paymentDetails }, { userId }) => {
      if (!userId) throw new Error('Not authenticated');

      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Only the customer can pay for their own order
      if (order.customerId !== userId) {
        throw new Error('Not authorized to pay for this order');
      }

      // In a real app, you would integrate with a payment gateway here
      // For now, we'll just simulate a successful payment
      const paymentSuccessful = true; // Replace with actual payment processing

      if (paymentSuccessful) {
        const updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'PAID',
            paymentDetails: paymentDetails as any,
            status: 'PROCESSING', // Move to processing after payment
          },
          include: { items: true },
        });

        return {
          success: true,
          message: 'Payment processed successfully',
          transactionId: `tx_${Date.now()}`,
          order: updatedOrder as any,
        };
      } else {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'FAILED',
            paymentDetails: paymentDetails as any,
          },
        });

        return {
          success: false,
          message: 'Payment failed',
          order: order as any,
        };
      }
    },
  },
};

export default resolvers;
